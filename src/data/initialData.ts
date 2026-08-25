import { User, HospitalItem, Activity, Occurrence, Alert, AuditLog } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    name: 'Thiago',
    role: 'Almoxarife',
    avatar: 'T',
    email: 'thiago.almoxarifado@hospital.org'
  },
  {
    id: 'u2',
    name: 'Marcel',
    role: 'Assistente',
    avatar: 'M',
    email: 'marcel.assistente@hospital.org'
  },
  {
    id: 'u3',
    name: 'Rafael',
    role: 'Assistente',
    avatar: 'R',
    email: 'rafael.assistente@hospital.org'
  }
];

export const INITIAL_ITEMS: HospitalItem[] = [
  { id: 'item-001', code: '001', name: 'Seringa Descartável 1ml c/ Agulha', category: 'Injetáveis', location: 'Prateleira A1', minimumStock: 500, currentStock: 480, unit: 'un' },
  { id: 'item-002', code: '002', name: 'Seringa Descartável 3ml Luer Lock', category: 'Injetáveis', location: 'Prateleira A1', minimumStock: 1000, currentStock: 1250, unit: 'un' },
  { id: 'item-003', code: '003', name: 'Seringa Descartável 5ml Luer Slip', category: 'Injetáveis', location: 'Prateleira A2', minimumStock: 800, currentStock: 720, unit: 'un' },
  { id: 'item-004', code: '004', name: 'Seringa Descartável 10ml Luer Lock', category: 'Injetáveis', location: 'Prateleira A2', minimumStock: 600, currentStock: 350, unit: 'un' },
  { id: 'item-005', code: '005', name: 'Seringa Descartável 20ml Bico Central', category: 'Injetáveis', location: 'Prateleira A3', minimumStock: 400, currentStock: 410, unit: 'un' },
  { id: 'item-006', code: '006', name: 'Luva de Procedimento Não Cirúrgica M', category: 'EPI & Proteção', location: 'Prateleira B1', minimumStock: 2000, currentStock: 1850, unit: 'cx' },
  { id: 'item-007', code: '007', name: 'Luva de Procedimento Não Cirúrgica G', category: 'EPI & Proteção', location: 'Prateleira B1', minimumStock: 1500, currentStock: 900, unit: 'cx' },
  { id: 'item-008', code: '008', name: 'Luva Cirúrgica Estéril 7.5', category: 'EPI & Proteção', location: 'Prateleira B2', minimumStock: 300, currentStock: 280, unit: 'par' },
  { id: 'item-009', code: '009', name: 'Agulha Hipodérmica 25x7 (22G)', category: 'Injetáveis', location: 'Prateleira A4', minimumStock: 1200, currentStock: 1400, unit: 'un' },
  { id: 'item-010', code: '010', name: 'Agulha Hipodérmica 40x12 Aspiração', category: 'Injetáveis', location: 'Prateleira A4', minimumStock: 800, currentStock: 620, unit: 'un' },
  { id: 'item-011', code: '011', name: 'Cateter Intravenoso Periférico 20G', category: 'Acesso Vascular', location: 'Prateleira C1', minimumStock: 400, currentStock: 390, unit: 'un' },
  { id: 'item-012', code: '012', name: 'Cateter Intravenoso Periférico 22G', category: 'Acesso Vascular', location: 'Prateleira C1', minimumStock: 450, currentStock: 210, unit: 'un' },
  { id: 'item-013', code: '013', name: 'Gaze Hidrófila Estéril 7,5x7,5 11f', category: 'Curativos', location: 'Prateleira D1', minimumStock: 3000, currentStock: 3200, unit: 'pct' },
  { id: 'item-014', code: '014', name: 'Atadura de Crepom 10cm x 1,8m', category: 'Curativos', location: 'Prateleira D2', minimumStock: 500, currentStock: 480, unit: 'rl' },
  { id: 'item-015', code: '015', name: 'Esparadrapo Impermeável 10cm x 4,5m', category: 'Curativos', location: 'Prateleira D3', minimumStock: 200, currentStock: 165, unit: 'rl' },
  { id: 'item-016', code: '016', name: 'Fita Microporosa Hipoalergênica 5cm', category: 'Curativos', location: 'Prateleira D3', minimumStock: 250, currentStock: 290, unit: 'rl' },
  { id: 'item-017', code: '017', name: 'Álcool Etílico 70% Hidroalcoólico 1L', category: 'Saneantes', location: 'Área Química Q1', minimumStock: 100, currentStock: 74, unit: 'fr' },
  { id: 'item-018', code: '018', name: 'Clorexidina Alcoólica 0,5% 1000ml', category: 'Saneantes', location: 'Área Química Q2', minimumStock: 80, currentStock: 85, unit: 'fr' },
  { id: 'item-019', code: '019', name: 'Solução Fisiológica 0,9% 500ml Bolsa', category: 'Soluções', location: 'Palete S1', minimumStock: 600, currentStock: 540, unit: 'fr' },
  { id: 'item-020', code: '020', name: 'Solução Glicosada 5% 500ml Bolsa', category: 'Soluções', location: 'Palete S2', minimumStock: 400, currentStock: 310, unit: 'fr' },
  { id: 'item-021', code: '021', name: 'Máscara de Proteção Respiratória N95/PFF2', category: 'EPI & Proteção', location: 'Prateleira B3', minimumStock: 1000, currentStock: 1120, unit: 'un' },
  { id: 'item-022', code: '022', name: 'Avental Descartável Manga Longa 30g', category: 'EPI & Proteção', location: 'Prateleira B4', minimumStock: 800, currentStock: 640, unit: 'un' }
];

