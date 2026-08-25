/**
 * ============================================================================
 * SISTEMA DE GESTÃO DE ATIVIDADES - ALMOXARIFADO HOSPITALAR
 * Backend Google Apps Script (Code.gs)
 * ============================================================================
 * 
 * Estrutura de Abas da Planilha:
 * 1. ATIVIDADES     -> Modelos e parâmetros de atividades
 * 2. EXECUCOES      -> Instâncias diárias de tarefas
 * 3. OCORRENCIAS    -> Registro de desvios, avarias e faltas de materiais
 * 4. ALERTAS        -> Avisos gerais e direcionados com níveis de criticidade
 * 5. CONFIGURACOES  -> Parâmetros gerais do sistema e lista de usuários
 * 6. AUDITORIA      -> Trilha completa de auditoria e ações realizadas
 * 7. ITENS          -> Catálogo de suprimentos hospitalares (código, estoque, local)
 * 
 * Regras de Negócio:
 * - Sem tela de login externa: Usuários fixos "Thiago" (Almoxarife), "Marcel", "Rafael" (Assistentes)
 * - Flag "Necessita ação" em ocorrências gera tarefa automática para TODOS
 * - Todas as funções públicas retornam { ok: boolean, dados: any, mensagem?: string }
 * - Otimização via CacheService (TTL 5 minutos)
 */

// Constantes Globais
var CACHE_TTL_SECS = 300; // 5 minutos
var USUARIOS_FIXOS = ["Thiago", "Marcel", "Rafael"];
var ABAS = {
  ATIVIDADES: "ATIVIDADES",
  EXECUCOES: "EXECUCOES",
  OCORRENCIAS: "OCORRENCIAS",
  ALERTAS: "ALERTAS",
  CONFIGURACOES: "CONFIGURACOES",
  AUDITORIA: "AUDITORIA",
  ITENS: "ITENS"
};

/**
 * Ponto de entrada do Web App no Google Apps Script
 * Renderiza o frontend Index.html com meta tags responsivas.
 */
function doGet(e) {
  var template = HtmlService.createTemplateFromFile("Index");
  return template.evaluate()
    .setTitle("Gestão Almoxarifado Hospitalar")
    .addMetaTag("viewport", "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Inclui arquivos parciais no HTML (caso necessário no Apps Script)
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Função de Setup / Inicialização Completa da Planilha
 * Cria abas, cabeçalhos estilizados e dados demonstrativos.
 */
function setup() {
  return inicializarSistema();
}

/**
 * Inicializa a planilha criando as 7 abas com cabeçalhos e dados iniciais
 * @return {Object} { ok: boolean, dados: Object }
 */
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

    // Popula catálogo de itens caso esteja vazio
    if (abaItens.getLastRow() <= 1) {
      _popularItensIniciais_(abaItens);
    }

    // Popula configurações iniciais
    if (abaConfig.getLastRow() <= 1) {
      _popularConfiguracoesIniciais_(abaConfig);
    }

    // Popula atividades e ocorrências iniciais se vazias
    if (abaAtividades.getLastRow() <= 1) {
      _popularAtividadesIniciais_(abaAtividades, abaExecucoes, abaAlertas, abaOcorrencias);
    }

    _limparCache_();
    _registrarAuditoria_("Sistema", "Inicialização", "Sistema", "SETUP", "Banco de dados e abas configurados com sucesso.");

    return {
      ok: true,
      dados: {
        mensagem: "Sistema inicializado com sucesso!",
        timestamp: new Date().toISOString()
      }
    };
  } catch (erro) {
    return { ok: false, mensagem: erro.toString(), dados: null };
  }
}

/**
 * Retorna todos os dados da aplicação em um único payload otimizado
 * Utiliza CacheService para resposta ultrarrápida (< 50ms)
 * @return {Object} { ok: boolean, dados: Object }
 */
