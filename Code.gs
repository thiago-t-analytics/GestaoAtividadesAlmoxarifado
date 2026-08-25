/**
 * ============================================================================
 * SISTEMA DE GESTÃO DE ATIVIDADES - ALMOXARIFADO HOSPITALAR
 * Backend Google Apps Script (Code.gs)
 * ============================================================================
 * 
 * Banco de Dados: Google Sheets (8 Abas)
 * 1. ATIVIDADES     -> Modelos e parâmetros de atividades recorrentes e pontuais
 * 2. EXECUCOES      -> Instâncias diárias de execução de tarefas
 * 3. OCORRENCIAS    -> Registro de desvios, faltas, avarias e desvios de temperatura
 * 4. ALERTAS        -> Quadro de avisos com níveis de criticidade por cores
 * 5. CONFIGURACOES  -> Parâmetros gerais e regras do almoxarifado
 * 6. AUDITORIA      -> Trilha completa de auditoria e logs de operação
 * 7. ITENS          -> Catálogo de suprimentos hospitalares (saldo e localização)
 * 8. USUARIOS       -> Usuários fixos (Thiago, Marcel, Rafael)
 * 
 * Regras de Negócio Implementadas:
 * - Acesso livre sem tela de login: 3 usuários fixos com alternância imediata
 * - Gatilho Automático: Ocorrência com "Necessita Ação" cria tarefa para TODOS os assistentes
 * - CacheService (TTL 5 minutos) com invalidação inteligente nas mutações
 * - Resposta padronizada em formato JSON { ok: boolean, dados: any, mensagem?: string }
 */

// ============================================================================
// CONSTANTES GLOBAIS
// ============================================================================
var CACHE_TTL_SECS = 300; // 5 minutos
var USUARIOS_FIXOS = ["Thiago", "Marcel", "Rafael"];

var ABAS = {
  ATIVIDADES: "ATIVIDADES",
  EXECUCOES: "EXECUCOES",
  OCORRENCIAS: "OCORRENCIAS",
  ALERTAS: "ALERTAS",
  CONFIGURACOES: "CONFIGURACOES",
  AUDITORIA: "AUDITORIA",
  ITENS: "ITENS",
  USUARIOS: "USUARIOS"
};

// ============================================================================
// PONTO DE ENTRADA DO WEB APP
// ============================================================================

/**
 * Manipulador de requisições HTTP GET do Google Apps Script
 * Renderiza o frontend Index.html com viewport responsiva
 */
