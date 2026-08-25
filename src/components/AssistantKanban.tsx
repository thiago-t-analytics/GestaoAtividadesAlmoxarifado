import React from 'react';
import { Activity, User, ActivityStatus } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  CheckSquare, 
  MessageSquare, 
  AlertTriangle, 
  User as UserIcon, 
  Layers, 
  Sparkles,
  Info,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AssistantKanbanProps {
  activities: Activity[];
  currentUser: User;
  onOpenDetails: (activity: Activity) => void;
  onCompleteActivity: (activityId: string) => void;
  onChecklistToggle?: (activityId: string, checklistId: string, completed: boolean) => void;
  onNewActivity?: () => void;
}

export const AssistantKanban: React.FC<AssistantKanbanProps> = ({
  activities,
  currentUser,
  onOpenDetails,
  onCompleteActivity,
  onChecklistToggle,
  onNewActivity
}) => {
  const todayDateStr = new Date().toISOString().split('T')[0];

  // Filter activities for the current user or "Todos" (Almoxarife Thiago sees all or can filter)
  const userActivities = activities.filter(act => {
    if (currentUser.role === 'Almoxarife') return true;
    return act.responsible === currentUser.name || act.responsible === 'Todos';
  });

  // Categorize into the 3 specified Kanban columns
  const todayTasks = userActivities.filter(act => {
    return act.status !== 'Concluída' && 
           act.status !== 'Cancelada' && 
           (act.executionDate === todayDateStr || act.dueDate === todayDateStr);
  });

  const pendingAndDelayedTasks = userActivities.filter(act => {
    if (act.status === 'Concluída' || act.status === 'Cancelada') return false;
    if (act.executionDate === todayDateStr || act.dueDate === todayDateStr) return false;
    return act.status === 'Pendente' || act.status === 'Em atraso' || act.status === 'Agendada';
  });

  const completedTasks = userActivities.filter(act => act.status === 'Concluída');

  // Stats for the sidebar
  const totalCount = activities.length;
  const delayedCount = activities.filter(a => a.status === 'Em atraso').length;
  const scheduledCount = activities.filter(a => a.status === 'Agendada').length;
  const completedCount = activities.filter(a => a.status === 'Concluída').length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Assistant stats
  const marcelTasks = activities.filter(a => a.responsible === 'Marcel' || a.responsible === 'Todos');
  const marcelDone = marcelTasks.filter(a => a.status === 'Concluída').length;
  const marcelRate = marcelTasks.length > 0 ? Math.round((marcelDone / marcelTasks.length) * 100) : 0;

  const rafaelTasks = activities.filter(a => a.responsible === 'Rafael' || a.responsible === 'Todos');
  const rafaelDone = rafaelTasks.filter(a => a.status === 'Concluída').length;
  const rafaelRate = rafaelTasks.length > 0 ? Math.round((rafaelDone / rafaelTasks.length) * 100) : 0;

  const handleQuickComplete = (e: React.MouseEvent, actId: string) => {
    e.stopPropagation();
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.7 }
    });
    onCompleteActivity(actId);
  };

  const getBorderAndBadgeStyle = (status: ActivityStatus, isPriorityUrgente: boolean) => {
    if (isPriorityUrgente || status === 'Em atraso') {
      return {
        borderClass: 'border-l-4 border-[#c62828]',
        badgeBg: 'bg-[#fdeaea] text-[#c62828]',
        btnClass: 'bg-[#c62828] hover:bg-[#b71c1c] text-white'
      };
    }
    if (status === 'Pendente') {
      return {
        borderClass: 'border-l-4 border-[#c25708]',
        badgeBg: 'bg-[#fdeee2] text-[#c25708]',
        btnClass: 'bg-[#1565c0] hover:bg-[#0d3f75] text-white'
      };
    }
    if (status === 'Concluída') {
      return {
        borderClass: 'border-l-4 border-[#1b7f4f]',
        badgeBg: 'bg-[#e7f6ee] text-[#1b7f4f]',
        btnClass: 'bg-[#1b7f4f] hover:bg-[#15803d] text-white'
      };
    }
    return {
      borderClass: 'border-l-4 border-[#1565c0]',
      badgeBg: 'bg-[#f2f5f9] text-[#1565c0]',
      btnClass: 'bg-[#1565c0] hover:bg-[#0d3f75] text-white'
    };
  };

  const renderGeometricCard = (activity: Activity) => {
    const isUrgente = activity.priority === 'Urgente';
    const isDone = activity.status === 'Concluída';
    const isDelayed = activity.status === 'Em atraso';
    const style = getBorderAndBadgeStyle(activity.status, isUrgente);
    const completedChecklistCount = activity.checklist.filter(c => c.completed).length;
    const totalChecklist = activity.checklist.length;

    return (
      <div
        key={activity.id}
        id={`kanban-card-${activity.id}`}
        onClick={() => onOpenDetails(activity)}
        className={`bg-white ${style.borderClass} p-4 rounded-lg shadow-xs border-y border-r border-[#dde5ee] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-2.5 group relative ${
          isDone ? 'opacity-75' : ''
        }`}
      >
        {/* Top Tag & Code */}
        <div className="flex justify-between items-start mb-0.5">
          <span className={`${style.badgeBg} text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider`}>
            {activity.status}
          </span>
          <span className="text-[9px] text-[#5b6b7c] font-mono">
            #{activity.id}
          </span>
        </div>

        {/* Title */}
        <h4 className={`text-sm font-bold text-[#16202b] group-hover:text-[#1565c0] transition-colors leading-snug ${
          isDone ? 'line-through text-[#5b6b7c]' : isDelayed ? 'italic text-[#c62828]' : ''
        }`}>
          {activity.title}
        </h4>

        {/* Description */}
        {activity.description && (
          <p className="text-[11px] text-[#5b6b7c] line-clamp-2 leading-relaxed">
            {activity.description}
          </p>
        )}

        {/* Checklist Progress Preview */}
        {totalChecklist > 0 && (
          <div className="bg-[#f8fafc] p-2 rounded border border-[#dde5ee]/70 text-[10px] space-y-1">
            <div className="flex justify-between font-semibold text-[#5b6b7c]">
              <span className="flex items-center gap-1">
                <CheckSquare className="w-3 h-3 text-[#1565c0]" /> Checklist
              </span>
              <span>{completedChecklistCount}/{totalChecklist}</span>
            </div>
            <div className="w-full bg-[#e2e8f0] h-1 rounded-full overflow-hidden">
              <div
                className="bg-[#1565c0] h-full rounded-full transition-all"
                style={{ width: `${(completedChecklistCount / totalChecklist) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Bottom Metadata & Action Buttons */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#f2f5f9]">
          <div className="flex flex-col text-[10px]">
            <span className="text-[#1565c0] font-semibold flex items-center gap-1">
              Resp: <strong>{activity.responsible}</strong>
            </span>
            {isDelayed && (
              <span className="text-[#c62828] font-bold">Venceu: {activity.dueDate}</span>
            )}
          </div>

          <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => onOpenDetails(activity)}
              className="text-[10px] bg-[#1565c0] hover:bg-[#0d3f75] text-white px-2.5 py-1 rounded font-bold transition-colors cursor-pointer"
            >
              Checklist
            </button>

            {!isDone && activity.status !== 'Cancelada' && (
              <button
                onClick={(e) => handleQuickComplete(e, activity.id)}
                className="text-[10px] bg-[#1b7f4f] hover:bg-[#15803d] text-white px-2.5 py-1 rounded font-bold transition-colors cursor-pointer"
              >
                Concluir
              </button>
            )}
          </div>
        </div>

      </div>
    );
  };

  return (
    <div className="grid grid-cols-12 gap-5" id="geometric-balance-dashboard">
      
      {/* Left Sidebar Section (Geometric Balance Pattern: 3 Columns on Large Screens) */}
      <section className="col-span-12 lg:col-span-3 space-y-4">
        
        {/* Indicadores Atuais */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-[#dde5ee]">
          <h3 className="text-[10px] uppercase font-bold text-[#5b6b7c] mb-3 tracking-widest">
            Indicadores Atuais
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 bg-[#f2f5f9] rounded-lg">
              <div className="text-2xl font-bold text-[#1565c0]">{totalCount}</div>
              <div className="text-[10px] text-[#5b6b7c] uppercase font-semibold">Total Ativ.</div>
            </div>
            <div className="p-3 bg-[#fdeaea] rounded-lg">
              <div className="text-2xl font-bold text-[#c62828]">{String(delayedCount).padStart(2, '0')}</div>
              <div className="text-[10px] text-[#c62828] uppercase font-semibold">Atrasadas</div>
            </div>
            <div className="p-3 bg-[#e7f6ee] rounded-lg">
              <div className="text-2xl font-bold text-[#1b7f4f]">{completionRate}%</div>
              <div className="text-[10px] text-[#1b7f4f] uppercase font-semibold">Meta Mês</div>
            </div>
            <div className="p-3 bg-[#fff5dc] rounded-lg">
              <div className="text-2xl font-bold text-[#b57d00]">{scheduledCount}</div>
              <div className="text-[10px] text-[#b57d00] uppercase font-semibold">Agendadas</div>
            </div>
          </div>
        </div>

        {/* Assistentes Ativos */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-[#dde5ee]">
          <h3 className="text-[10px] uppercase font-bold text-[#5b6b7c] mb-3 tracking-widest">
            Assistentes Ativos
          </h3>
          <div className="space-y-3">
            
            {/* Marcel */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-[#16202b] flex items-center justify-center font-bold text-xs">
                MA
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-[#16202b]">Marcel</div>
                <div className="w-full bg-[#f2f5f9] h-1.5 rounded-full mt-1 overflow-hidden">
                  <div className="bg-[#1b7f4f] h-full rounded-full transition-all" style={{ width: `${marcelRate}%` }}></div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#1b7f4f]">{marcelRate}%</span>
            </div>

            {/* Rafael */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-[#16202b] flex items-center justify-center font-bold text-xs">
                RA
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-[#16202b]">Rafael</div>
                <div className="w-full bg-[#f2f5f9] h-1.5 rounded-full mt-1 overflow-hidden">
                  <div className="bg-[#c25708] h-full rounded-full transition-all" style={{ width: `${rafaelRate}%` }}></div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#c25708]">{rafaelRate}%</span>
            </div>

          </div>
        </div>

        {/* Último Alerta / Plantão Highlight Box */}
        <div className="bg-[#16202b] p-4 rounded-xl shadow-xs text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-300">
              Último Alerta Operacional
            </span>
          </div>
          <p className="text-xs leading-relaxed opacity-90 text-slate-200">
            Estoque de Seringas 5ml e Luvas de Procedimento sob monitoramento intensivo. Priorizar conferência física.
          </p>
        </div>

      </section>

      {/* Right Kanban Columns (9 Columns on Large Screens) */}
      <section className="col-span-12 lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        
        {/* Col 1: 📌 Hoje */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#16202b] flex items-center gap-1.5">
              <span>📌 Hoje</span>
            </h2>
            <span className="bg-[#dde5ee] text-[#5b6b7c] text-[10px] px-2 py-0.5 rounded-full font-bold">
              {String(todayTasks.length).padStart(2, '0')}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {todayTasks.length === 0 ? (
              <div className="bg-white border border-dashed border-[#dde5ee] rounded-lg p-5 text-center text-[#5b6b7c] text-xs">
                Nenhuma tarefa pendente para hoje.
              </div>
            ) : (
              todayTasks.map(renderGeometricCard)
            )}
          </div>
        </div>

        {/* Col 2: ⏳ Pendentes & Em Atraso */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#16202b] flex items-center gap-1.5">
              <span>⏳ Pendentes</span>
            </h2>
            <span className="bg-[#dde5ee] text-[#5b6b7c] text-[10px] px-2 py-0.5 rounded-full font-bold">
              {String(pendingAndDelayedTasks.length).padStart(2, '0')}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {pendingAndDelayedTasks.length === 0 ? (
              <div className="bg-white border border-dashed border-[#dde5ee] rounded-lg p-5 text-center text-[#5b6b7c] text-xs">
                Sem tarefas pendentes ou em atraso.
              </div>
            ) : (
              pendingAndDelayedTasks.map(renderGeometricCard)
            )}
          </div>
        </div>

        {/* Col 3: ✅ Concluídas */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#16202b] flex items-center gap-1.5">
              <span>✅ Concluídas</span>
            </h2>
            <span className="bg-[#dde5ee] text-[#5b6b7c] text-[10px] px-2 py-0.5 rounded-full font-bold">
              {String(completedTasks.length).padStart(2, '0')}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {completedTasks.length === 0 ? (
              <div className="bg-white border border-dashed border-[#dde5ee] rounded-lg p-5 text-center text-[#5b6b7c] text-xs">
                Nenhuma atividade concluída no ciclo.
              </div>
            ) : (
              completedTasks.slice(0, 10).map(renderGeometricCard)
            )}
          </div>
        </div>

      </section>

    </div>
  );
};