function getDados() {
  try {
    var cache = CacheService.getScriptCache();
    var cached = cache.get("DADOS_SISTEMA_ALMOXARIFADO");
    if (cached) {
      return { ok: true, dados: JSON.parse(cached), doCache: true };
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return { ok: false, mensagem: "Planilha não vinculada.", dados: null };

    var atividades = _lerTabelaComoObjetos_(ss.getSheetByName(ABAS.EXECUCOES));
    var ocorrencias = _lerTabelaComoObjetos_(ss.getSheetByName(ABAS.OCORRENCIAS));
    var alertas = _lerTabelaComoObjetos_(ss.getSheetByName(ABAS.ALERTAS));
    var itens = _lerTabelaComoObjetos_(ss.getSheetByName(ABAS.ITENS));
    var auditoria = _lerTabelaComoObjetos_(ss.getSheetByName(ABAS.AUDITORIA));
    var indicadores = obterIndicadores().dados;

    var payload = {
      atividades: atividades,
      ocorrencias: ocorrencias,
      alertas: alertas,
      itens: itens,
      auditoria: auditoria.slice(-50), // Últimos 50 logs
      indicadores: indicadores,
      usuarios: USUARIOS_FIXOS,
      timestamp: new Date().toISOString()
    };

    cache.put("DADOS_SISTEMA_ALMOXARIFADO", JSON.stringify(payload), CACHE_TTL_SECS);

    return { ok: true, dados: payload };
  } catch (erro) {
    return { ok: false, mensagem: erro.toString(), dados: null };
  }
}

/**
 * Cria uma nova atividade e gera a instância de execução correspondente
 * @param {Object} dados Objeto com dados da atividade
 * @param {string} usuarioAutor Nome do usuário que criou
 * @return {Object}
 */
function criarAtividade(dados, usuarioAutor) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var abaAtiv = ss.getSheetByName(ABAS.ATIVIDADES);
    var abaExec = ss.getSheetByName(ABAS.EXECUCOES);
    var autor = usuarioAutor || "Thiago";

    var idAtiv = _gerarIdUnico_("ACT");
    var idExec = _gerarIdUnico_("EXE");
    var hojeStr = _formatarDataIso_(new Date());

    var prazoDias = Number(dados.prazoDias) || 1;
    var dataExec = dados.dataExecucao || hojeStr;
    var dataLimite = _calcularDataLimite_(dataExec, prazoDias);

    var checklistJson = JSON.stringify(dados.checklist || []);
    var mensagensJson = JSON.stringify(dados.mensagens || []);
    var itensJson = JSON.stringify(dados.itemIds || []);

    var statusInicial = "Pendente";
    if (dataExec > hojeStr) statusInicial = "Agendada";
    if (dataLimite < hojeStr) statusInicial = "Em atraso";

    // 1. Grava no modelo
    abaAtiv.appendRow([
      idAtiv,
      dados.titulo || "Atividade Sem Título",
      dados.descricao || "",
      dados.categoria || "Geral",
      dados.tipo || "pontual",
      dados.periodicidade || "Pontual",
      dados.diaSemana || "",
      dados.diaMes || "",
      dados.responsavel || "Todos",
      prazoDias,
      dados.instrucoes || "",
      itensJson,
      checklistJson,
      hojeStr,
      "Ativo"
    ]);

    // 2. Grava na execução
    abaExec.appendRow([
      idExec,
      idAtiv,
      dados.titulo || "Atividade Sem Título",
      dados.responsavel || "Todos",
      dataExec,
      dataLimite,
      statusInicial,
      checklistJson,
      "",
      "",
      mensagensJson,
      dados.origemOcorrenciaId || ""
    ]);

    _limparCache_();
    _registrarAuditoria_(autor, "Criar Atividade", "Atividade", idExec, "Atividade criada: " + dados.titulo);

    return { ok: true, dados: { id: idExec, idAtividade: idAtiv, titulo: dados.titulo } };
  } catch (erro) {
    return { ok: false, mensagem: erro.toString(), dados: null };
  }
}

/**
 * Conclui uma atividade específica
 * @param {string} idExecucao ID da execução
 * @param {string} usuarioResponsavel Nome do assistente/almoxarife
 * @return {Object}
 */
function concluirAtividade(idExecucao, usuarioResponsavel) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var aba = ss.getSheetByName(ABAS.EXECUCOES);
    var dados = aba.getDataRange().getValues();
    var user = usuarioResponsavel || "Marcel";
    var hojeStr = _formatarDataIso_(new Date());

    var colId = 0; // ID_Execucao
    var colStatus = 6;
    var colConcluidoPor = 8;
    var colConcluidoEm = 9;

    var encontrada = false;
    for (var i = 1; i < dados.length; i++) {
      if (dados[i][colId] == idExecucao) {
        aba.getRange(i + 1, colStatus + 1).setValue("Concluída");
        aba.getRange(i + 1, colConcluidoPor + 1).setValue(user);
        aba.getRange(i + 1, colConcluidoEm + 1).setValue(hojeStr);
        encontrada = true;
        break;
      }
    }

    if (!encontrada) {
      return { ok: false, mensagem: "Atividade não encontrada.", dados: null };
    }

    _limparCache_();
    _registrarAuditoria_(user, "Concluir Atividade", "Atividade", idExecucao, "Atividade concluída com sucesso.");

    return { ok: true, dados: { id: idExecucao, status: "Concluída" } };
  } catch (erro) {
    return { ok: false, mensagem: erro.toString(), dados: null };
  }
}