// Today's date helper formatted as YYYY-MM-DD
export const getTodayDateStr = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getOffsetDateStr = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const today = getTodayDateStr();
const yesterday = getOffsetDateStr(-1);
const tomorrow = getOffsetDateStr(1);
const twoDaysAgo = getOffsetDateStr(-2);
const threeDaysAhead = getOffsetDateStr(3);

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act-101',
    title: 'Conferência semanal de estoque de luvas de procedimento',
    description: 'Realizar contagem física nas prateleiras B1 e B2, comparando com o sistema MV e checando integridade das embalagens.',
    category: 'Inventário & Contagem',
    type: 'cíclica',
    periodicity: 'Semanal',
    dayOfWeek: 3, // Quarta-feira
    responsible: 'Marcel',
    executionDate: today,
    deadlineDays: 1,
    dueDate: today,
    status: 'Pendente',
    priority: 'Alta',
    instructions: '1. Verificar lote e validade de todas as caixas.\n2. Lançar divergências imediatas na planilha de ajustes.\n3. Organizar prateleira seguindo PEPS (Primeiro que Expira, Primeiro que Sai).',
    itemIds: ['item-006', 'item-007', 'item-008'],
    checklist: [
      { id: 'chk-1', text: 'Contagem Luva M (Meta: 1850 cx)', completed: true, targetQuantity: 1850, completedQuantity: 1850, unit: 'cx', completedBy: 'Marcel', completedAt: today },
      { id: 'chk-2', text: 'Contagem Luva G (Meta: 900 cx)', completed: false, targetQuantity: 900, completedQuantity: 0, unit: 'cx' },
      { id: 'chk-3', text: 'Contagem Luva Cirúrgica 7.5 (Meta: 280 par)', completed: false, targetQuantity: 280, completedQuantity: 0, unit: 'par' },
      { id: 'chk-4', text: 'Checagem de lotes próximos ao vencimento (< 90 dias)', completed: false }
    ],
    messages: [
      {
        id: 'msg-1',
        author: 'Thiago',
        role: 'Almoxarife',
        text: 'Atenção especial para o lote 2026-X das luvas M recebidas na última entrega.',
        timestamp: `${today} 08:30`
      },
      {
        id: 'msg-2',
        author: 'Marcel',
        role: 'Assistente',
        text: 'Iniciando contagem agora pela manhã. Luva M já conferida e sem avarias.',
        timestamp: `${today} 09:15`
      }
    ],
    createdAt: yesterday,
    updatedAt: today
  },
  {
    id: 'act-102',
    title: 'Higienização e desinfecção mensal das prateleiras do setor A',
    description: 'Limpeza profunda e desinfecção com álcool 70% nas prateleiras A1 a A4 (setor de injetáveis).',
    category: 'Manutenção & Limpeza',
    type: 'cíclica',
    periodicity: 'Mensal',
    dayOfMonth: 15,
    responsible: 'Rafael',
    executionDate: today,
    deadlineDays: 2,
    dueDate: tomorrow,
    status: 'Pendente',
    priority: 'Média',
    instructions: 'Remover itens temporariamente para caixas organizadoras plásticas, aplicar solução desinfetante conforme protocolo CCIH e aguardar secagem completa antes do reabastecimento.',
    itemIds: ['item-001', 'item-002', 'item-003', 'item-017'],
    checklist: [
      { id: 'chk-201', text: 'Higienização Prateleira A1 (Seringas 1ml e 3ml)', completed: true, completedBy: 'Rafael', completedAt: today },
      { id: 'chk-202', text: 'Higienização Prateleira A2 (Seringas 5ml e 10ml)', completed: false },
      { id: 'chk-203', text: 'Higienização Prateleira A3 e A4 (Seringas 20ml e Agulhas)', completed: false },
      { id: 'chk-204', text: 'Registro no livro de controle de limpeza física', completed: false }
    ],
    messages: [
      {
        id: 'msg-201',
        author: 'Thiago',
        role: 'Almoxarife',
        text: 'Lembrar de utilizar luva nitrílica e máscara durante o uso do álcool.',
        timestamp: `${yesterday} 16:00`
      }
    ],
    createdAt: yesterday,
    updatedAt: today
  },
  {
    id: 'act-103',
    title: 'Inventário emergencial de cateteres intravenosos (Pontual)',
    description: 'Auditoria e recontagem física devido a divergência apontada na UTI Geral no plantão noturno.',
    category: 'Auditoria & Controle',
    type: 'pontual',
    periodicity: 'Pontual',
    responsible: 'Todos',
    executionDate: yesterday,
    deadlineDays: 1,
    dueDate: yesterday,
    status: 'Em atraso',
    priority: 'Urgente',
    instructions: 'Recontar todos os lotes de cateter 20G e 22G, identificar se houve dispensação não baixada pelo código de barras.',
    itemIds: ['item-011', 'item-012'],
    checklist: [
      { id: 'chk-301', text: 'Recontar Cateter 20G Prateleira C1', completed: false, targetQuantity: 390, completedQuantity: 0, unit: 'un' },
      { id: 'chk-302', text: 'Recontar Cateter 22G Prateleira C1', completed: false, targetQuantity: 210, completedQuantity: 0, unit: 'un' },
      { id: 'chk-303', text: 'Verificar canhoto de requisições manuais da UTI', completed: false }
    ],
    messages: [
      {
        id: 'msg-301',
        author: 'Thiago',
        role: 'Almoxarife',
        text: 'Esta atividade foi gerada automaticamente pela ocorrência da UTI. Precisamos fechar isso hoje.',
        timestamp: `${yesterday} 10:00`
      }
    ],
    createdAt: twoDaysAgo,
    updatedAt: yesterday
  },
  {
    id: 'act-104',
    title: 'Conferência de temperatura da geladeira de termolábeis',
    description: 'Registro diário das temperaturas máxima, mínima e atual do termômetro digital calibrado.',
    category: 'Qualidade & Termolábeis',
    type: 'cíclica',
    periodicity: 'Semanal',
    dayOfWeek: 1,
    responsible: 'Thiago',
    executionDate: twoDaysAgo,
    deadlineDays: 1,
    dueDate: twoDaysAgo,
    status: 'Concluída',
    priority: 'Alta',
    instructions: 'Verificar se faixa permanece estritamente entre 2°C e 8°C. Qualquer desvio superior a 15min deve ser comunicado ao setor de Engenharia Clínica.',
    itemIds: ['item-019', 'item-020'],
    checklist: [
      { id: 'chk-401', text: 'Temperatura Atual (4.2°C)', completed: true, completedBy: 'Thiago', completedAt: twoDaysAgo },
      { id: 'chk-402', text: 'Temperatura Mínima (3.1°C)', completed: true, completedBy: 'Thiago', completedAt: twoDaysAgo },
      { id: 'chk-403', text: 'Temperatura Máxima (5.8°C)', completed: true, completedBy: 'Thiago', completedAt: twoDaysAgo },
      { id: 'chk-404', text: 'Assinatura na planilha física afixada na porta', completed: true, completedBy: 'Thiago', completedAt: twoDaysAgo }
    ],
    messages: [],
    createdAt: twoDaysAgo,
    updatedAt: twoDaysAgo,
    completedAt: twoDaysAgo,
    completedBy: 'Thiago'
  },
  {
    id: 'act-105',
    title: 'Auditoria de integridade das embalagens de curativos estéreis',
    description: 'Inspeção por amostragem de pacotes de gaze e ataduras para detecção de umidade ou microrfissuras.',
    category: 'Auditoria & Controle',
    type: 'auditoria',
    periodicity: 'Mensal',
    dayOfMonth: 28,
    responsible: 'Marcel',
    executionDate: threeDaysAhead,
    deadlineDays: 3,
    dueDate: threeDaysAhead,
    status: 'Agendada',
    priority: 'Média',
    instructions: 'Seguir norma NBR ISO 11607 para barreira estéril. Isolar qualquer lote comprometido imediatamente.',
    itemIds: ['item-013', 'item-014', 'item-015', 'item-016'],
    checklist: [
      { id: 'chk-501', text: 'Inspecionar 50 pacotes Gaze Estéril D1', completed: false, targetQuantity: 50, completedQuantity: 0, unit: 'pct' },
      { id: 'chk-502', text: 'Inspecionar 20 rolos Atadura Crepom D2', completed: false, targetQuantity: 20, completedQuantity: 0, unit: 'rl' },
      { id: 'chk-503', text: 'Preencher formulário de auditoria da Garantia da Qualidade', completed: false }
    ],
    messages: [],
    createdAt: yesterday,
    updatedAt: yesterday
  },
  {
    id: 'act-106',
    title: 'Recepção e segregação do lote de aventais cirúrgicos descartáveis',
    description: 'Conferência quantitativa e qualitativa da nota fiscal NF-48291 contra o pedido de compra.',
    category: 'Recepção & Triagem',
    type: 'pontual',
    periodicity: 'Pontual',
    responsible: 'Rafael',
    executionDate: today,
    deadlineDays: 1,
    dueDate: today,
    status: 'Pendente',
    priority: 'Alta',
    instructions: '1. Conferir volumes com transportadora.\n2. Coletar laudo de conformidade do fabricante.\n3. Cadastrar lote no almoxarifado.',
    itemIds: ['item-022', 'item-021'],
    checklist: [
      { id: 'chk-601', text: 'Contagem das 640 unidades de aventais 30g', completed: false, targetQuantity: 640, completedQuantity: 0, unit: 'un' },
      { id: 'chk-602', text: 'Armazenamento na Prateleira B4', completed: false },
      { id: 'chk-603', text: 'Anexar espelho da NF no sistema', completed: false }
    ],
    messages: [
      {
        id: 'msg-601',
        author: 'Rafael',
        role: 'Assistente',
        text: 'Carga acabou de descarregar na doca 2. Já estou com a documentação.',
        timestamp: `${today} 11:20`
      }
    ],
    createdAt: today,
    updatedAt: today
  }
];

