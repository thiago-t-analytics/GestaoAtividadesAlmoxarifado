import React from 'react';
import { DashboardKPIs } from '../types';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  TrendingUp, 
  UserCheck, 
  Layers, 
  Package, 
  Activity as ActivityIcon 
} from 'lucide-react';

interface DashboardViewProps {
  kpis: DashboardKPIs;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ kpis }) => {
  return (
    <div className="space-y-5" id="dashboard-view">
      
      {/* KPI Top Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        <div className="bg-white p-4 rounded-xl border border-[#dde5ee] shadow-xs">
          <div className="flex items-center justify-between text-[#5b6b7c] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total</span>
            <ActivityIcon className="w-4 h-4 text-[#1565c0]" />
          </div>
          <div className="text-2xl font-extrabold text-[#16202b]">{kpis.total}</div>
          <span className="text-[11px] text-[#5b6b7c]">Rotinas ativas</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#dde5ee] shadow-xs">
          <div className="flex items-center justify-between text-[#1565c0] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Hoje</span>
            <Calendar className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-[#1565c0]">{kpis.today}</div>
          <span className="text-[11px] text-[#5b6b7c]">Do dia</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#dde5ee] shadow-xs">
          <div className="flex items-center justify-between text-[#c25708] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pendentes</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-[#c25708]">{kpis.pending}</div>
          <span className="text-[11px] text-[#5b6b7c]">Em andamento</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#dde5ee] shadow-xs">
          <div className="flex items-center justify-between text-[#c62828] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Em Atraso</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-[#c62828]">{kpis.delayed}</div>
          <span className="text-[11px] text-[#c62828] font-semibold">Crítico</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#dde5ee] shadow-xs">
          <div className="flex items-center justify-between text-[#1b7f4f] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Concluídas</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-[#1b7f4f]">{kpis.completed}</div>
          <span className="text-[11px] text-[#1b7f4f] font-semibold">{kpis.completionRate}% do total</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#dde5ee] shadow-xs">
          <div className="flex items-center justify-between text-[#b57d00] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Agendadas</span>
            <Layers className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-[#b57d00]">{kpis.scheduled}</div>
          <span className="text-[11px] text-[#5b6b7c]">Futuras</span>
        </div>

      </div>

      {/* Row 2: Performance por Assistente */}
      <div className="bg-white p-5 rounded-xl border border-[#dde5ee] shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#dde5ee] pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#1565c0]" />
            <h3 className="font-bold text-[#16202b] text-base">Performance e Cumprimento por Operador</h3>
          </div>
          <span className="text-xs text-[#5b6b7c]">Cálculo de conclusão sobre tarefas atribuídas</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {kpis.assistantPerformance.map((ast) => (
            <div key={ast.name} className="p-4 rounded-xl bg-[#f8fafc] border border-[#dde5ee] space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-[#16202b] text-sm">{ast.name}</h4>
                  <span className="text-[11px] text-[#1565c0] font-semibold">{ast.role}</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-[#16202b]">{ast.rate}%</span>
                  <span className="text-[10px] text-[#5b6b7c] block">Conclusão</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#e2e8f0] h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    ast.rate >= 80 ? 'bg-[#1b7f4f]' : ast.rate >= 50 ? 'bg-[#1565c0]' : 'bg-[#c25708]'
                  }`}
                  style={{ width: `${ast.rate}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-[#dde5ee]">
                <div>
                  <span className="text-[10px] text-[#5b6b7c] block">Total</span>
                  <strong className="text-[#16202b]">{ast.totalAssigned}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#1b7f4f] block font-semibold">Feitas</span>
                  <strong className="text-[#1b7f4f]">{ast.completed}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#c62828] block font-semibold">Atraso</span>
                  <strong className="text-[#c62828]">{ast.delayed}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 3: Gráficos de Barras Horizontais (Status, Categorias, Top Ocorrências) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Status Breakdown */}
        <div className="bg-white p-4 rounded-xl border border-[#dde5ee] shadow-xs space-y-3">
          <h3 className="font-bold text-[#16202b] text-sm border-b border-[#dde5ee] pb-2 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-[#1565c0]" />
            Distribuição por Status
          </h3>
          <div className="space-y-2.5 pt-1">
            {kpis.statusBreakdown.map(st => {
              const pct = kpis.total > 0 ? Math.round((st.count / kpis.total) * 100) : 0;
              return (
                <div key={st.status} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-[#16202b]">
                    <span>{st.status}</span>
                    <span>{st.count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-[#f1f5f9] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%`, backgroundColor: st.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Categorias Breakdown */}
        <div className="bg-white p-4 rounded-xl border border-[#dde5ee] shadow-xs space-y-3">
          <h3 className="font-bold text-[#16202b] text-sm border-b border-[#dde5ee] pb-2 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#1565c0]" />
            Atividades por Categoria
          </h3>
          <div className="space-y-2.5 pt-1">
            {kpis.categoryBreakdown.map(cat => {
              const pct = kpis.total > 0 ? Math.round((cat.count / kpis.total) * 100) : 0;
              return (
                <div key={cat.category} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-[#16202b]">
                    <span className="truncate pr-2">{cat.category}</span>
                    <span className="text-[#5b6b7c]">{cat.count} rotinas</span>
                  </div>
                  <div className="w-full bg-[#f1f5f9] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1565c0] rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 5 Itens com Mais Ocorrências */}
        <div className="bg-white p-4 rounded-xl border border-[#dde5ee] shadow-xs space-y-3">
          <h3 className="font-bold text-[#16202b] text-sm border-b border-[#dde5ee] pb-2 flex items-center gap-1.5">
            <Package className="w-4 h-4 text-[#c62828]" />
            Top 5 Itens com Mais Ocorrências
          </h3>
          <div className="space-y-2 pt-1">
            {kpis.topOccurrenceItems.length === 0 ? (
              <p className="text-xs text-[#5b6b7c] py-4 text-center">Nenhum item com ocorrência registrada.</p>
            ) : (
              kpis.topOccurrenceItems.map((top, idx) => (
                <div key={top.item} className="p-2 rounded-lg bg-[#f8fafc] border border-[#dde5ee] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#fdeaea] text-[#c62828] font-bold text-[10px] flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-[#16202b]">{top.code} - {top.item}</div>
                    </div>
                  </div>
                  <span className="bg-[#fee2e2] text-[#991b1b] font-extrabold text-xs px-2 py-0.5 rounded">
                    {top.count} desvio{top.count > 1 ? 's' : ''}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