/**
 * Cancela uma atividade
 * @param {string} idExecucao
 * @param {string} usuario
 */
function cancelarAtividade(idExecucao, usuario) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var aba = ss.getSheetByName(ABAS.EXECUCOES);
    var dados = aba.getDataRange().getValues();
    var user = usuario || "Thiago";

    for (var i = 1; i < dados.length; i++) {
      if (dados[i][0] == idExecucao) {
        aba.getRange(i + 1, 7).setValue("Cancelada");
        _limparCache_();
        _registrarAuditoria_(user, "Cancelar Atividade", "Atividade", idExecucao, "Atividade cancelada.");
        return { ok: true, dados: { id: idExecucao, status: "Cancelada" } };
      }
    }

    return { ok: false, mensagem: "Atividade não encontrada.", dados: null };
  } catch (erro) {
    return { ok: false, mensagem: erro.toString(), dados: null };
  }
}

/**
 * Cria uma ocorrência com regra de negócio: Se NecessitaAcao -> gera atividade para TODOS
 * @param {Object} dados Dados da ocorrência
 * @param {string} usuarioAutor Autor do registro
 * @return {Object}
 */
function criarOcorrencia(dados, usuarioAutor) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var abaOcr = ss.getSheetByName(ABAS.OCORRENCIAS);
    var autor = usuarioAutor || "Rafael";
    var idOcr = _gerarIdUnico_("OCR");
    var hojeStr = _formatarDataIso_(new Date());

    var necessitaAcao = Boolean(dados.necessitaAcao);
    var idAtividadeGerada = "";
    var statusOcr = "Aberta";

    // Regra: gera atividade automática atribuída a TODOS
    if (necessitaAcao) {
      statusOcr = "Em Tratamento";
      var resAtiv = criarAtividade({
        titulo: "[Ocorrência " + dados.setor + "] " + dados.categoria,
        descricao: "Ação gerada pela ocorrência: " + (dados.descricao || "") + " | Item: " + (dados.itemCodigoNome || "N/A"),
        categoria: "Auditoria & Controle",
        tipo: "pontual",
        periodicidade: "Pontual",
        responsavel: "Todos",
        prazoDias: 1,
        dataExecucao: hojeStr,
        prioridade: "Urgente",
        instrucoes: "Inspecionar setor " + dados.setor + " e efetuar recontagem/quarentena necessária.",
        origemOcorrenciaId: idOcr,
        checklist: [
          { text: "Inspeção física no setor " + dados.setor, completed: false },
          { text: "Ajuste de estoque ou isolamento de lote", completed: false },
          { text: "Validação final e encerramento de ocorrência", completed: false }
        ]
      }, "Sistema (Automático)");

      if (resAtiv.ok && resAtiv.dados) {
        idAtividadeGerada = resAtiv.dados.id;
      }
    }

    abaOcr.appendRow([
      idOcr,
      dados.setor || "Almoxarifado Geral",
      dados.categoria || "Geral",
      dados.tipo || "Desvio Operacional",
      dados.itemCodigoNome || "Item não especificado",
      dados.descricao || "",
      necessitaAcao ? "SIM" : "NAO",
      idAtividadeGerada,
      autor,
      hojeStr,
      statusOcr
    ]);

    _limparCache_();
    _registrarAuditoria_(autor, "Registro Ocorrência", "Ocorrência", idOcr, "Ocorrência registrada no setor " + dados.setor);

    return {
      ok: true,
      dados: {
        id: idOcr,
        atividadeGeradaId: idAtividadeGerada,
        status: statusOcr
      }
    };
  } catch (erro) {
    return { ok: false, mensagem: erro.toString(), dados: null };
  }
}

/**
 * Sincroniza recorrências e atualiza status de atraso
 * Pode ser vinculada a um Trigger diário (Time-driven trigger)
 */