function doGet(e) {
  var template = HtmlService.createTemplateFromFile("Index");
  return template.evaluate()
    .setTitle("Gestão de Almoxarifado Hospitalar")
    .addMetaTag("viewport", "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Inclui arquivos parciais no HTML se necessário
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ============================================================================
// SETUP & INICIALIZAÇÃO DA PLANILHA GOOGLE SHEETS
// ============================================================================

/**
 * Função de inicialização e setup completo
 * Cria as 8 abas com cabeçalhos estilizados em azul (#1565c0) e dados demonstrativos
 */
function setup() {
  return inicializarSistema();
}

function inicializarSistema() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      throw new Error("Planilha ativa não encontrada. Abra a planilha vinculada ao script.");
    }

    // 1. Aba ATIVIDADES
    var abaAtividades = _obterOuCriarAba_(ss, ABAS.ATIVIDADES, [
      "ID", "Titulo", "Descricao", "Categoria", "Tipo", "Periodicidade", 
      "DiaSemana", "DiaMes", "Responsavel", "PrazoDias", "Instrucoes", 
      "ItensRelacionados", "ChecklistJSON", "CriadoEm", "Status"
    ]);

    // 2. Aba EXECUCOES
    var abaExecucoes = _obterOuCriarAba_(ss, ABAS.EXECUCOES, [
      "ID_Execucao", "ID_Atividade", "Titulo", "Responsavel", "DataExecucao", 
      "DataLimite", "Status", "ChecklistProgressoJSON", "ConcluidoPor", 
      "ConcluidoEm", "MensagensChatJSON", "OrigemOcorrenciaID"
    ]);

    // 3. Aba OCORRENCIAS
    var abaOcorrencias = _obterOuCriarAba_(ss, ABAS.OCORRENCIAS, [
      "ID_Ocorrencia", "Setor", "Categoria", "Tipo", "ItemCodigoNome", 
      "Descricao", "NecessitaAcao", "AtividadeGeradaID", "RegistradoPor", 
      "DataRegistro", "Status"
    ]);

    // 4. Aba ALERTAS
    var abaAlertas = _obterOuCriarAba_(ss, ABAS.ALERTAS, [
      "ID_Alerta", "Mensagem", "Prioridade", "Destinatario", "CriadoPor", 
      "DataCriacao", "DataExpiracao", "Ativo"
    ]);

    // 5. Aba CONFIGURACOES
    var abaConfig = _obterOuCriarAba_(ss, ABAS.CONFIGURACOES, [
      "Chave", "Valor", "Descricao"
    ]);

    // 6. Aba AUDITORIA
    var abaAuditoria = _obterOuCriarAba_(ss, ABAS.AUDITORIA, [
      "ID_Log", "DataHora", "Usuario", "Acao", "Entidade", "EntidadeID", "Detalhes"
    ]);

    // 7. Aba ITENS
    var abaItens = _obterOuCriarAba_(ss, ABAS.ITENS, [
      "Codigo", "NomeItem", "Categoria", "Localizacao", "EstoqueMinimo", "EstoqueAtual", "Unidade"
    ]);

    // 8. Aba USUARIOS
    var abaUsuarios = _obterOuCriarAba_(ss, ABAS.USUARIOS, [
      "ID", "Nome", "Cargo", "Email"
    ]);

    // Popular dados de exemplo se estiverem vazias
    _popularDadosExemplo_(abaAtividades, abaExecucoes, abaOcorrencias, abaAlertas, abaConfig, abaItens, abaUsuarios);

    limparCache();
    _registrarLog_("SETUP", "SISTEMA", "ALL", "Inicialização da estrutura de 8 abas concluída com sucesso.");

    return { 
      ok: true, 
      dados: { mensagem: "Sistema inicializado com sucesso com 8 abas prontas!" } 
    };
  } catch (error) {
    Logger.log("Erro na inicialização: " + error.toString());
    return { ok: false, mensagem: "Erro no setup: " + error.message };
  }
}

// ============================================================================
// LEITURA DE DADOS & CACHING (getDados)
// ============================================================================

/**
 * Retorna todos os dados consolidados do almoxarifado para o frontend
 * @param {string} usuarioAtivo - Filtro opcional de usuário ativo
 * @return {Object} { ok: boolean, dados: Object }
 */
