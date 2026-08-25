import React, { useState } from 'react';
import { Activity, ActivityStatus, User, HospitalItem } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckSquare, 
  Clock, 
  Calendar, 
  User as UserIcon, 
  CheckCircle2, 
  Layers, 
  AlertTriangle,
  Info,
  SlidersHorizontal
} from 'lucide-react';

interface ActivityListProps {
  activities: Activity[];
  items: HospitalItem[];
  currentUser: User;
  onOpenDetails: (activity: Activity) => void;
  onNewActivity: () => void;
  onCompleteActivity: (activityId: string) => void;
}

export const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  items,
  currentUser,
  onOpenDetails,
  onNewActivity,
  onCompleteActivity
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [responsibleFilter, setResponsibleFilter] = useState<string>('todos');
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');
  const [periodicityFilter, setPeriodicityFilter] = useState<string>('todos');
  const [search, setSearch] = useState('');

  const filtered = activities.filter(act => {
    if (statusFilter !== 'todos' && act.status !== statusFilter) return false;
    if (responsibleFilter !== 'todos' && act.responsible !== responsibleFilter) return false;
    if (categoryFilter !== 'todos' && act.category !== categoryFilter) return false;
    if (periodicityFilter !== 'todos' && act.periodicity !== periodicityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = act.title.toLowerCase().includes(q);
      const matchDesc = act.description.toLowerCase().includes(q);
      const matchCat = act.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }
    return true;
  });

  const getStatusBadge = (status: ActivityStatus) => {
    switch (status) {
      case 'Agendada':
        return <span className="bg-[#fff5dc] text-[#b57d00] font-bold text-[11px] px-2 py-0.5 rounded uppercase">Agendada</span>;
      case 'Pendente':
        return <span className="bg-[#fdeee2] text-[#c25708] font-bold text-[11px] px-2 py-0.5 rounded uppercase">Pendente</span>;
      case 'Em atraso':
        return <span className="bg-[#fdeaea] text-[#c62828] font-bold text-[11px] px-2 py-0.5 rounded uppercase">Em atraso</span>;
      case 'Concluída':
        return <span className="bg-[#e7f6ee] text-[#1b7f4f] font-bold text-[11px] px-2 py-0.5 rounded uppercase">Concluída</span>;
      case 'Cancelada':
        return <span className="bg-[#f1f5f9] text-[#94a3b8] font-bold text-[11px] px-2 py-0.5 rounded uppercase">Cancelada</span>;
    }
  };

  const categories = Array.from(new Set(activities.map(a => a.category)));

  return (
    <div className="space-y-4" id="all-activities-view">
      
      {/* Header & Controls */}
      <div className="bg-white p-4 rounded-xl border border-[#dde5ee] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#16202b]">
            Todas as Atividades e Modelos Cadastrados
          </h2>
          <p className="text-xs text-[#5b6b7c]">
            Visão consolidada de modelos cíclicos, instâncias pontuais e histórico completo ({filtered.length} de {activities.length} exibidas).
          </p>
        </div>

        <button
          onClick={onNewActivity}
          className="px-4 py-2 text-xs font-bold text-white bg-[#1565c0] hover:bg-[#0d3f75] rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Atividade</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-[#dde5ee] shadow-2xs flex flex-wrap items-center gap-2 text-xs">
        <div className="flex items-center gap-1 text-[#5b6b7c] font-semibold pr-2">
          <Filter className="w-3.5 h-3.5 text-[#1565c0]" />
          <span>Filtros:</span>
        </div>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-[#f8fafc] border border-[#dde5ee] rounded-lg focus:outline-none focus:border-[#1565c0]"
        >
          <option value="todos">Status: Todos</option>
          <option value="Agendada">Agendada</option>
          <option value="Pendente">Pendente</option>
          <option value="Em atraso">Em atraso</option>
          <option value="Concluída">Concluída</option>
          <option value="Cancelada">Cancelada</option>
        </select>

        {/* Responsável */}
        <select
          value={responsibleFilter}
          onChange={(e) => setResponsibleFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-[#f8fafc] border border-[#dde5ee] rounded-lg focus:outline-none focus:border-[#1565c0]"
        >
          <option value="todos">Responsável: Todos</option>
          <option value="Marcel">Marcel</option>
          <option value="Rafael">Rafael</option>
          <option value="Thiago">Thiago</option>
          <option value="Todos">Todos (Geral)</option>
        </select>

        {/* Categoria */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-[#f8fafc] border border-[#dde5ee] rounded-lg focus:outline-none focus:border-[#1565c0]"
        >
          <option value="todos">Categoria: Todas</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Periodicidade */}
        <select
          value={periodicityFilter}
          onChange={(e) => setPeriodicityFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-[#f8fafc] border border-[#dde5ee] rounded-lg focus:outline-none focus:border-[#1565c0]"
        >
          <option value="todos">Periodicidade: Todas</option>
          <option value="Pontual">Pontual</option>
          <option value="Semanal">Semanal</option>
          <option value="Mensal">Mensal</option>
        </select>

        {/* Search */}
        <div className="flex-1 min-w-[160px]">
          <input
            type="text"
            placeholder="Filtrar por texto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-[#f8fafc] border border-[#dde5ee] rounded-lg text-xs"
          />
        </div>

        {(statusFilter !== 'todos' || responsibleFilter !== 'todos' || categoryFilter !== 'todos' || periodicityFilter !== 'todos' || search) && (
          <button
            onClick={() => {
              setStatusFilter('todos');
              setResponsibleFilter('todos');
              setCategoryFilter('todos');
              setPeriodicityFilter('todos');
              setSearch('');
            }}
            className="text-xs text-[#c62828] hover:underline font-semibold ml-auto"
          >
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-[#dde5ee] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] text-[#5b6b7c] border-b border-[#dde5ee] uppercase tracking-wider font-bold">
                <th className="py-3 px-4">Atividade & Categoria</th>
                <th className="py-3 px-4">Responsável</th>
                <th className="py-3 px-4">Periodicidade</th>
                <th className="py-3 px-4">Prazo / Vencimento</th>
                <th className="py-3 px-4">Checklist</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dde5ee]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#5b6b7c]">
                    Nenhuma atividade encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filtered.map((act) => {
                  const chkDone = act.checklist.filter(c => c.completed).length;
                  const chkTotal = act.checklist.length;
                  return (
                    <tr 
                      key={act.id} 
                      onClick={() => onOpenDetails(act)}
                      className="hover:bg-[#f9fbfe] transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-[#16202b] text-sm leading-snug">{act.title}</div>
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#5b6b7c]">
                          <span className="bg-[#f2f5f9] px-1.5 py-0.2 rounded font-medium">{act.category}</span>
                          {act.priority === 'Urgente' && (
                            <span className="bg-[#fdeaea] text-[#c62828] font-bold px-1.5 py-0.2 rounded">URGENTE</span>
                          )}
                          {act.originOccurrenceId && (
                            <span className="text-[#c25708] font-semibold flex items-center gap-0.5">
                              <AlertTriangle className="w-3 h-3" /> #{act.originOccurrenceId}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-[#16202b]">
                        <span className="flex items-center gap-1">
                          <UserIcon className="w-3.5 h-3.5 text-[#1565c0]" />
                          {act.responsible}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[#5b6b7c]">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-[#1565c0]" />
                          {act.periodicity} ({act.type})
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className={`font-semibold ${act.status === 'Em atraso' ? 'text-[#c62828]' : 'text-[#16202b]'}`}>
                          {act.dueDate}
                        </div>
                        <span className="text-[10px] text-[#5b6b7c]">Exec: {act.executionDate}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        {chkTotal > 0 ? (
                          <div className="w-24">
                            <div className="flex justify-between text-[10px] text-[#5b6b7c] font-bold mb-0.5">
                              <span>{chkDone}/{chkTotal}</span>
                              <span>{Math.round((chkDone/chkTotal)*100)}%</span>
                            </div>
                            <div className="w-full bg-[#e2e8f0] h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-[#1565c0] h-full" 
                                style={{ width: `${(chkDone/chkTotal)*100}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#5b6b7c] italic">Sem checklist</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {getStatusBadge(act.status)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => onOpenDetails(act)}
                            className="p-1.5 rounded-lg bg-[#f2f5f9] hover:bg-[#e2e8f0] text-[#16202b]"
                            title="Ver detalhes"
                          >
                            <Info className="w-3.5 h-3.5 text-[#1565c0]" />
                          </button>
                          {act.status !== 'Concluída' && act.status !== 'Cancelada' && (
                            <button
                              onClick={() => onCompleteActivity(act.id)}
                              className="px-2 py-1 rounded-lg bg-[#1b7f4f] hover:bg-[#15803d] text-white font-bold text-[11px]"
                              title="Marcar como Concluída"
                            >
                              Concluir
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