function sincronizarExecucoes() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var abaExec = ss.getSheetByName(ABAS.EXECUCOES);
    var dados = abaExec.getDataRange().getValues();
    var hojeStr = _formatarDataIso_(new Date());

    var atualizados = 0;
    for (var i = 1; i < dados.length; i++) {
      var status = dados[i][6];
      var dataLimite = _formatarDataIso_(dados[i][5]);

      if ((status === "Pendente" || status === "Agendada") && dataLimite < hojeStr) {
        abaExec.getRange(i + 1, 7).setValue("Em atraso");
        atualizados++;
      }
    }

    _limparCache_();
    _registrarAuditoria_("Sistema", "Sincronização", "Sistema", "SYNC", "Execuções sincronizadas. " + atualizados + " em atraso.");

    return { ok: true, dados: { atualizados: atualizados } };
  } catch (erro) {
    return { ok: false, mensagem: erro.toString(), dados: null };
  }
}

/**
 * Calcula indicadores, KPIs e estatísticas para o Painel
 */
function obterIndicadores() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var abaExec = ss.getSheetByName(ABAS.EXECUCOES);
    var abaOcr = ss.getSheetByName(ABAS.OCORRENCIAS);

    var dadosExec = abaExec.getDataRange().getValues();
    var dadosOcr = abaOcr.getDataRange().getValues();
    var hojeStr = _formatarDataIso_(new Date());

    var total = 0, pendentes = 0, hoje = 0, atrasadas = 0, concluidas = 0, agendadas = 0;
    var perf = {
      Thiago: { total: 0, concluidas: 0 },
      Marcel: { total: 0, concluidas: 0 },
      Rafael: { total: 0, concluidas: 0 }
    };

    for (var i = 1; i < dadosExec.length; i++) {
      var row = dadosExec[i];
      var status = row[6];
      var resp = row[3];
      var dtExec = _formatarDataIso_(row[4]);
      var dtLim = _formatarDataIso_(row[5]);

      total++;
      if (status === "Pendente") pendentes++;
      if (status === "Em atraso") atrasadas++;
      if (status === "Concluída") concluidas++;
      if (status === "Agendada") agendadas++;
      if (dtExec === hojeStr || dtLim === hojeStr) hoje++;

      USUARIOS_FIXOS.forEach(function(u) {
        if (resp === u || resp === "Todos") {
          perf[u].total++;
          if (status === "Concluída") perf[u].concluidas++;
        }
      });
    }

    var taxaGeral = total > 0 ? Math.round((concluidas / total) * 100) : 0;

    return {
      ok: true,
      dados: {
        total: total,
        pendentes: pendentes,
        hoje: hoje,
        atrasadas: atrasadas,
        concluidas: concluidas,
        agendadas: agendadas,
        taxaConclusao: taxaGeral,
        performanceAssistentes: perf
      }
    };
  } catch (erro) {
    return { ok: false, mensagem: erro.toString(), dados: null };
  }
}

/**
 * Gera relatório mensal em PDF com resumo operacional
 * @param {string} mesAno Formato "YYYY-MM" ou "08/2026"
 */
function gerarRelatorioMensalPDF(mesAno) {
  try {
    var ind = obterIndicadores().dados;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var nomeDoc = "Relatorio_Almoxarifado_" + (mesAno || "Mensal") + "_" + new Date().getTime();

    // Cria documento temporário do Google Docs
    var doc = DocumentApp.create(nomeDoc);
    var body = doc.getBody();

    body.appendParagraph("HOSPITAL REGIONAL - ALMOXARIFADO CENTRAL")
      .setHeading(DocumentApp.ParagraphHeading.HEADING1);
    body.appendParagraph("Relatório Mensal de Gestão de Atividades e Ocorrências - Período: " + (mesAno || "Atual"))
      .setHeading(DocumentApp.ParagraphHeading.HEADING2);

    body.appendParagraph("\n1. Indicadores de Desempenho (KPIs):");
    body.appendParagraph("• Total de Atividades: " + ind.total);
    body.appendParagraph("• Atividades Concluídas: " + ind.concluidas + " (" + ind.taxaConclusao + "%)");
    body.appendParagraph("• Atividades em Atraso: " + ind.atrasadas);
    body.appendParagraph("• Atividades Pendentes: " + ind.pendentes);

    body.appendParagraph("\n2. Performance por Assistente:");
    USUARIOS_FIXOS.forEach(function(u) {
      var p = ind.performanceAssistentes[u] || { total: 0, concluidas: 0 };
      var pct = p.total > 0 ? Math.round((p.concluidas / p.total) * 100) : 0;
      body.appendParagraph("• " + u + ": " + p.concluidas + "/" + p.total + " tarefas (" + pct + "%)");
    });

    body.appendParagraph("\nDocumento gerado automaticamente pelo Sistema de Gestão do Almoxarifado em " + new Date().toLocaleString());

    doc.saveAndClose();

    var pdfBlob = doc.getAs("application/pdf").setName(nomeDoc + ".pdf");
    var pasta = DriveApp.getRootFolder();
    var arquivoPdf = pasta.createFile(pdfBlob);

    // Remove doc temporário
    DriveApp.getFileById(doc.getId()).setTrashed(true);

    return {
      ok: true,
      dados: {
        pdfUrl: arquivoPdf.getUrl(),
        downloadUrl: arquivoPdf.getDownloadUrl(),
        nomeArquivo: arquivoPdf.getName()
      }
    };
  } catch (erro) {
    return { ok: false, mensagem: erro.toString(), dados: null };
  }
}