function getDados(usuarioAtivo) {
  try {
    var cache = CacheService.getScriptCache();
    var cacheKey = "almox_dados_v2";
    var cached = cache.get(cacheKey);

    var dados;
    if (cached) {
      try {
        dados = JSON.parse(cached);
      } catch (e) {
        dados = null;
      }
    }

    if (!dados) {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      if (!ss) {
        return { ok: false, mensagem: "Planilha não vinculada." };
      }

      dados = {
        atividades: _lerAbaComoObjetos_(ss, ABAS.EXECUCOES),
        modelosAtividades: _lerAbaComoObjetos_(ss, ABAS.ATIVIDADES),
        ocorrencias: _lerAbaComoObjetos_(ss, ABAS.OCORRENCIAS),
        alertas: _lerAbaComoObjetos_(ss, ABAS.ALERTAS),
        itens: _lerAbaComoObjetos_(ss, ABAS.ITENS),
        usuarios: _lerAbaComoObjetos_(ss, ABAS.USUARIOS),
        timestamp: new Date().toISOString()
      };

      // Parser de campos JSON
      dados.atividades.forEach(function(act) {
        act.checklist = _parseJSONSeguro_(act.ChecklistProgressoJSON || act.ChecklistJSON, []);
        act.messages = _parseJSONSeguro_(act.MensagensChatJSON, []);
        act.id = act.ID_Execucao || act.ID;
        act.title = act.Titulo;
        act.description = act.Descricao || "";
        act.responsible = act.Responsavel;
        act.status = act.Status;
        act.dueDate = act.DataLimite ? _formatarDataStr_(act.DataLimite) : "";
        act.executionDate = act.DataExecucao ? _formatarDataStr_(act.DataExecucao) : "";
        act.originOccurrenceId = act.OrigemOcorrenciaID || "";
        act.category = act.Categoria || "Rotina Geral";
        act.periodicity = act.Periodicidade || "Diária";
        act.priority = act.Prioridade || (act.OrigemOcorrenciaID ? "Urgente" : "Normal");
      });

      dados.ocorrencias.forEach(function(oc) {
        oc.id = oc.ID_Ocorrencia || oc.ID;
        oc.sector = oc.Setor;
        oc.category = oc.Categoria;
        oc.type = oc.Tipo;
        oc.itemCode = oc.ItemCodigoNome;
        oc.description = oc.Descricao;
        oc.requiresAction = (oc.NecessitaAcao === true || oc.NecessitaAcao === "TRUE" || oc.NecessitaAcao === "SIM");
        oc.createdActivityId = oc.AtividadeGeradaID;
        oc.registeredBy = oc.RegistradoPor;
        oc.registeredAt = oc.DataRegistro ? _formatarDataStr_(oc.DataRegistro) : "";
        oc.status = oc.Status;
      });

      dados.alertas.forEach(function(al) {
        al.id = al.ID_Alerta || al.ID;
        al.message = al.Mensagem;
        al.priority = al.Prioridade;
        al.targetUser = al.Destinatario;
        al.createdBy = al.CriadoPor;
        al.createdAt = al.DataCriacao ? _formatarDataStr_(al.DataCriacao) : "";
        al.expiresAt = al.DataExpiracao ? _formatarDataStr_(al.DataExpiracao) : "";
        al.active = (al.Ativo === true || al.Ativo === "TRUE" || al.Ativo === "SIM");
      });

      dados.itens.forEach(function(it) {
        it.code = it.Codigo;
        it.name = it.NomeItem;
        it.category = it.Categoria;
        it.location = it.Localizacao;
        it.minStock = Number(it.EstoqueMinimo) || 0;
        it.currentStock = Number(it.EstoqueAtual) || 0;
        it.unit = it.Unidade;
      });

      // Salvar em cache
      try {
        cache.put(cacheKey, JSON.stringify(dados), CACHE_TTL_SECS);
      } catch (e) {
        // Cache overflow fallback
      }
    }

    return { ok: true, dados: dados };
  } catch (error) {
    Logger.log("Erro em getDados: " + error.toString());
    return { ok: false, mensagem: "Erro ao obter dados: " + error.message };
  }
}

// ============================================================================
// MUTAÇÕES DE ATIVIDADES & EXECUÇÕES
// ============================================================================

/**
 * Cria uma nova atividade e sua execução inicial
 */
