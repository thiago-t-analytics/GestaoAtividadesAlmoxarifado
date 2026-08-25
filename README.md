# 🏥 Sistema de Gestão de Atividades - Almoxarifado Hospitalar

Sistema digital para substituir controles manuais e planilhas avulsas no almoxarifado hospitalar, proporcionando governança, rastreabilidade de tarefas diárias, gestão de ocorrências com disparo automático de ações corretivas, checklists de execução e relatórios operacionais.

Inspirado na usabilidade ágil do **Monday.com**, **Trello** e **Notion**.

---

## 🎯 Principais Recursos

1. **Gestão de Atividades com Recorrência**
   - Atividades Pontuais, Semanais (com escolha de dia) e Mensais (dia fixo do mês).
   - Atribuição direta a assistentes (*Marcel*, *Rafael*) ou supervisão (*Thiago*) ou a *Todos*.
   - Prazos dinâmicos e controle automatizado de status (*Agendada*, *Pendente*, *Em atraso*, *Concluída*, *Cancelada*).

2. **Fila de Execução Focada no Assistente (Mobile-First)**
   - Painel Kanban dividido em:
     - 📌 **Do Dia (Hoje)**: tarefas prioritárias do plantão.
     - ⏳ **Pendentes & Em Atraso**: pendências acumuladas.
     - ✅ **Concluídas**: histórico recente de execuções.
   - Checklist quantitativo/qualitativo interativo.
   - Campo *"Como Executar"* com instruções passo a passo.
   - Chat/histórico integrado por atividade para comunicação de plantão.

3. **Ocorrências com Automação de Tarefas**
   - Registro rápido com seleção de setor, categoria de desvio e vínculo com o catálogo de itens.
   - Flag **"Necessita ação"**: gera automaticamente uma atividade urgente com checklist atribuída a **TODOS** os assistentes ativos.

4. **Quadro de Alertas Hospitalares**
   - Avisos com níveis de criticidade coloridos (*Vermelho*, *Laranja*, *Amarelo*, *Verde*).
   - Destinatários específicos ou transmissão geral.

5. **Painel de Indicadores & Relatórios**
   - KPIs em tempo real (Total, Hoje, Atrasadas, Concluídas, Taxa de Conclusão).
   - Performance individual por assistente (% de cumprimento).
   - Top 5 itens com maior incidência de avarias/rupturas.
   - Geração e impressão de Relatório Mensal em formato executivo / PDF.

6. **Catálogo de Suprimentos Hospitalares**
   - 20+ itens hospitalares pré-cadastrados (seringas, luvas, cateteres, saneantes, soluções).
   - Rastreio de saldo atual vs. estoque mínimo de segurança e localização de prateleira.

---

## 👥 Usuários e Perfis (Sem Login / Acesso Interno)

O sistema opera sem tela de login, ideal para terminais e tablets compartilhados na rede interna hospitalar:

| Usuário | Perfil | Responsabilidades |
| :--- | :--- | :--- |
| **Thiago** | Almoxarife (Supervisor) | Criação de modelos de atividades, emissão de alertas, auditoria, análise de KPIs e geração de relatórios |
| **Marcel** | Assistente Operacional | Execução de contagens físicas, preenchimento de checklist, baixa de tarefas e registro de ocorrências |
| **Rafael** | Assistente Operacional | Triagem de recebimento, inspeção de itens, cumprimento de rotinas de higienização e inventários |

---

## 🚀 Como Instalar e Executar no Google Apps Script