export const INITIAL_OCCURRENCES: Occurrence[] = [
  {
    id: 'ocr-01',
    sector: 'UTI Adulto - Bloco B',
    category: 'Avaria / Embalagem Violada',
    type: 'Divergência Física',
    itemId: 'item-012',
    itemName: 'Cateter Intravenoso Periférico 22G',
    description: 'Caixa de cateter 22G chegou ao posto com selo de esterilização rompido por umidade na caixa de transporte.',
    needsAction: true,
    generatedActivityId: 'act-103',
    registeredBy: 'Rafael',
    registeredAt: yesterday,
    status: 'Em Tratamento'
  },
  {
    id: 'ocr-02',
    sector: 'Pronto Atendimento',
    category: 'Ruptura de Estoque / Estoque Crítico',
    type: 'Falta de Material',
    itemId: 'item-004',
    itemName: 'Seringa Descartável 10ml Luer Lock',
    description: 'Pico repentino de consumo gerou saldo abaixo do estoque de segurança na prateleira A2.',
    needsAction: true,
    registeredBy: 'Marcel',
    registeredAt: today,
    status: 'Aberta'
  },
  {
    id: 'ocr-03',
    sector: 'Centro Cirúrgico',
    category: 'Validade Próxima',
    type: 'Gestão de Lote',
    itemId: 'item-018',
    itemName: 'Clorexidina Alcoólica 0,5% 1000ml',
    description: 'Identificados 15 frascos com validade para 45 dias no armário satélite do CC.',
    needsAction: false,
    registeredBy: 'Thiago',
    registeredAt: twoDaysAgo,
    status: 'Resolvida'
  },
  {
    id: 'ocr-04',
    sector: 'Maternidade',
    category: 'Divergência de Quantidade',
    type: 'Dispensação',
    itemId: 'item-006',
    itemName: 'Luva de Procedimento Não Cirúrgica M',
    description: 'Solicitadas 10 caixas, entregues 8 caixas devido a limitação temporária no carrinho.',
    needsAction: false,
    registeredBy: 'Marcel',
    registeredAt: twoDaysAgo,
    status: 'Resolvida'
  }
];

