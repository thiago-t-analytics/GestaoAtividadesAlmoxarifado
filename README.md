# 🏥 Sistema de Gestão de Atividades - Almoxarifado Hospitalar

Sistema operacional para gestão diária de almoxarifado hospitalar desenvolvido com arquitetura **Google Apps Script (GAS)** e **Google Sheets** como banco de dados em tempo real.

---

## 🎯 Arquitetura & Banco de Dados (8 Abas Google Sheets)

O banco de dados relacional em planilhas opera com 8 abas estruturadas:

1. **`ATIVIDADES`**  
   `ID | Titulo | Descricao | Categoria | Tipo | Periodicidade | DiaSemana | DiaMes | Responsavel | PrazoDias | Instrucoes | ItensRelacionados | ChecklistJSON | CriadoEm | Status`
2. **`EXECUCOES`**  
   `ID_Execucao | ID_Atividade | Titulo | Responsavel | DataExecucao | DataLimite | Status | ChecklistProgressoJSON | ConcluidoPor | ConcluidoEm | MensagensChatJSON | OrigemOcorrenciaID`
3. **`OCORRENCIAS`**  
   `ID_Ocorrencia | Setor | Categoria | Tipo | ItemCodigoNome | Descricao | NecessitaAcao | AtividadeGeradaID | RegistradoPor | DataRegistro | Status`
4. **`ALERTAS`**  
   `ID_Alerta | Mensagem | Prioridade | Destinatario | CriadoPor | DataCriacao | DataExpiracao | Ativo`
5. **`CONFIGURACOES`**  
   `Chave | Valor | Descricao`
6. **`AUDITORIA`**  
   `ID_Log | DataHora | Usuario | Acao | Entidade | EntidadeID | Detalhes`
7. **`ITENS`**  
   `Codigo | NomeItem | Categoria | Localizacao | EstoqueMinimo | EstoqueAtual | Unidade`
8. **`USUARIOS`**  
   `ID | Nome | Cargo | Email`

---

## 👥 Usuários Fixos (Sem Autenticação Externa)

Projetado para computadores e tablets compartilhados do almoxarifado, sem bloqueios de senha:

| Usuário | Perfil | Permissões |
| :--- | :--- | :--- |
| **Thiago** | Almoxarife (Supervisor) | Visão global, criação de atividades, emissão de alertas, relatórios e auditoria |
| **Marcel** | Assistente Operacional | Fila diária, checklist com contagem quantitativa e baixa de tarefas |
| **Rafael** | Assistente Operacional | Fila diária, checklist com contagem quantitativa e baixa de tarefas |

---

## 🚀 Passo a Passo de Implantação no Google Apps Script

### 1. Criar a Planilha Google
1. Acesse o [Google Sheets](https://sheets.new) e crie uma planilha em branco.
2. Nomeie como: `ALMOXARIFADO_HOSPITALAR_BANCO_DADOS`.

### 2. Acessar o Editor do Apps Script
1. No menu superior, clique em **Extensões** > **Apps Script**.
2. Renomeie o projeto para `Gestao_Almoxarifado_GAS`.

### 3. Inserir os Arquivos
1. No arquivo `Code.gs`, substitua todo o código pelo conteúdo de **`Code.gs`**.
2. Clique no botão **`+`** ao lado de Arquivos > **HTML**, nomeie exatamente como `Index` e cole o conteúdo de **`Index.html`**.

### 4. Inicializar a Planilha
1. No editor, selecione a função **`setup`** no menu suspenso superior.
2. Clique em **Executar** (ícone ▶️) e autorize as permissões da conta Google.
3. Todas as 8 abas com cabeçalhos azuis (`#1565c0`) e dados de exemplo serão criadas automaticamente.

### 5. Publicar como Web App
1. Clique em **Implantar** > **Nova implantação**.
2. Tipo: **Aplicativo da Web**.
3. **Executar como**: `Eu (seu e-mail)`.
4. **Quem pode acessar**: `Qualquer pessoa` (ou `Qualquer pessoa na sua organização`).
5. Clique em **Implantar** e copie a URL gerada para uso da equipe!

### 6. Agendamento Automático (Trigger Diário - Opcional)
Para sincronizar atrasos todos os dias às 06:00:
- Acesse **Acionadores** (ícone ⏰) > **+ Adicionar acionador**.
- Função: `sincronizarExecucoes` > Evento: `Baseado em tempo` > `Temporizador diário (06:00 às 07:00)`.