function criarAtividade(dados) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var abaAtividades = ss.getSheetByName(ABAS.ATIVIDADES);
    var abaExecucoes = ss.getSheetByName(ABAS.EXECUCOES);

    var idAtividade = "ACT-" + Utilities.getUuid().substring(0, 8).toUpperCase();
    var hoje = new Date();
    var hojeStr = _formatarDataISO_(hoje);
    var prazoDias = Number(dados.deadlineDays || dados.prazoDias) || 1;
    var dataLimite = new Date(hoje.getTime() + prazoDias * 24 * 60 * 60 * 1000);
    var dataLimiteStr = _formatarDataISO_(dataLimite);

    var checklistJSON = JSON.stringify(dados.checklist || []);

    // 1. Gravar em ATIVIDADES
    abaAtividades.appendRow([
      idAtividade,
      dados.title || dados.titulo,
      dados.description || dados.descricao || "",
      dados.category || dados.categoria || "Geral",
      dados.type || dados.tipo || "Operacional",
      dados.periodicity || dados.periodicidade || "Pontual",
      dados.weekDay || "",
      dados.monthDay || "",
      dados.responsible || dados.responsavel || "Todos",
      prazoDias,
      dados.instructions || dados.instrucoes || "",
      dados.relatedItems ? JSON.stringify(dados.relatedItems) : "[]",
      checklistJSON,
      hojeStr,
      "Ativa"
    ]);

    // 2. Gravar em EXECUCOES
    var idExec = "EXEC-" + Utilities.getUuid().substring(0, 8).toUpperCase();
    abaExecucoes.appendRow([
      idExec,
      idAtividade,
      dados.title || dados.titulo,
      dados.responsible || dados.responsavel || "Todos",
      hojeStr,
      dataLimiteStr,
      "Pendente",
      checklistJSON,
      "",
      "",
      "[]",
      dados.originOccurrenceId || ""
    ]);

    limparCache();
    _registrarLog_(dados.creator || "Thiago", "CRIAR", "ATIVIDADE", idAtividade, "Criada: " + (dados.title || dados.titulo));

    return { 
      ok: true, 
      dados: { id: idExec, idAtividade: idAtividade }, 
      mensagem: "Atividade criada com sucesso!" 
    };
  } catch (error) {
    return { ok: false, mensagem: "Erro ao criar atividade: " + error.message };
  }
}

/**
 * Conclui uma atividade/execução com registro do operador
 */
function concluirAtividade(idExecucao, usuario) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var aba = ss.getSheetByName(ABAS.EXECUCOES);
    var dados = aba.getDataRange().getValues();

    var colId = 0; // ID_Execucao
    var colStatus = 6;
    var colConcluidoPor = 8;
    var colConcluidoEm = 9;

    var linhaAlvo = -1;
    for (var i = 1; i < dados.length; i++) {
      if (String(dados[i][colId]) === String(idExecucao)) {
        linhaAlvo = i + 1;
        break;
      }
    }

    if (linhaAlvo === -1) {
      return { ok: false, mensagem: "Atividade não encontrada na base." };
    }

    var agoraStr = new Date().toISOString();
    aba.getRange(linhaAlvo, colStatus + 1).setValue("Concluída");
    aba.getRange(linhaAlvo, colConcluidoPor + 1).setValue(usuario || "Marcel");
    aba.getRange(linhaAlvo, colConcluidoEm + 1).setValue(agoraStr);

    limparCache();
    _registrarLog_(usuario || "Operador", "CONCLUIR", "EXECUCAO", idExecucao, "Atividade concluída");

    return { ok: true, mensagem: "Atividade concluída com sucesso!" };
  } catch (error) {
    return { ok: false, mensagem: "Erro ao concluir: " + error.message };
  }
}

/**
 * Atualiza o progresso do checklist e quantidades contadas
 */
function salvarChecklistProgresso(idExecucao, checklist, usuario) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var aba = ss.getSheetByName(ABAS.EXECUCOES);
    var dados = aba.getDataRange().getValues();

    var colId = 0;
    var colChecklist = 7; // ChecklistProgressoJSON

    var linhaAlvo = -1;
    for (var i = 1; i < dados.length; i++) {
      if (String(dados[i][colId]) === String(idExecucao)) {
        linhaAlvo = i + 1;
        break;
      }
    }

    if (linhaAlvo === -1) {
      return { ok: false, mensagem: "Execução não encontrada." };
    }

    var jsonStr = typeof checklist === "string" ? checklist : JSON.stringify(checklist);
    aba.getRange(linhaAlvo, colChecklist + 1).setValue(jsonStr);

    limparCache();
    return { ok: true, mensagem: "Checklist atualizado." };
  } catch (error) {
    return { ok: false, mensagem: "Erro ao salvar checklist: " + error.message };
  }
}

