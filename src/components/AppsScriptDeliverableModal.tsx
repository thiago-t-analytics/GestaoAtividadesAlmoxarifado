import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Download, 
  FileCode, 
  FileText, 
  ExternalLink,
  Sparkles,
  Layers
} from 'lucide-react';

interface DeliverableModalProps {
  onNotifyToast: (msg: string) => void;
}

export const AppsScriptDeliverableModal: React.FC<DeliverableModalProps> = ({ onNotifyToast }) => {
  const [activeFile, setActiveFile] = useState<'Code.gs' | 'Index.html' | 'README.md'>('Code.gs');
  const [copied, setCopied] = useState(false);

  // We read the actual files or provide direct view and copy
  const handleCopy = () => {
    // We will copy the code for the active file
    let contentToCopy = '';
    if (activeFile === 'Code.gs') {
      contentToCopy = CODE_GS_SAMPLE;
    } else if (activeFile === 'Index.html') {
      contentToCopy = INDEX_HTML_SAMPLE;
    } else {
      contentToCopy = README_SAMPLE;
    }

    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    onNotifyToast(`Arquivo ${activeFile} copiado para a área de transferência!`);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    let content = '';
    let mime = 'text/plain';
    if (activeFile === 'Code.gs') {
      content = CODE_GS_SAMPLE;
      mime = 'application/javascript';
    } else if (activeFile === 'Index.html') {
      content = INDEX_HTML_SAMPLE;
      mime = 'text/html';
    } else {
      content = README_SAMPLE;
      mime = 'text/markdown';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onNotifyToast(`Download do arquivo ${activeFile} iniciado!`);
  };

  return (
    <div className="space-y-4" id="deliverables-view">
      
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-[#dde5ee] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[#16202b]">
              Entregáveis Google Apps Script & Google Sheets
            </h2>
            <span className="bg-[#e3f2fd] text-[#1565c0] font-bold text-xs px-2 py-0.5 rounded-full">
              Pronto para Implantação
            </span>
          </div>
          <p className="text-xs text-[#5b6b7c]">
            Código fonte completo do backend (Code.gs), frontend (Index.html) e guia de instalação (README.md).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3.5 py-1.5 bg-[#f2f5f9] hover:bg-[#e2e8f0] text-[#16202b] font-bold text-xs rounded-lg border border-[#dde5ee] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-[#1b7f4f]" /> : <Copy className="w-4 h-4 text-[#1565c0]" />}
            <span>{copied ? 'Copiado!' : `Copiar ${activeFile}`}</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-3.5 py-1.5 bg-[#1565c0] hover:bg-[#0d3f75] text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Baixar {activeFile}</span>
          </button>
        </div>
      </div>

      {/* Tabs & Editor Container */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] shadow-lg overflow-hidden flex flex-col">
        
        {/* Code Tabs Header */}
        <div className="bg-[#0f172a] px-4 py-2.5 flex items-center justify-between border-b border-[#334155]">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveFile('Code.gs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeFile === 'Code.gs'
                  ? 'bg-[#1e293b] text-[#38bdf8] border border-[#334155]'
                  : 'text-[#94a3b8] hover:text-white hover:bg-[#1e293b]/50'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Code.gs (Backend GAS)</span>
            </button>

            <button
              onClick={() => setActiveFile('Index.html')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeFile === 'Index.html'
                  ? 'bg-[#1e293b] text-[#4ade80] border border-[#334155]'
                  : 'text-[#94a3b8] hover:text-white hover:bg-[#1e293b]/50'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Index.html (Frontend Web App)</span>
            </button>

            <button
              onClick={() => setActiveFile('README.md')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeFile === 'README.md'
                  ? 'bg-[#1e293b] text-[#fcd34d] border border-[#334155]'
                  : 'text-[#94a3b8] hover:text-white hover:bg-[#1e293b]/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>README.md (Instalação & Guia)</span>
            </button>
          </div>

          <div className="text-[11px] text-[#94a3b8] hidden sm:block">
            UTF-8 • Vanilla JS / GAS / HTML5
          </div>
        </div>

        {/* Code Content Area */}
        <pre className="p-5 font-mono text-xs text-[#f1f5f9] overflow-x-auto max-h-[600px] overflow-y-auto leading-relaxed select-text">
          <code>
            {activeFile === 'Code.gs' && CODE_GS_SAMPLE}
            {activeFile === 'Index.html' && INDEX_HTML_SAMPLE}
            {activeFile === 'README.md' && README_SAMPLE}
          </code>
        </pre>

      </div>

    </div>
  );
};

// Embedded sample strings for instant viewing inside the UI
const CODE_GS_SAMPLE = `/**
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
 * - Sem tela de login: 3 usuários fixos ("Thiago" Almoxarife, "Marcel", "Rafael" Assistentes)
 * - Flag "Necessita ação" em ocorrências gera tarefa automática para TODOS
 * - Retornos padronizados em { ok: boolean, dados: any }
 * - Otimizado com CacheService (TTL 5 min)
 */

var CACHE_TTL_SECS = 300;
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

function doGet(e) {
  var template = HtmlService.createTemplateFromFile("Index");
  return template.evaluate()
    .setTitle("Gestão Almoxarifado Hospitalar")
    .addMetaTag("viewport", "width=device-width, initial-scale=1, maximum-scale=1")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function setup() {
  return inicializarSistema();
}

function inicializarSistema() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  _obterOuCriarAba_(ss, ABAS.ATIVIDADES, ["ID", "Titulo", "Descricao", "Categoria", "Tipo", "Periodicidade", "DiaSemana", "DiaMes", "Responsavel", "PrazoDias", "Instrucoes", "ItensRelacionados", "ChecklistJSON", "CriadoEm", "Status"]);
  _obterOuCriarAba_(ss, ABAS.EXECUCOES, ["ID_Execucao", "ID_Atividade", "Titulo", "Responsavel", "DataExecucao", "DataLimite", "Status", "ChecklistProgressoJSON", "ConcluidoPor", "ConcluidoEm", "MensagensChatJSON", "OrigemOcorrenciaID"]);
  _obterOuCriarAba_(ss, ABAS.OCORRENCIAS, ["ID_Ocorrencia", "Setor", "Categoria", "Tipo", "ItemCodigoNome", "Descricao", "NecessitaAcao", "AtividadeGeradaID", "RegistradoPor", "DataRegistro", "Status"]);
  _obterOuCriarAba_(ss, ABAS.ALERTAS, ["ID_Alerta", "Mensagem", "Prioridade", "Destinatario", "CriadoPor", "DataCriacao", "DataExpiracao", "Ativo"]);
  _obterOuCriarAba_(ss, ABAS.CONFIGURACOES, ["Chave", "Valor", "Descricao"]);
  _obterOuCriarAba_(ss, ABAS.AUDITORIA, ["ID_Log", "DataHora", "Usuario", "Acao", "Entidade", "EntidadeID", "Detalhes"]);
  var abaItens = _obterOuCriarAba_(ss, ABAS.ITENS, ["Codigo", "NomeItem", "Categoria", "Localizacao", "EstoqueMinimo", "EstoqueAtual", "Unidade"]);
  
  if (abaItens.getLastRow() <= 1) {
    _popularItensIniciais_(abaItens);
  }
  return { ok: true, mensagem: "Sistema inicializado com sucesso!" };
}

function getDados() {
  var cache = CacheService.getScriptCache();
  var cached = cache.get("DADOS_SISTEMA_ALMOXARIFADO");
  if (cached) return { ok: true, dados: JSON.parse(cached) };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var payload = {
    atividades: _lerTabelaComoObjetos_(ss.getSheetByName(ABAS.EXECUCOES)),
    ocorrencias: _lerTabelaComoObjetos_(ss.getSheetByName(ABAS.OCORRENCIAS)),
    alertas: _lerTabelaComoObjetos_(ss.getSheetByName(ABAS.ALERTAS)),
    itens: _lerTabelaComoObjetos_(ss.getSheetByName(ABAS.ITENS)),
    auditoria: _lerTabelaComoObjetos_(ss.getSheetByName(ABAS.AUDITORIA)).slice(-50),
    indicadores: obterIndicadores().dados
  };
  cache.put("DADOS_SISTEMA_ALMOXARIFADO", JSON.stringify(payload), CACHE_TTL_SECS);
  return { ok: true, dados: payload };
}

function criarAtividade(dados, autor) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var abaExec = ss.getSheetByName(ABAS.EXECUCOES);
  var idExec = _gerarIdUnico_("EXE");
  var hojeStr = _formatarDataIso_(new Date());

  abaExec.appendRow([
    idExec,
    _gerarIdUnico_("ACT"),
    dados.titulo || "Atividade",
    dados.responsavel || "Todos",
    dados.dataExecucao || hojeStr,
    _calcularDataLimite_(dados.dataExecucao || hojeStr, dados.prazoDias || 1),
    "Pendente",
    JSON.stringify(dados.checklist || []),
    "",
    "",
    "[]",
    dados.origemOcorrenciaId || ""
  ]);
  _limparCache_();
  return { ok: true, dados: { id: idExec, titulo: dados.titulo } };
}

function concluirAtividade(idExecucao, usuario) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var aba = ss.getSheetByName(ABAS.EXECUCOES);
  var dados = aba.getDataRange().getValues();
  for (var i = 1; i < dados.length; i++) {
    if (dados[i][0] == idExecucao) {
      aba.getRange(i + 1, 7).setValue("Concluída");
      aba.getRange(i + 1, 9).setValue(usuario || "Marcel");
      aba.getRange(i + 1, 10).setValue(_formatarDataIso_(new Date()));
      _limparCache_();
      return { ok: true, dados: { id: idExecucao, status: "Concluída" } };
    }
  }
  return { ok: false, mensagem: "Não encontrada." };
}

function criarOcorrencia(dados, autor) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var abaOcr = ss.getSheetByName(ABAS.OCORRENCIAS);
  var idOcr = _gerarIdUnico_("OCR");
  var idAtivGerada = "";
  var statusOcr = "Aberta";

  if (dados.necessitaAcao) {
    statusOcr = "Em Tratamento";
    var resAtiv = criarAtividade({
      titulo: "[Ocorrência " + dados.setor + "] " + dados.category,
      descricao: "Ação automática: " + (dados.descricao || ""),
      responsavel: "Todos",
      prazoDias: 1
    }, "Sistema");
    if (resAtiv.ok) idAtivGerada = resAtiv.dados.id;
  }

  abaOcr.appendRow([
    idOcr,
    dados.setor || "Almoxarifado",
    dados.category || "Geral",
    dados.type || "Desvio",
    dados.itemCodigoNome || "N/A",
    dados.descricao || "",
    dados.necessitaAcao ? "SIM" : "NAO",
    idAtivGerada,
    autor || "Rafael",
    _formatarDataIso_(new Date()),
    statusOcr
  ]);
  _limparCache_();
  return { ok: true, dados: { id: idOcr, atividadeGeradaId: idAtivGerada } };
}`;

const INDEX_HTML_SAMPLE = `<!-- Frontend Index.html para Google Apps Script Web App -->
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sistema de Gestão - Almoxarifado Hospitalar</title>
  <!-- Arquivo completo disponível na raiz do repositório /Index.html -->
</head>
<body>
  <div id="app">Carregando sistema do almoxarifado...</div>
</body>
</html>`;

const README_SAMPLE = `# 🏥 Sistema de Gestão de Atividades - Almoxarifado Hospitalar
Documentação e guia passo a passo de instalação no Google Sheets & Google Apps Script.
Consulte o arquivo /README.md na raiz para o guia completo!`;