### Passo 1: Criar a Planilha Google
1. Acesse o [Google Sheets](https://sheets.new) e crie uma nova planilha em branco.
2. Nomeie a planilha como: `ALMOXARIFADO_HOSPITALAR_BANCO_DADOS`.

### Passo 2: Acessar o Editor do Apps Script
1. No menu superior da planilha, clique em **Extensões** > **Apps Script**.
2. Renomeie o projeto para: `Gestao_Almoxarifado_App`.

### Passo 3: Adicionar os Arquivos
1. No arquivo `Code.gs`, substitua todo o código pelo conteúdo do arquivo `Code.gs` deste repositório.
2. Clique no botão **`+`** (Adicionar arquivo) > **HTML** e crie um arquivo com o nome exato `Index` (o script criará `Index.html`).
3. Cole todo o conteúdo do arquivo `Index.html` deste repositório.

### Passo 4: Executar a Função de Setup Inicial
1. Na barra superior do editor, selecione a função **`setup`** ou **`inicializarSistema`** no menu suspenso de funções.
2. Clique em **Executar** (ícone de Play ▶️).
3. Conceda as permissões solicitadas na janela de autenticação do Google.
4. O script criará automaticamente as 7 abas com cabeçalhos estilizados em azul (#1565c0) e os dados iniciais:
   - `ATIVIDADES`
   - `EXECUCOES`
   - `OCORRENCIAS`
   - `ALERTAS`
   - `CONFIGURACOES`
   - `AUDITORIA`
   - `ITENS`

### Passo 5: Implantar como Aplicativo Web (Web App)
1. No canto superior direito do Apps Script, clique em **Implantar** > **Nova implantação**.
2. Clique no ícone de engrenagem ⚙️ ao lado de "Selecione o tipo" e escolha **Aplicativo da Web**.
3. Configure os campos:
   - **Descrição**: `Versão 2.0 - Produção`
   - **Executar como**: `Eu (seu e-mail)`
   - **Quem pode acessar**: `Qualquer pessoa com a conta da sua organização` (ou `Qualquer pessoa` caso deseje acesso em rede livre).
4. Clique em **Implantar**.
5. Copie a **URL do aplicativo da Web** gerada e distribua o link para os computadores e tablets do almoxarifado!

### Passo 6: Configurar Gatilho Automático Diário (Opcional, Recomendado)
Para que o sistema verifique prazos e materialize novas tarefas automaticamente todos os dias às 06:00:
1. No menu lateral esquerdo do Apps Script, clique no ícone de relógio ⏰ (**Acionadores**).
2. Clique em **+ Adicionar acionador**.
3. Configure:
   - Função a ser executada: `sincronizarExecucoes`
   - Origem do evento: `Baseado em tempo`
   - Tipo de acionador: `Contador de dias`
   - Hora do dia: `06:00 às 07:00`
4. Clique em **Salvar**.

---

## 📊 Estrutura do Banco de Dados (Google Sheets)

| Aba | Descrição |
| :--- | :--- |
| **ATIVIDADES** | Cadastro dos modelos mestres de atividades cíclicas, periodicidades e instruções |
| **EXECUCOES** | Instâncias diárias materializadas, prazos, status, checklist e chat |
| **OCORRENCIAS** | Registro de desvios operacionais com setor, item e flag de ação corretiva |
| **ALERTAS** | Avisos prioritários com nível de criticidade e data de expiração |
| **CONFIGURACOES** | Chaves e parâmetros do sistema |
| **AUDITORIA** | Trilha completa de auditoria (data/hora, usuário, ação e detalhes) |
| **ITENS** | Catálogo de suprimentos (código, descrição, categoria, localização e saldo) |

---

## 🎨 Paleta de Cores & Design System

- **Primária**: `#1565c0` (Azul Hospitalar)
- **Secundária / Escura**: `#0d3f75`
- **Fundo**: `#f2f5f9`
- **Cards**: `#ffffff` com borda `#dde5ee` e raio de 12px
- **Status Agendada**: `#b57d00` (Fundo `#fff5dc`)
- **Status Pendente**: `#c25708` (Fundo `#fdeee2`)
- **Status Em atraso**: `#c62828` (Fundo `#fdeaea`)
- **Status Concluída**: `#1b7f4f` (Fundo `#e7f6ee`)
- **Status Cancelada**: `#94a3b8` (Fundo `#f1f5f9`)