/**
 * Envia uma mensagem no chat da atividade
 */
function enviarMensagemChat(idExecucao, texto, autor) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var aba = ss.getSheetByName(ABAS.EXECUCOES);
    var dados = aba.getDataRange().getValues();

    var colId = 0;
    var colChat = 10; // MensagensChatJSON

    var linhaAlvo = -1;
    var msgsAtuais = [];

    for (var i = 1; i < dados.length; i++) {
      if (String(dados[i][colId]) === String(idExecucao)) {
        linhaAlvo = i + 1;
        msgsAtuais = _parseJSONSeguro_(dados[i][colChat], []);
        break;
      }
    }

    if (linhaAlvo === -1) {
      return { ok: false, mensagem: "Atividade não encontrada." };
    }

    var novaMsg = {
      id: "msg-" + Utilities.getUuid().substring(0, 6),
      author: autor || "Operador",
      text: texto,
      timestamp: new Date().toISOString()
    };

    msgsAtuais.push(novaMsg);
    aba.getRange(linhaAlvo, colChat + 1).setValue(JSON.stringify(msgsAtuais));

    limparCache();
    return { ok: true, dados: novaMsg };
  } catch (error) {
    return { ok: false, mensagem: "Erro no chat: " + error.message };
  }
}

// ============================================================================
// OCORRÊNCIAS & AUTOMAÇÃO DE AÇÃO CORRETIVA
// ============================================================================

/**
 * Cria uma nova ocorrência hospitalar
 * REGRA DE NEGÓCIO: Se "NecessitaAcao" for verdadeiro, gera automaticamente
 * uma atividade prioritária para TODOS os assistentes
 */
function criarOcorrencia(dados, usuario) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var abaOcorrencias = ss.getSheetByName(ABAS.OCORRENCIAS);

    var idOcorrencia = "OC-" + Utilities.getUuid().substring(0, 6).toUpperCase();
    var dataHoje = _formatarDataISO_(new Date());
    var necessitaAcao = (dados.requiresAction === true || dados.requiresAction === "TRUE" || dados.necessitaAcao === true);
    var idAtividadeGerada = "";

    // Automação: Gerar Atividade se necessita ação
    if (necessitaAcao) {
      var resAtiv = criarAtividade({
        title: "Ação Corretiva: " + (dados.category || "Desvio") + " - " + (dados.itemCode || dados.sector || "Almoxarifado"),
        description: "Ocorrência " + idOcorrencia + ": " + (dados.description || "Verificação imediata requerida.") + " | Setor: " + (dados.sector || "N/A"),
        category: "Auditoria / Ocorrência",
        responsible: "Todos",
        periodicity: "Pontual",
        deadlineDays: 1,
        originOccurrenceId: idOcorrencia,
        checklist: [
          { id: "c1", label: "Inspeção física no setor de origem", targetQuantity: 1, countedQuantity: 0, unit: "un", completed: false },
          { id: "c2", label: "Segregar item em quarentena e etiquetar", targetQuantity: 1, countedQuantity: 0, unit: "un", completed: false },
          { id: "c3", label: "Ajuste de saldo no sistema de estoque", targetQuantity: 1, countedQuantity: 0, unit: "un", completed: false }
        ]
      });

      if (resAtiv.ok && resAtiv.dados) {
        idAtividadeGerada = resAtiv.dados.id;
      }
    }

    abaOcorrencias.appendRow([
      idOcorrencia,
      dados.sector || dados.setor || "Almoxarifado Central",
      dados.category || dados.categoria || "Geral",
      dados.type || dados.tipo || "Desvio Operacional",
      dados.itemCode || dados.itemCodigoNome || "",
      dados.description || dados.descricao || "",
      necessitaAcao ? "SIM" : "NÃO",
      idAtividadeGerada,
      usuario || dados.registeredBy || "Rafael",
      dataHoje,
      "Em Aberto"
    ]);

    limparCache();
    _registrarLog_(usuario || "Operador", "CRIAR", "OCORRENCIA", idOcorrencia, "Ocorrência registrada. Ação gerada: " + (idAtividadeGerada || "Nenhuma"));

    return { 
      ok: true, 
      dados: { 
        id: idOcorrencia, 
        idAtividadeGerada: idAtividadeGerada 
      }, 
      mensagem: "Ocorrência registrada com sucesso!" 
    };
  } catch (error) {
    return { ok: false, mensagem: "Erro ao criar ocorrência: " + error.message };
  }
}