// ============================================================================
// FUNÇÕES PRIVADAS AUXILIARES (_)
// ============================================================================

function _obterOuCriarAba_(ss, nomeAba, cabecalhos) {
  var aba = ss.getSheetByName(nomeAba);
  if (!aba) {
    aba = ss.insertSheet(nomeAba);
    aba.appendRow(cabecalhos);
    aba.getRange(1, 1, 1, cabecalhos.length)
      .setBackground("#1565c0")
      .setFontColor("#ffffff")
      .setFontWeight("bold");
    aba.setFrozenRows(1);
  }
  return aba;
}

function _lerTabelaComoObjetos_(aba) {
  if (!aba) return [];
  var dados = aba.getDataRange().getValues();
  if (dados.length <= 1) return [];

  var cabecalhos = dados[0];
  var lista = [];

  for (var i = 1; i < dados.length; i++) {
    var obj = {};
    for (var j = 0; j < cabecalhos.length; j++) {
      obj[cabecalhos[j]] = dados[i][j];
    }
    lista.push(obj);
  }
  return lista;
}

function _gerarIdUnico_(prefixo) {
  var data = new Date();
  var dStr = Utilities.formatDate(data, "GMT-3", "yyMMdd");
  var seq = Math.floor(1000 + Math.random() * 9000);
  var hash = Math.random().toString(16).substring(2, 6).toUpperCase();
  return prefixo + "-" + dStr + "-" + seq + "-" + hash;
}

function _formatarDataIso_(data) {
  if (!data) return "";
  if (typeof data === "string" && data.length >= 10) return data.substring(0, 10);
  return Utilities.formatDate(new Date(data), "GMT-3", "yyyy-MM-dd");
}

function _calcularDataLimite_(dataExecIso, dias) {
  var d = new Date(dataExecIso + "T00:00:00");
  d.setDate(d.getDate() + (Math.max(1, dias) - 1));
  return Utilities.formatDate(d, "GMT-3", "yyyy-MM-dd");
}

function _registrarAuditoria_(usuario, acao, entidade, entidadeId, detalhes) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var aba = ss.getSheetByName(ABAS.AUDITORIA);
    if (!aba) return;
    var dataHora = Utilities.formatDate(new Date(), "GMT-3", "yyyy-MM-dd HH:mm:ss");
    var idLog = _gerarIdUnico_("AUD");
    aba.appendRow([idLog, dataHora, usuario, acao, entidade, entidadeId, detalhes]);
  } catch (e) {
    Logger.log("Erro ao auditar: " + e);
  }
}

function _limparCache_() {
  try {
    CacheService.getScriptCache().remove("DADOS_SISTEMA_ALMOXARIFADO");
  } catch (e) {}
}

