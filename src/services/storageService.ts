import {
  Activity,
  Occurrence,
  Alert,
  HospitalItem,
  AuditLog,
  DashboardKPIs,
  ChecklistItem,
  ActivityStatus
} from '../types';
import {
  INITIAL_ACTIVITIES,
  INITIAL_OCCURRENCES,
  INITIAL_ALERTS,
  INITIAL_ITEMS,
  INITIAL_AUDIT_LOGS,
  getTodayDateStr,
  getOffsetDateStr
} from '../data/initialData';

const STORAGE_KEYS = {
  ACTIVITIES: 'hosp_almox_activities_v2',
  OCCURRENCES: 'hosp_almox_occurrences_v2',
  ALERTS: 'hosp_almox_alerts_v2',
  ITEMS: 'hosp_almox_items_v2',
  AUDIT_LOGS: 'hosp_almox_audit_v2',
  LAST_SYNC: 'hosp_almox_last_sync_v2'
};

// Generates an ID according to specification: prefix + date + seq + hash
export const generateCustomId = (prefix: string): string => {
  const date = new Date();
  const dateStr = date.toISOString().slice(2, 10).replace(/-/g, '');
  const randomHex = Math.random().toString(16).substring(2, 6).toUpperCase();
  const seq = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${dateStr}-${seq}-${randomHex}`;
};

export class StorageService {
  private static load<T>(key: string, defaultData: T): T {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) {
        localStorage.setItem(key, JSON.stringify(defaultData));
        return defaultData;
      }
      return JSON.parse(stored);
    } catch (e) {
      console.error(`Error loading key ${key}:`, e);
      return defaultData;
    }
  }

  private static save<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Error saving key ${key}:`, e);
    }
  }

  // 1. Inicializar sistema com dados padrão
  public static inicializarSistema(): { ok: boolean; dados: any } {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
    localStorage.setItem(STORAGE_KEYS.OCCURRENCES, JSON.stringify(INITIAL_OCCURRENCES));
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(INITIAL_ALERTS));
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_ITEMS));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, getTodayDateStr());

    this.adicionarLogAuditoria(
      'Sistema',
      'Inicialização',
      'Banco de dados do almoxarifado inicializado com dados padrão e catálogo.',
      'Sistema'
    );

    return { ok: true, dados: this.getDados().dados };
  }

  // 2. Obter todos os dados em um único payload otimizado
  public static getDados(): {
    ok: boolean;
    dados: {
      atividades: Activity[];
      ocorrencias: Occurrence[];
      alertas: Alert[];
      itens: HospitalItem[];
      auditoria: AuditLog[];
      indicadores: DashboardKPIs;
    };
  } {
    const atividades = this.getAtividades();
    const ocorrencias = this.getOcorrencias();
    const alertas = this.getAlertas();
    const itens = this.getItens();
    const auditoria = this.getAuditoria();
    const indicadores = this.obterIndicadores();

    return {
      ok: true,
      dados: {
        atividades,
        ocorrencias,
        alertas,
        itens,
        auditoria,
        indicadores
      }
    };
  }

  public static getAtividades(): Activity[] {
    return this.load<Activity[]>(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
  }

  public static getOcorrencias(): Occurrence[] {
    return this.load<Occurrence[]>(STORAGE_KEYS.OCCURRENCES, INITIAL_OCCURRENCES);
  }

  public static getAlertas(): Alert[] {
    return this.load<Alert[]>(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
  }

  public static getItens(): HospitalItem[] {
    return this.load<HospitalItem[]>(STORAGE_KEYS.ITEMS, INITIAL_ITEMS);
  }

  public static getAuditoria(): AuditLog[] {
    return this.load<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }

  // Sincronizar execuções e atualizar status de atraso dinamicamente
  public static sincronizarExecucoes(): { ok: boolean; count: number } {
    const today = getTodayDateStr();
    let atividades = this.getAtividades();
    let updatedCount = 0;

    // 1. Atualizar status de pendentes que passaram da dueDate para 'Em atraso'
    atividades = atividades.map(act => {
      if (act.status === 'Pendente' || act.status === 'Agendada') {
        if (act.dueDate < today) {
          updatedCount++;
          return { ...act, status: 'Em atraso' as ActivityStatus, updatedAt: today };
        } else if (act.status === 'Agendada' && act.executionDate <= today) {
          updatedCount++;
          return { ...act, status: 'Pendente' as ActivityStatus, updatedAt: today };
        }
      }
      return act;
    });

    this.save(STORAGE_KEYS.ACTIVITIES, atividades);
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, today);

    this.adicionarLogAuditoria(
      'Sistema',
      'Sincronização de Execuções',
      `Sincronização executada. ${updatedCount} atividades verificadas e atualizadas para a data ${today}.`,
      'Sistema'
    );

    return { ok: true, count: updatedCount };
  }

  // 3. Criar Atividade
  public static criarAtividade(
    dados: Partial<Activity>,
    author = 'Thiago'
  ): { ok: boolean; dados: Activity } {
    const atividades = this.getAtividades();
    const today = getTodayDateStr();

    const deadlineDays = dados.deadlineDays ?? 1;
    const executionDate = dados.executionDate || today;
    
    // Calculate dueDate based on executionDate and deadlineDays
    const execD = new Date(executionDate + 'T00:00:00');
    execD.setDate(execD.getDate() + (deadlineDays - 1));
    const dueDate = execD.toISOString().split('T')[0];

    // Determine initial status based on date
    let initialStatus: ActivityStatus = 'Pendente';
    if (executionDate > today) {
      initialStatus = 'Agendada';
    } else if (dueDate < today) {
      initialStatus = 'Em atraso';
    }

    const novaAtividade: Activity = {
      id: generateCustomId('ACT'),
      title: dados.title?.trim() || 'Nova Atividade',
      description: dados.description?.trim() || '',
      category: dados.category || 'Geral',
      type: dados.type || 'pontual',
      periodicity: dados.periodicity || 'Pontual',
      dayOfWeek: dados.dayOfWeek,
      dayOfMonth: dados.dayOfMonth,
      responsible: dados.responsible || 'Todos',
      executionDate,
      deadlineDays,
      dueDate,
      status: dados.status || initialStatus,
      priority: dados.priority || 'Média',
      instructions: dados.instructions?.trim() || '',
      itemIds: dados.itemIds || [],
      checklist: (dados.checklist || []).map((item, idx) => ({
        id: item.id || `chk-${Date.now()}-${idx}`,
        text: item.text,
        completed: item.completed || false,
        targetQuantity: item.targetQuantity,
        completedQuantity: item.completedQuantity || 0,
        unit: item.unit
      })),
      messages: dados.messages || [],
      originOccurrenceId: dados.originOccurrenceId,
      createdAt: today,
      updatedAt: today
    };

    atividades.unshift(novaAtividade);
    this.save(STORAGE_KEYS.ACTIVITIES, atividades);

    this.adicionarLogAuditoria(
      author,
      'Criação de Atividade',
      `Atividade "${novaAtividade.title}" criada para ${novaAtividade.responsible} com prazo até ${novaAtividade.dueDate}.`,
      'Atividade',
      novaAtividade.id
    );

    return { ok: true, dados: novaAtividade };
  }

  // 4. Editar Atividade
  public static editarAtividade(
    id: string,
    dados: Partial<Activity>,
    author = 'Thiago'
  ): { ok: boolean; dados: Activity | null } {
    const atividades = this.getAtividades();
    const index = atividades.findIndex(a => a.id === id);

    if (index === -1) {
      return { ok: false, dados: null };
    }

    const old = atividades[index];
    const today = getTodayDateStr();

    let deadlineDays = dados.deadlineDays !== undefined ? dados.deadlineDays : old.deadlineDays;
    let executionDate = dados.executionDate || old.executionDate;
    
    // Recalculate dueDate if dates changed
    const execD = new Date(executionDate + 'T00:00:00');
    execD.setDate(execD.getDate() + (Math.max(1, deadlineDays) - 1));
    const dueDate = execD.toISOString().split('T')[0];

    const atualizada: Activity = {
      ...old,
      ...dados,
      deadlineDays,
      executionDate,
      dueDate,
      updatedAt: today
    };

    atividades[index] = atualizada;
    this.save(STORAGE_KEYS.ACTIVITIES, atividades);

    this.adicionarLogAuditoria(
      author,
      'Edição de Atividade',
      `Atividade "${atualizada.title}" atualizada.`,
      'Atividade',
      id
    );

    return { ok: true, dados: atualizada };
  }

  // 5. Concluir Atividade
  public static concluirAtividade(
    id: string,
    completedBy = 'Marcel'
  ): { ok: boolean; dados: Activity | null } {
    const atividades = this.getAtividades();
    const index = atividades.findIndex(a => a.id === id);

    if (index === -1) {
      return { ok: false, dados: null };
    }

    const today = getTodayDateStr();
    const old = atividades[index];

    // Mark all checklist items as completed if not yet
    const completedChecklist = old.checklist.map(c => ({
      ...c,
      completed: true,
      completedQuantity: c.targetQuantity !== undefined ? c.targetQuantity : c.completedQuantity,
      completedBy: c.completedBy || completedBy,
      completedAt: c.completedAt || today
    }));

    const atualizada: Activity = {
      ...old,
      status: 'Concluída',
      checklist: completedChecklist,
      completedAt: today,
      completedBy,
      updatedAt: today
    };

    atividades[index] = atualizada;
    this.save(STORAGE_KEYS.ACTIVITIES, atividades);

    this.adicionarLogAuditoria(
      completedBy,
      'Conclusão de Atividade',
      `Atividade "${old.title}" finalizada com sucesso por ${completedBy}.`,
      'Atividade',
      id
    );

    return { ok: true, dados: atualizada };
  }

  // 6. Cancelar Atividade
  public static cancelarAtividade(
    id: string,
    author = 'Thiago'
  ): { ok: boolean; dados: Activity | null } {
    const atividades = this.getAtividades();
    const index = atividades.findIndex(a => a.id === id);

    if (index === -1) {
      return { ok: false, dados: null };
    }

    const today = getTodayDateStr();
    const old = atividades[index];

    const atualizada: Activity = {
      ...old,
      status: 'Cancelada',
      updatedAt: today
    };

    atividades[index] = atualizada;
    this.save(STORAGE_KEYS.ACTIVITIES, atividades);

    this.adicionarLogAuditoria(
      author,
      'Cancelamento de Atividade',
      `Atividade "${old.title}" cancelada por ${author}.`,
      'Atividade',
      id
    );

    return { ok: true, dados: atualizada };
  }

  // 7. Criar Ocorrência (com regra de negócio: Se Necessita ação -> gera atividade automaticamente para TODOS)
  public static criarOcorrencia(
    dados: Partial<Occurrence>,
    author = 'Rafael'
  ): { ok: boolean; ocorrencia: Occurrence; atividadeGerada?: Activity } {
    const ocorrencias = this.getOcorrencias();
    const today = getTodayDateStr();

    let itemInfo: HospitalItem | undefined;
    if (dados.itemId) {
      const itens = this.getItens();
      itemInfo = itens.find(i => i.id === dados.itemId || i.code === dados.itemId);
    }

    const novaOcorrencia: Occurrence = {
      id: generateCustomId('OCR'),
      sector: dados.sector?.trim() || 'Almoxarifado Central',
      category: dados.category || 'Geral',
      type: dados.type || 'Desvio Operacional',
      itemId: itemInfo?.id || dados.itemId,
      itemName: itemInfo ? `${itemInfo.code} - ${itemInfo.name}` : dados.itemName || 'Item não especificado',
      description: dados.description?.trim() || '',
      needsAction: Boolean(dados.needsAction),
      registeredBy: author,
      registeredAt: today,
      status: 'Aberta'
    };

    let atividadeGerada: Activity | undefined;

    // Regra de Negócio: Se Necessita Ação = true -> gera atividade automaticamente atribuída a TODOS os assistentes
    if (novaOcorrencia.needsAction) {
      const title = `[Tratativa de Ocorrência] ${novaOcorrencia.sector}: ${novaOcorrencia.category}`;
      const description = `Ação corretiva requerida pela ocorrência ${novaOcorrencia.id}.\nItem: ${novaOcorrencia.itemName}\nDetalhes: ${novaOcorrencia.description}`;

      const res = this.criarAtividade(
        {
          title,
          description,
          category: 'Auditoria & Controle',
          type: 'pontual',
          periodicity: 'Pontual',
          responsible: 'Todos',
          executionDate: today,
          deadlineDays: 1,
          priority: 'Urgente',
          instructions: `1. Inspecionar o item ou setor envolvido (${novaOcorrencia.sector}).\n2. Realizar os devidos ajustes de contagem/isolamento.\n3. Reportar no chat da atividade a conclusão para encerramento da ocorrência.`,
          itemIds: novaOcorrencia.itemId ? [novaOcorrencia.itemId] : [],
          originOccurrenceId: novaOcorrencia.id,
          checklist: [
            { id: `chk-${Date.now()}-1`, text: `Avaliação in loco no setor: ${novaOcorrencia.sector}`, completed: false },
            { id: `chk-${Date.now()}-2`, text: `Ajuste de saldo ou quarentena do item: ${novaOcorrencia.itemName}`, completed: false },
            { id: `chk-${Date.now()}-3`, text: `Registro de devolutiva e encerramento`, completed: false }
          ]
        },
        'Sistema (Automático)'
      );

      if (res.ok && res.dados) {
        atividadeGerada = res.dados;
        novaOcorrencia.generatedActivityId = res.dados.id;
        novaOcorrencia.status = 'Em Tratamento';
      }
    }

    ocorrencias.unshift(novaOcorrencia);
    this.save(STORAGE_KEYS.OCCURRENCES, ocorrencias);

    this.adicionarLogAuditoria(
      author,
      'Registro de Ocorrência',
      `Ocorrência no setor "${novaOcorrencia.sector}" registrada. ${novaOcorrencia.needsAction ? 'Gerada atividade automática para TODOS.' : ''}`,
      'Ocorrência',
      novaOcorrencia.id
    );

    return { ok: true, ocorrencia: novaOcorrencia, atividadeGerada };
  }

  // 8. Editar Ocorrência
  public static editarOcorrencia(
    id: string,
    dados: Partial<Occurrence>,
    author = 'Thiago'
  ): { ok: boolean; dados: Occurrence | null } {
    const ocorrencias = this.getOcorrencias();
    const index = ocorrencias.findIndex(o => o.id === id);

    if (index === -1) {
      return { ok: false, dados: null };
    }

    const atualizada = { ...ocorrencias[index], ...dados };
    ocorrencias[index] = atualizada;
    this.save(STORAGE_KEYS.OCCURRENCES, ocorrencias);

    this.adicionarLogAuditoria(
      author,
      'Atualização de Ocorrência',
      `Ocorrência "${id}" atualizada para status ${atualizada.status}.`,
      'Ocorrência',
      id
    );

    return { ok: true, dados: atualizada };
  }

  // 9. Checklist toggle / quantity
  public static atualizarChecklistItem(
    activityId: string,
    checklistId: string,
    completed: boolean,
    user = 'Marcel',
    completedQuantity?: number
  ): { ok: boolean; dados: Activity | null } {
    const atividades = this.getAtividades();
    const act = atividades.find(a => a.id === activityId);
    if (!act) return { ok: false, dados: null };

    const today = getTodayDateStr();
    let updated = false;

    act.checklist = act.checklist.map(item => {
      if (item.id === checklistId) {
        updated = true;
        const newCompletedQty = completedQuantity !== undefined 
          ? completedQuantity 
          : (completed ? (item.targetQuantity || 1) : 0);

        return {
          ...item,
          completed,
          completedQuantity: newCompletedQty,
          completedBy: completed ? user : undefined,
          completedAt: completed ? today : undefined
        };
      }
      return item;
    });

    if (updated) {
      act.updatedAt = today;
      this.save(STORAGE_KEYS.ACTIVITIES, atividades);

      this.adicionarLogAuditoria(
        user,
        'Checklist Atualizado',
        `Item de checklist na atividade "${act.title}" marcado como ${completed ? 'Concluído' : 'Pendente'}.`,
        'Atividade',
        activityId
      );
    }

    return { ok: true, dados: act };
  }

  // 10. Chat de Atividades
  public static adicionarMensagemChat(
    activityId: string,
    text: string,
    author: string,
    role: string
  ): { ok: boolean; dados: Activity | null } {
    const atividades = this.getAtividades();
    const act = atividades.find(a => a.id === activityId);
    if (!act || !text.trim()) return { ok: false, dados: null };

    const today = getTodayDateStr();
    const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const novaMensagem = {
      id: `msg-${Date.now()}`,
      author,
      role,
      text: text.trim(),
      timestamp: `${today} ${timeStr}`
    };

    act.messages = act.messages || [];
    act.messages.push(novaMensagem);
    act.updatedAt = today;

    this.save(STORAGE_KEYS.ACTIVITIES, atividades);

    return { ok: true, dados: act };
  }

  // 11. Alertas
  public static criarAlerta(dados: Partial<Alert>, author = 'Thiago'): { ok: boolean; dados: Alert } {
    const alertas = this.getAlertas();
    const today = getTodayDateStr();
    const expiresAt = dados.expiresAt || getOffsetDateStr(3);

    const novoAlerta: Alert = {
      id: generateCustomId('ALT'),
      message: dados.message?.trim() || 'Alerta sem mensagem',
      priority: dados.priority || 'Amarelo',
      targetUser: dados.targetUser || 'Todos',
      createdBy: author,
      createdAt: today,
      expiresAt,
      active: true
    };

    alertas.unshift(novoAlerta);
    this.save(STORAGE_KEYS.ALERTS, alertas);

    this.adicionarLogAuditoria(
      author,
      'Criação de Alerta',
      `Alerta de prioridade ${novoAlerta.priority} criado para ${novoAlerta.targetUser}.`,
      'Alerta',
      novoAlerta.id
    );

    return { ok: true, dados: novoAlerta };
  }

  public static desativarAlerta(id: string, user = 'Thiago'): { ok: boolean } {
    let alertas = this.getAlertas();
    alertas = alertas.map(a => a.id === id ? { ...a, active: false } : a);
    this.save(STORAGE_KEYS.ALERTS, alertas);

    this.adicionarLogAuditoria(
      user,
      'Desativação de Alerta',
      `Alerta ${id} arquivado.`,
      'Alerta',
      id
    );

    return { ok: true };
  }

  // 12. Obter Indicadores (KPIs + Gráficos)
  public static obterIndicadores(): DashboardKPIs {
    const atividades = this.getAtividades();
    const ocorrencias = this.getOcorrencias();
    const today = getTodayDateStr();

    const total = atividades.length;
    const pending = atividades.filter(a => a.status === 'Pendente').length;
    const scheduled = atividades.filter(a => a.status === 'Agendada').length;
    const delayed = atividades.filter(a => a.status === 'Em atraso').length;
    const completed = atividades.filter(a => a.status === 'Concluída').length;
    const todayTasks = atividades.filter(a => a.executionDate === today || a.dueDate === today).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Performance por Assistente
    const assistentesList = [
      { name: 'Marcel', role: 'Assistente' },
      { name: 'Rafael', role: 'Assistente' },
      { name: 'Thiago', role: 'Almoxarife' }
    ];

    const assistantPerformance = assistentesList.map(ast => {
      const userTasks = atividades.filter(
        a => a.responsible === ast.name || a.responsible === 'Todos'
      );
      const userCompleted = userTasks.filter(a => a.status === 'Concluída').length;
      const userPending = userTasks.filter(a => a.status === 'Pendente').length;
      const userDelayed = userTasks.filter(a => a.status === 'Em atraso').length;
      const rate = userTasks.length > 0 ? Math.round((userCompleted / userTasks.length) * 100) : 0;

      return {
        name: ast.name,
        role: ast.role,
        totalAssigned: userTasks.length,
        completed: userCompleted,
        pending: userPending,
        delayed: userDelayed,
        rate
      };
    });

    // Categorias breakdown
    const categoryMap = new Map<string, { count: number; completed: number }>();
    atividades.forEach(a => {
      const current = categoryMap.get(a.category) || { count: 0, completed: 0 };
      current.count += 1;
      if (a.status === 'Concluída') current.completed += 1;
      categoryMap.set(a.category, current);
    });

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category,
      count: stats.count,
      completed: stats.completed
    }));

    // Periodicidade breakdown
    const periodicityMap = new Map<string, number>();
    atividades.forEach(a => {
      const curr = periodicityMap.get(a.periodicity) || 0;
      periodicityMap.set(a.periodicity, curr + 1);
    });

    const periodicityBreakdown = Array.from(periodicityMap.entries()).map(([periodicity, count]) => ({
      periodicity,
      count
    }));

    // Status breakdown with exact requested color tokens
    const statusBreakdown = [
      { status: 'Agendada' as ActivityStatus, count: scheduled, color: '#b57d00', bg: '#fff5dc' },
      { status: 'Pendente' as ActivityStatus, count: pending, color: '#c25708', bg: '#fdeee2' },
      { status: 'Em atraso' as ActivityStatus, count: delayed, color: '#c62828', bg: '#fdeaea' },
      { status: 'Concluída' as ActivityStatus, count: completed, color: '#1b7f4f', bg: '#e7f6ee' },
      {
        status: 'Cancelada' as ActivityStatus,
        count: atividades.filter(a => a.status === 'Cancelada').length,
        color: '#94a3b8',
        bg: '#f1f5f9'
      }
    ];

    // Top 5 itens com mais ocorrências
    const itemOccurrencesMap = new Map<string, { name: string; count: number }>();
    ocorrencias.forEach(o => {
      const itemKey = o.itemName || 'Item não especificado';
      const curr = itemOccurrencesMap.get(itemKey) || { name: itemKey, count: 0 };
      curr.count += 1;
      itemOccurrencesMap.set(itemKey, curr);
    });

    const topOccurrenceItems = Array.from(itemOccurrencesMap.entries())
      .map(([_, val]) => {
        const parts = val.name.split(' - ');
        return {
          code: parts[0] || '---',
          item: parts[1] || val.name,
          count: val.count
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total,
      pending,
      today: todayTasks,
      delayed,
      completed,
      scheduled,
      completionRate,
      assistantPerformance,
      categoryBreakdown,
      periodicityBreakdown,
      statusBreakdown,
      topOccurrenceItems
    };
  }

  // 13. Auditoria Log Helper
  public static adicionarLogAuditoria(
    user: string,
    action: string,
    details: string,
    entityType: 'Atividade' | 'Ocorrência' | 'Alerta' | 'Sistema',
    entityId?: string
  ): void {
    const logs = this.getAuditoria();
    const today = getTodayDateStr();
    const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: `${today} ${timeStr}`,
      user,
      action,
      details,
      entityType,
      entityId
    };

    logs.unshift(newLog);
    // Keep max 100 logs
    if (logs.length > 100) logs.pop();
    this.save(STORAGE_KEYS.AUDIT_LOGS, logs);
  }
}