// ============================================================================
// GESTÃO DE ALERTAS
// ============================================================================

/**
 * Cria um alerta no quadro de avisos
 */
function criarAlerta(dados, usuario) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var aba = ss.getSheetByName(ABAS.ALERTAS);

    var idAlerta = "ALT-" + Utilities.getUuid().substring(0, 6).toUpperCase();
    var dataHoje = _formatarDataISO_(new Date());

    aba.appendRow([
      idAlerta,
      dados.message || dados.mensagem,
      dados.priority || dados.prioridade || "Amarelo",
      dados.targetUser || dados.destinatario || "Todos",
      usuario || "Thiago",
      dataHoje,
      dados.expiresAt || dados.dataExpiracao || "",
      "SIM"
    ]);

    limparCache();
    return { ok: true, dados: { id: idAlerta }, mensagem: "Alerta publicado." };
  } catch (error) {
    return { ok: false, mensagem: "Erro ao criar alerta: " + error.message };
  }
}

/**
 * Desativa um alerta do quadro
 */
function desativarAlerta(idAlerta) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var aba = ss.getSheetByName(ABAS.ALERTAS);
    var dados = aba.getDataRange().getValues();

    var colId = 0;
    var colAtivo = 7;

    for (var i = 1; i < dados.length; i++) {
      if (String(dados[i][colId]) === String(idAlerta)) {
        aba.getRange(i + 1, colAtivo + 1).setValue("NÃO");
        break;
      }
    }

    limparCache();
    return { ok: true, mensagem: "Alerta removido." };
  } catch (error) {
    return { ok: false, mensagem: "Erro ao desativar: " + error.message };
  }
}

// ============================================================================
// SINCRONIZAÇÃO DIÁRIA & RECORRÊNCIAS
// ============================================================================

/**
 * Sincroniza recorrências diárias e atualiza status de atraso
 * Pode ser agendada via Acionador baseada em tempo (Ex: 06:00 diariamente)
 */
function sincronizarExecucoes() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var abaExec = ss.getSheetByName(ABAS.EXECUCOES);
    var dados = abaExec.getDataRange().getValues();

    var hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    var atualizados = 0;
    for (var i = 1; i < dados.length; i++) {
      var status = dados[i][6];
      var dataLimiteStr = dados[i][5];

      if (status === "Pendente" || status === "Agendada") {
        if (dataLimiteStr) {
          var dataLimite = new Date(dataLimiteStr);
          dataLimite.setHours(0, 0, 0, 0);

          if (dataLimite < hoje) {
            abaExec.getRange(i + 1, 7).setValue("Em atraso");
            atualizados++;
          }
        }
      }
    }

    limparCache();
    Logger.log("Sincronização concluída. Itens atualizados para Em Atraso: " + atualizados);
    return { ok: true, dados: { atualizados: atualizados } };
  } catch (error) {
    Logger.log("Erro na sincronização: " + error.toString());
    return { ok: false, mensagem: error.message };
  }
}

// ============================================================================
// CACHE & UTILITÁRIOS INTERNOS
// ============================================================================

function limparCache() {
  try {
    var cache = CacheService.getScriptCache();
    cache.remove("almox_dados_v2");
  } catch (e) {}
}