function _popularItensIniciais_(aba) {
  var itens = [
    ["001", "Seringa Descartável 1ml c/ Agulha", "Injetáveis", "Prateleira A1", 500, 480, "un"],
    ["002", "Seringa Descartável 3ml Luer Lock", "Injetáveis", "Prateleira A1", 1000, 1250, "un"],
    ["003", "Seringa Descartável 5ml Luer Slip", "Injetáveis", "Prateleira A2", 800, 720, "un"],
    ["004", "Seringa Descartável 10ml Luer Lock", "Injetáveis", "Prateleira A2", 600, 350, "un"],
    ["005", "Seringa Descartável 20ml Bico Central", "Injetáveis", "Prateleira A3", 400, 410, "un"],
    ["006", "Luva de Procedimento Não Cirúrgica M", "EPI & Proteção", "Prateleira B1", 2000, 1850, "cx"],
    ["007", "Luva de Procedimento Não Cirúrgica G", "EPI & Proteção", "Prateleira B1", 1500, 900, "cx"],
    ["008", "Luva Cirúrgica Estéril 7.5", "EPI & Proteção", "Prateleira B2", 300, 280, "par"],
    ["009", "Agulha Hipodérmica 25x7 (22G)", "Injetáveis", "Prateleira A4", 1200, 1400, "un"],
    ["010", "Agulha Hipodérmica 40x12 Aspiração", "Injetáveis", "Prateleira A4", 800, 620, "un"],
    ["011", "Cateter Intravenoso Periférico 20G", "Acesso Vascular", "Prateleira C1", 400, 390, "un"],
    ["012", "Cateter Intravenoso Periférico 22G", "Acesso Vascular", "Prateleira C1", 450, 210, "un"],
    ["013", "Gaze Hidrófila Estéril 7,5x7,5 11f", "Curativos", "Prateleira D1", 3000, 3200, "pct"],
    ["014", "Atadura de Crepom 10cm x 1,8m", "Curativos", "Prateleira D2", 500, 480, "rl"],
    ["015", "Esparadrapo Impermeável 10cm x 4,5m", "Curativos", "Prateleira D3", 200, 165, "rl"],
    ["016", "Fita Microporosa Hipoalergênica 5cm", "Curativos", "Prateleira D3", 250, 290, "rl"],
    ["017", "Álcool Etílico 70% Hidroalcoólico 1L", "Saneantes", "Área Química Q1", 100, 74, "fr"],
    ["018", "Clorexidina Alcoólica 0,5% 1000ml", "Saneantes", "Área Química Q2", 80, 85, "fr"],
    ["019", "Solução Fisiológica 0,9% 500ml Bolsa", "Soluções", "Palete S1", 600, 540, "fr"],
    ["020", "Solução Glicosada 5% 500ml Bolsa", "Soluções", "Palete S2", 400, 310, "fr"],
    ["021", "Máscara de Proteção Respiratória N95", "EPI & Proteção", "Prateleira B3", 1000, 1120, "un"],
    ["022", "Avental Descartável Manga Longa 30g", "EPI & Proteção", "Prateleira B4", 800, 640, "un"]
  ];
  itens.forEach(function(row) { aba.appendRow(row); });
}

function _popularConfiguracoesIniciais_(aba) {
  var configs = [
    ["SISTEMA_NOME", "Gestão de Almoxarifado Hospitalar", "Nome da aplicação"],
    ["ALMOXARIFE_CHEFE", "Thiago", "Usuário responsável pela supervisão"],
    ["ASSISTENTES", "Marcel, Rafael", "Usuários assistentes operacionais"],
    ["VERSAO", "2.0.0", "Versão do sistema Google Apps Script"]
  ];
  configs.forEach(function(row) { aba.appendRow(row); });
}

function _popularAtividadesIniciais_(abaAtiv, abaExec, abaAlert, abaOcr) {
  var hojeStr = _formatarDataIso_(new Date());

  // Exemplo de atividades
  var ex1 = {
    titulo: "Conferência semanal de estoque de luvas de procedimento",
    desc: "Contagem física das luvas M e G.",
    cat: "Inventário & Contagem",
    tipo: "cíclica",
    per: "Semanal",
    resp: "Marcel",
    prazo: 1
  };
  abaExec.appendRow([
    _gerarIdUnico_("EXE"),
    _gerarIdUnico_("ACT"),
    ex1.titulo,
    ex1.resp,
    hojeStr,
    hojeStr,
    "Pendente",
    JSON.stringify([{ text: "Contagem Luva M (1850 cx)", completed: true }, { text: "Contagem Luva G (900 cx)", completed: false }]),
    "",
    "",
    "[]",
    ""
  ]);

  abaAlert.appendRow([
    _gerarIdUnico_("ALT"),
    "🔴 ATENÇÃO: Inventário emergencial de cateteres deve ser priorizado hoje.",
    "Vermelho",
    "Todos",
    "Thiago",
    hojeStr,
    hojeStr,
    "SIM"
  ]);
}
