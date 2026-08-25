import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  Occurrence, 
  Alert, 
  HospitalItem, 
  User, 
  AuditLog,
  NavigationTab,
  DashboardKPIs
} from './types';
import { storageService } from './services/storageService';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { AssistantKanban } from './components/AssistantKanban';
import { ActivityList } from './components/ActivityList';
import { OccurrencesView } from './components/OccurrencesView';
import { AlertsView } from './components/AlertsView';
import { DashboardView } from './components/DashboardView';
import { ItemCatalogView } from './components/ItemCatalogView';
import { ReportsView } from './components/ReportsView';
import { AppsScriptDeliverableModal } from './components/AppsScriptDeliverableModal';
import { ActivityModal } from './components/ActivityModal';
import { NewActivityModal } from './components/NewActivityModal';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  X,
  Bell,
  RefreshCw,
  Sparkles,
  Layers,
  FileCode
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // State
  const [currentUser, setCurrentUser] = useState<User>(() => storageService.getCurrentUser());
  const [activeTab, setActiveTab] = useState<NavigationTab>('kanban');
  
  const [activities, setActivities] = useState<Activity[]>(() => storageService.getActivities());
  const [occurrences, setOccurrences] = useState<Occurrence[]>(() => storageService.getOccurrences());
  const [alerts, setAlerts] = useState<Alert[]>(() => storageService.getAlerts());
  const [items, setItems] = useState<HospitalItem[]>(() => storageService.getItems());
  
  // Modals & detail views
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isNewActivityModalOpen, setIsNewActivityModalOpen] = useState(false);
  const [isDeliverablesModalOpen, setIsDeliverablesModalOpen] = useState(false);
  
  // Toast notifications
  const [toast, setToast] = useState<{ id: string; message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast(current => current?.id === id ? null : current);
    }, 3800);
  };

  // Sync execution status on load
  useEffect(() => {
    storageService.syncDailyExecutions();
    setActivities(storageService.getActivities());
  }, []);

  const handleUserChange = (user: User) => {
    setCurrentUser(user);
    storageService.setCurrentUser(user);
    showToast(`Perfil alterado para ${user.name} (${user.role})`, 'info');
  };

  // Helper to re-fetch all state from storage
  const refreshData = () => {
    setActivities(storageService.getActivities());
    setOccurrences(storageService.getOccurrences());
    setAlerts(storageService.getAlerts());
    setItems(storageService.getItems());
  };

  // Activity Operations
  const handleCompleteActivity = (activityId: string) => {
    const updated = storageService.completeActivity(activityId, currentUser.name);
    if (updated) {
      refreshData();
      if (selectedActivity?.id === activityId) {
        setSelectedActivity(updated);
      }
      showToast(`Atividade "${updated.title}" concluída com sucesso!`, 'success');
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  const handleCancelActivity = (activityId: string) => {
    const act = activities.find(a => a.id === activityId);
    if (act) {
      const updated = { ...act, status: 'Cancelada' as const, updatedAt: new Date().toISOString().split('T')[0] };
      storageService.saveActivity(updated);
      refreshData();
      if (selectedActivity?.id === activityId) {
        setSelectedActivity(updated);
      }
      showToast(`Atividade "${act.title}" cancelada.`, 'warning');
    }
  };

  const handleChecklistToggle = (activityId: string, checklistId: string, completed: boolean, completedQty?: number) => {
    const act = activities.find(a => a.id === activityId);
    if (!act) return;

    const newChecklist = act.checklist.map(c => {
      if (c.id === checklistId) {
        return {
          ...c,
          completed,
          completedQuantity: completedQty !== undefined ? completedQty : (completed ? c.targetQuantity : 0)
        };
      }
      return c;
    });

    const updated = { ...act, checklist: newChecklist, updatedAt: new Date().toISOString().split('T')[0] };
    storageService.saveActivity(updated);
    refreshData();
    if (selectedActivity?.id === activityId) {
      setSelectedActivity(updated);
    }
  };

  const handleAddChecklistItem = (activityId: string, text: string, targetQty?: number, unit?: string) => {
    const act = activities.find(a => a.id === activityId);
    if (!act) return;

    const newItem = {
      id: `chk-${Date.now()}`,
      text,
      completed: false,
      targetQuantity: targetQty,
      unit: unit || 'un'
    };

    const updated = {
      ...act,
      checklist: [...act.checklist, newItem],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    storageService.saveActivity(updated);
    refreshData();
    if (selectedActivity?.id === activityId) {
      setSelectedActivity(updated);
    }
    showToast(`Nova etapa adicionada ao checklist.`, 'info');
  };

  const handleSendMessage = (activityId: string, text: string) => {
    const act = activities.find(a => a.id === activityId);
    if (!act) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      author: currentUser.name,
      role: currentUser.role,
      text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    const updated = {
      ...act,
      messages: [...(act.messages || []), newMsg],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    storageService.saveActivity(updated);
    refreshData();
    if (selectedActivity?.id === activityId) {
      setSelectedActivity(updated);
    }
  };

  const handleSaveNewActivity = (dados: Partial<Activity>) => {
    const created = storageService.saveActivity(dados);
    refreshData();
    showToast(`Atividade "${created.title}" cadastrada com sucesso!`, 'success');
  };

  // Occurrence Operations
  const handleSaveOccurrence = (dados: Partial<Occurrence>) => {
    const created = storageService.saveOccurrence({
      ...dados,
      registeredBy: currentUser.name
    });
    refreshData();
    showToast(
      dados.needsAction
        ? `Ocorrência registrada! Atividade corretiva #${created.generatedActivityId} gerada para todos.`
        : `Ocorrência #${created.id} registrada com sucesso.`,
      'warning'
    );
  };

  const handleUpdateOccurrence = (id: string, dados: Partial<Occurrence>) => {
    storageService.updateOccurrence(id, dados);
    refreshData();
    showToast(`Ocorrência #${id} atualizada com sucesso!`, 'success');
  };

  const handleTriggerOccurrenceFromItem = (item: HospitalItem) => {
    setActiveTab('ocorrencias');
    showToast(`Preenchendo ocorrência para ${item.code} - ${item.name}`, 'info');
  };

  const handleOpenActivityDetailsById = (activityId: string) => {
    const act = activities.find(a => a.id === activityId);
    if (act) {
      setSelectedActivity(act);
    } else {
      showToast(`Atividade #${activityId} não encontrada.`, 'warning');
    }
  };

  // Alert Operations
  const handleSaveAlert = (dados: Partial<Alert>) => {
    storageService.saveAlert({
      ...dados,
      createdBy: currentUser.name
    });
    refreshData();
    showToast(`Alerta operacional publicado com sucesso!`, 'success');
  };

  const handleDismissAlert = (id: string) => {
    storageService.dismissAlert(id);
    refreshData();
    showToast(`Alerta arquivado.`, 'info');
  };

  const handleResetData = () => {
    if (confirm('Deseja realmente restaurar os dados de demonstração originais do almoxarifado?')) {
      storageService.resetToInitialData();
      refreshData();
      showToast('Dados restaurados com sucesso para os padrões hospitalares.', 'info');
    }
  };

  // KPIs
  const kpis: DashboardKPIs = useMemo(() => {
    return storageService.getDashboardKPIs();
  }, [activities, occurrences]);

  const activeAlertsCount = alerts.filter(a => a.active).length;
  const openOccurrencesCount = occurrences.filter(o => o.status !== 'Resolvida').length;
  const pendingActivitiesCount = activities.filter(a => a.status === 'Pendente' || a.status === 'Em atraso').length;

  const todayDateStr = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-[#f2f5f9] flex flex-col font-sans text-[#16202b] selection:bg-[#1565c0] selection:text-white" id="hospital-applet-root">
      
      {/* Top Application Header with Fixed User Switcher */}
      <Header
        currentUser={currentUser}
        onUserChange={handleUserChange}
        activeAlertsCount={activeAlertsCount}
        openOccurrencesCount={openOccurrencesCount}
        onOpenDeliverables={() => setActiveTab('deliverables')}
        onNewActivity={() => setIsNewActivityModalOpen(true)}
        onNewOccurrence={() => setActiveTab('ocorrencias')}
        onSync={() => {
          storageService.syncDailyExecutions();
          refreshData();
          showToast('Rotinas sincronizadas com a base de dados.', 'success');
        }}
      />

      {/* Navigation Bar matching Geometric Balance */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={{
          kanban: pendingActivitiesCount,
          atividades: activities.length,
          ocorrencias: openOccurrencesCount,
          alertas: activeAlertsCount
        }}
      />

      {/* Main Layout Body */}
      <main className="flex-1 px-4 sm:px-8 py-5 max-w-[1600px] w-full mx-auto">
        
        {/* Dynamic Tab Views */}
        <div className="transition-all duration-200">
          
          {/* Tab 1: Visão do Assistente (Kanban Monday.com - Primary Focus) */}
          {activeTab === 'kanban' && (
            <AssistantKanban
              activities={activities}
              currentUser={currentUser}
              onOpenDetails={setSelectedActivity}
              onCompleteActivity={handleCompleteActivity}
              onChecklistToggle={handleChecklistToggle}
              onNewActivity={() => setIsNewActivityModalOpen(true)}
            />
          )}

          {/* Tab 2: Todas as Atividades e Modelos Cadastrados */}
          {activeTab === 'atividades' && (
            <ActivityList
              activities={activities}
              items={items}
              currentUser={currentUser}
              onOpenDetails={setSelectedActivity}
              onNewActivity={() => setIsNewActivityModalOpen(true)}
              onCompleteActivity={handleCompleteActivity}
            />
          )}

          {/* Tab 3: Registro e Gestão de Ocorrências com Ação Automática */}
          {activeTab === 'ocorrencias' && (
            <OccurrencesView
              occurrences={occurrences}
              items={items}
              currentUser={currentUser}
              onSaveOccurrence={handleSaveOccurrence}
              onUpdateOccurrence={handleUpdateOccurrence}
              onOpenActivityDetailsById={handleOpenActivityDetailsById}
            />
          )}

          {/* Tab 4: Quadro de Avisos e Alertas Operacionais */}
          {activeTab === 'alertas' && (
            <AlertsView
              alerts={alerts}
              currentUser={currentUser}
              onSaveAlert={handleSaveAlert}
              onDismissAlert={handleDismissAlert}
              todayDateStr={todayDateStr}
            />
          )}

          {/* Tab 5: Dashboard de Indicadores e Produtividade */}
          {activeTab === 'dashboard' && (
            <DashboardView
              kpis={kpis}
            />
          )}

          {/* Tab 6: Catálogo de Suprimentos & Materiais */}
          {activeTab === 'itens' && (
            <ItemCatalogView
              items={items}
              onTriggerOccurrence={handleTriggerOccurrenceFromItem}
            />
          )}

          {/* Tab 7: Relatórios Mensais Executivos & PDF */}
          {activeTab === 'relatorios' && (
            <ReportsView
              activities={activities}
              occurrences={occurrences}
              kpis={kpis}
              currentUser={currentUser}
            />
          )}

          {/* Tab 8: Entregáveis Google Apps Script */}
          {activeTab === 'deliverables' && (
            <AppsScriptDeliverableModal
              onNotifyToast={showToast}
            />
          )}

        </div>

      </main>

      {/* Footer matching Geometric Balance */}
      <footer className="h-10 bg-white border-t border-[#dde5ee] flex items-center px-4 sm:px-8 text-[10px] text-[#5b6b7c] uppercase tracking-widest shrink-0 justify-between">
        <div className="flex items-center gap-2">
          <span>Status do Banco: <strong className="text-[#1b7f4f]">Conectado</strong></span>
          <span className="text-[#dde5ee]">|</span>
          <span className="hidden sm:inline">Unidade: <strong>Hospital Central - Almoxarifado Geral</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleResetData}
            className="hover:text-[#1565c0] flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Restaurar Base</span>
          </button>
          <span className="text-[#dde5ee]">|</span>
          <span>Versão: <strong>2.1.0-GAS</strong></span>
        </div>
      </footer>

      {/* Detail & Execution Modal */}
      {selectedActivity && (
        <ActivityModal
          activity={selectedActivity}
          items={items}
          currentUser={currentUser}
          onClose={() => setSelectedActivity(null)}
          onChecklistToggle={handleChecklistToggle}
          onAddChecklistItem={handleAddChecklistItem}
          onSendMessage={handleSendMessage}
          onCompleteActivity={handleCompleteActivity}
          onCancelActivity={handleCancelActivity}
        />
      )}

      {/* New Activity Creator Modal */}
      {isNewActivityModalOpen && (
        <NewActivityModal
          isOpen={isNewActivityModalOpen}
          onClose={() => setIsNewActivityModalOpen(false)}
          items={items}
          currentUser={currentUser}
          onSave={handleSaveNewActivity}
          todayDateStr={todayDateStr}
        />
      )}

      {/* Toast Alert Popover */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className={`p-3.5 rounded-xl shadow-xl border flex items-center gap-3 text-xs font-semibold max-w-md ${
            toast.type === 'success' ? 'bg-[#1b7f4f] text-white border-[#15803d]' :
            toast.type === 'warning' ? 'bg-[#c25708] text-white border-[#9a3412]' :
            'bg-[#1565c0] text-white border-[#0d3f75]'
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
            {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 shrink-0" />}
            <span className="leading-snug">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-auto p-1 text-white/80 hover:text-white rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
