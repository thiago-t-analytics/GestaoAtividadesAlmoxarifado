export type UserRole = 'Almoxarife' | 'Assistente';

export interface User {
  id: string;
  name: 'Thiago' | 'Marcel' | 'Rafael';
  role: UserRole;
  avatar: string;
  email: string;
}

export type ActivityType = 'cíclica' | 'pontual' | 'auditoria';

export type PeriodicityType = 'Pontual' | 'Semanal' | 'Mensal';

export type ActivityStatus = 'Agendada' | 'Pendente' | 'Em atraso' | 'Concluída' | 'Cancelada';

export type PriorityLevel = 'Baixa' | 'Média' | 'Alta' | 'Urgente';

export type AlertPriority = 'Verde' | 'Amarelo' | 'Laranja' | 'Vermelho';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  targetQuantity?: number;
  completedQuantity?: number;
  unit?: string;
  completedBy?: string;
  completedAt?: string;
}

export interface ActivityMessage {
  id: string;
  author: string;
  role: string;
  text: string;
  timestamp: string;
}

export interface HospitalItem {
  id: string;
  code: string;
  name: string;
  category: string;
  location: string;
  minimumStock: number;
  currentStock: number;
  unit: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: string;
  type: ActivityType;
  periodicity: PeriodicityType;
  dayOfWeek?: number; // 0=Domingo, 1=Segunda ... 6=Sábado
  dayOfMonth?: number; // 1-31
  responsible: 'Thiago' | 'Marcel' | 'Rafael' | 'Todos';
  executionDate: string; // YYYY-MM-DD
  deadlineDays: number;
  dueDate: string; // YYYY-MM-DD
  status: ActivityStatus;
  priority: PriorityLevel;
  instructions?: string; // "Como executar"
  itemIds: string[]; // related hospital item IDs
  checklist: ChecklistItem[];
  messages: ActivityMessage[];
  originOccurrenceId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  completedBy?: string;
}

export interface Occurrence {
  id: string;
  sector: string;
  category: string;
  type: string;
  itemId?: string;
  itemName?: string;
  description: string;
  needsAction: boolean;
  generatedActivityId?: string;
  registeredBy: string;
  registeredAt: string;
  status: 'Aberta' | 'Em Tratamento' | 'Resolvida';
}

export interface Alert {
  id: string;
  message: string;
  priority: AlertPriority;
  targetUser: 'Todos' | 'Thiago' | 'Marcel' | 'Rafael';
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  active: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  entityType: 'Atividade' | 'Ocorrência' | 'Alerta' | 'Sistema';
  entityId?: string;
}

export interface DashboardKPIs {
  total: number;
  pending: number;
  today: number;
  delayed: number;
  completed: number;
  scheduled: number;
  completionRate: number;
  assistantPerformance: {
    name: string;
    role: string;
    totalAssigned: number;
    completed: number;
    pending: number;
    delayed: number;
    rate: number;
  }[];
  categoryBreakdown: { category: string; count: number; completed: number }[];
  periodicityBreakdown: { periodicity: string; count: number }[];
  statusBreakdown: { status: ActivityStatus; count: number; color: string; bg: string }[];
  topOccurrenceItems: { item: string; code: string; count: number }[];
}

export type NavigationTab = 
  | 'kanban' 
  | 'atividades' 
  | 'ocorrencias' 
  | 'alertas' 
  | 'dashboard' 
  | 'itens' 
  | 'relatorios' 
  | 'deliverables';

export type ActiveTab = 
  | 'dashboard' 
  | 'my-activities' 
  | 'all-activities' 
  | 'occurrences' 
  | 'alerts' 
  | 'catalog' 
  | 'reports' 
  | 'code-deliverables';