const CURRENT_USER_KEY = 'hosp_almox_current_user_v2';
const DEFAULT_USER = {
  id: 'usr-1',
  name: 'Marcel' as const,
  role: 'Assistente' as const,
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
  email: 'marcel.assistente@hospital.local'
};

export const storageService = {
  getCurrentUser: (): import('../types').User => {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  },
  setCurrentUser: (user: import('../types').User): void => {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  },
  getActivities: (): Activity[] => StorageService.getAtividades(),
  getOccurrences: (): Occurrence[] => StorageService.getOcorrencias(),
  getAlerts: (): Alert[] => StorageService.getAlertas(),
  getItems: (): HospitalItem[] => StorageService.getItens(),
  getAuditLogs: (): AuditLog[] => StorageService.getAuditoria(),
  getDashboardKPIs: (): DashboardKPIs => StorageService.obterIndicadores(),
  syncDailyExecutions: () => StorageService.sincronizarExecucoes(),
  saveActivity: (dados: Partial<Activity>): Activity => {
    if (dados.id) {
      const res = StorageService.editarAtividade(dados.id, dados);
      return res.dados || (dados as Activity);
    } else {
      const res = StorageService.criarAtividade(dados);
      return res.dados;
    }
  },
  completeActivity: (id: string, user: string): Activity | null => {
    const res = StorageService.concluirAtividade(id, user);
    return res.dados;
  },
  saveOccurrence: (dados: Partial<Occurrence>): Occurrence => {
    const res = StorageService.criarOcorrencia(dados, dados.registeredBy || 'Rafael');
    return res.ocorrencia;
  },
  updateOccurrence: (id: string, dados: Partial<Occurrence>): Occurrence | null => {
    const res = StorageService.editarOcorrencia(id, dados);
    return res.dados;
  },
  saveAlert: (dados: Partial<Alert>): Alert => {
    const res = StorageService.criarAlerta(dados, dados.createdBy || 'Thiago');
    return res.dados;
  },
  dismissAlert: (id: string) => {
    StorageService.desativarAlerta(id);
  },
  resetToInitialData: () => {
    StorageService.inicializarSistema();
  }
};