export const INITIAL_ALERTS: Alert[] = [
  {
    id: 'alt-01',
    message: '🔴 ATENÇÃO: Inventário emergencial de cateteres da UTI deve ser concluído com máxima prioridade até o final do turno.',
    priority: 'Vermelho',
    targetUser: 'Todos',
    createdBy: 'Thiago',
    createdAt: yesterday,
    expiresAt: tomorrow,
    active: true
  },
  {
    id: 'alt-02',
    message: '🟠 REABASTECIMENTO: Estoque de Seringa 10ml está em nível crítico (< 400 un). Priorizar conferência de entrada.',
    priority: 'Laranja',
    targetUser: 'Marcel',
    createdBy: 'Thiago',
    createdAt: today,
    expiresAt: threeDaysAhead,
    active: true
  },
  {
    id: 'alt-03',
    message: '🟡 PROTOCOLO CCIH: Nova circular sobre desinfecção de prateleiras entrou em vigor hoje. Consultar manual.',
    priority: 'Amarelo',
    targetUser: 'Todos',
    createdBy: 'Thiago',
    createdAt: yesterday,
    expiresAt: getOffsetDateStr(7),
    active: true
  },
  {
    id: 'alt-04',
    message: '🟢 Visita técnica da comissão de farmácia e terapêutica agendada para sexta-feira às 14:00.',
    priority: 'Verde',
    targetUser: 'Todos',
    createdBy: 'Thiago',
    createdAt: twoDaysAgo,
    expiresAt: getOffsetDateStr(5),
    active: true
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-01',
    timestamp: `${today} 08:00`,
    user: 'Sistema',
    action: 'Sincronização de Execuções',
    details: 'Recorrências semanais e mensais materializadas para a data de hoje.',
    entityType: 'Sistema'
  },
  {
    id: 'aud-02',
    timestamp: `${today} 08:30`,
    user: 'Thiago',
    action: 'Criação de Alerta',
    details: 'Alerta prioritário emitido para toda a equipe sobre cateteres.',
    entityType: 'Alerta'
  },
  {
    id: 'aud-03',
    timestamp: `${today} 09:15`,
    user: 'Marcel',
    action: 'Execução de Checklist',
    details: 'Marcado item "Contagem Luva M" com 1850 cx concluídas.',
    entityType: 'Atividade',
    entityId: 'act-101'
  }
];