function _obterOuCriarAba_(ss, nomeAba, cabecalhos) {
  var aba = ss.getSheetByName(nomeAba);
  if (!aba) {
    aba = ss.insertSheet(nomeAba);
  }

  // Estilização do cabeçalho
  if (cabecalhos && cabecalhos.length > 0) {
    var rangeCabecalho = aba.getRange(1, 1, 1, cabecalhos.length);
    rangeCabecalho.setValues([cabecalhos]);
    rangeCabecalho.setBackground("#1565c0");
    rangeCabecalho.setFontColor("#ffffff");
    rangeCabecalho.setFontWeight("bold");
    rangeCabecalho.setHorizontalAlignment("center");
    aba.setFrozenRows(1);
  }
  return aba;
}

function _lerAbaComoObjetos_(ss, nomeAba) {
  var aba = ss.getSheetByName(nomeAba);
  if (!aba) return [];

  var dados = aba.getDataRange().getValues();
  if (dados.length <= 1) return [];

  var cabecalhos = dados[0];
  var lista = [];

  for (var i = 1; i < dados.length; i++) {
    var obj = {};
    var linha = dados[i];
    var linhaVazia = true;

    for (var j = 0; j < cabecalhos.length; j++) {
      var chave = cabecalhos[j];
      var valor = linha[j];
      if (valor !== "" && valor !== null && valor !== undefined) {
        linhaVazia = false;
      }
      obj[chave] = valor;
    }

    if (!linhaVazia) {
      lista.push(obj);
    }
  }
  return lista;
}

function _parseJSONSeguro_(str, fallback) {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
}

function _formatarDataISO_(data) {
  if (!(data instanceof Date)) data = new Date(data);
  return Utilities.formatDate(data, Session.getScriptTimeZone() || "America/Sao_Paulo", "yyyy-MM-dd");
}

function _formatarDataStr_(val) {
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone() || "America/Sao_Paulo", "yyyy-MM-dd");
  }
  return String(val).split("T")[0];
}

function _registrarLog_(usuario, acao, entidade, entidadeId, detalhes) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var aba = ss.getSheetByName(ABAS.AUDITORIA);
    if (aba) {
      aba.appendRow([
        "LOG-" + Utilities.getUuid().substring(0, 8),
        new Date().toISOString(),
        usuario || "Sistema",
        acao,
        entidade,
        entidadeId,
        detalhes || ""
      ]);
    }
  } catch (e) {}
}

/**
 * Popula a planilha com dados iniciais se necessário
 */
function _popularDadosExemplo_(abaAtiv, abaExec, abaOc, abaAlt, abaCfg, abaItens, abaUsr) {
  var hojeStr = _formatarDataISO_(new Date());

  // USUARIOS
  if (abaUsr.getLastRow() <= 1) {
    abaUsr.appendRow(["usr-1", "Thiago", "Almoxarife", "thiago.almoxarife@hospital.local"]);
    abaUsr.appendRow(["usr-2", "Marcel", "Assistente", "marcel.assistente@hospital.local"]);
    abaUsr.appendRow(["usr-3", "Rafael", "Assistente", "rafael.assistente@hospital.local"]);
  }

  // ITENS DO CATÁLOGO
  if (abaItens.getLastRow() <= 1) {
    var itensIniciais = [
      ["MED-001", "Dipirona 500mg/mL Ampola 2mL", "Medicamentos", "Rack A-01", 500, 1200, "amp"],
      ["MED-002", "Paracetamol 500mg Comprimido", "Medicamentos", "Rack A-02", 1000, 3400, "cp"],
      ["MAT-101", "Seringa Descartável 5mL c/ Agulha", "Descartáveis", "Palete B-04", 800, 450, "un"],
      ["MAT-102", "Seringa Descartável 10mL s/ Agulha", "Descartáveis", "Palete B-05", 600, 1800, "un"],
      ["MAT-103", "Agulha Hipodérmica 25x7 (cx 100)", "Descartáveis", "Rack B-01", 50, 120, "cx"],
      ["EPI-201", "Luva de Procedimento Tamanho M (cx 100)", "EPI", "Palete C-02", 100, 35, "cx"],
      ["EPI-202", "Luva Cirúrgica Estéril 7.5 (par)", "EPI", "Rack C-05", 200, 580, "par"],
      ["SAN-301", "Álcool em Gel 70% 500mL", "Saneantes", "Prateleira D-01", 80, 240, "fr"],
      ["SAN-302", "Clorexidina Degermante 4% 1L", "Saneantes", "Prateleira D-02", 40, 95, "fr"]
    ];
    itensIniciais.forEach(function(row) { abaItens.appendRow(row); });
  }

  // CONFIGURACOES
  if (abaCfg.getLastRow() <= 1) {
    abaCfg.appendRow(["HOSPITAL_NOME", "Hospital Central de Alta Complexidade", "Nome da Unidade Hospitalar"]);
    abaCfg.appendRow(["VERSAO_SISTEMA", "2.1.0-GAS", "Versão atual do aplicativo"]);
    abaCfg.appendRow(["HORARIO_CORTE_DIARIO", "16:00", "Horário limite para encerramento de tarefas"]);
  }

  // ALERTAS INICIAIS
  if (abaAlt.getLastRow() <= 1) {
    abaAlt.appendRow(["ALT-001", "Estoque de Seringas 5ml atingiu nível de segurança no Setor B-04.", "Vermelho", "Todos", "Thiago", hojeStr, "", "SIM"]);
    abaAlt.appendRow(["ALT-002", "Inspeção sanitária agendada para sexta-feira. Manter paletes limpos.", "Laranja", "Todos", "Thiago", hojeStr, "", "SIM"]);
  }

  // ATIVIDADES & EXECUÇÕES INICIAIS
  if (abaAtiv.getLastRow() <= 1) {
    var check1 = JSON.stringify([
      { id: "c1", label: "Conferir seringas 5mL físicas vs sistema", targetQuantity: 450, countedQuantity: 450, unit: "un", completed: true },
      { id: "c2", label: "Conferir seringas 10mL físicas vs sistema", targetQuantity: 1800, countedQuantity: 0, unit: "un", completed: false },
      { id: "c3", label: "Validar integridade das embalagens e lotes", targetQuantity: 1, countedQuantity: 0, unit: "un", completed: false }
    ]);

    abaAtiv.appendRow([
      "ACT-001", "Conferência de Seringas e Descartáveis", "Validar estoque físico vs sistema para todos os calibres no pavilhão norte.",
      "Conferência", "Operacional", "Diária", "", "", "Marcel", 1, "Realizar contagem cega nas prateleiras B-04 e B-05.", "[]", check1, hojeStr, "Ativa"
    ]);

    abaExec.appendRow([
      "EXEC-001", "ACT-001", "Conferência de Seringas e Descartáveis", "Marcel", hojeStr, hojeStr, "Pendente", check1, "", "", "[]", ""
    ]);

    var check2 = JSON.stringify([
      { id: "c1", label: "Contagem física das caixas de luvas M", targetQuantity: 35, countedQuantity: 0, unit: "cx", completed: false },
      { id: "c2", label: "Identificar lotes e validades críticas", targetQuantity: 1, countedQuantity: 0, unit: "un", completed: false }
    ]);

    abaAtiv.appendRow([
      "ACT-002", "Inventário Crítico: Luvas de Procedimento", "Inventário emergencial devido a divergência no faturamento.",
      "Inventário", "Urgente", "Pontual", "", "", "Rafael", 1, "Verificar Palete C-02.", "[]", check2, hojeStr, "Ativa"
    ]);

    abaExec.appendRow([
      "EXEC-002", "ACT-002", "Inventário Crítico: Luvas de Procedimento", "Rafael", hojeStr, hojeStr, "Em atraso", check2, "", "", "[]", ""
    ]);
  }
}
