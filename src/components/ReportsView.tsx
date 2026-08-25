import React, { useState } from 'react';
import { Activity, Occurrence, DashboardKPIs, User } from '../types';
import { 
  FileText, 
  Printer, 
  Download, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  AlertTriangle,
  UserCheck,
  ShieldCheck
} from 'lucide-react';

interface ReportsViewProps {
  activities: Activity[];
  occurrences: Occurrence[];
  kpis: DashboardKPIs;
  currentUser: User;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  activities,
  occurrences,
  kpis,
  currentUser
}) => {
  const [selectedMonth, setSelectedMonth] = useState('2026-08');

  const handlePrint = () => {
    window.print();
  };

  const completedActivities = activities.filter(a => a.status === 'Concluída');
  const delayedActivities = activities.filter(a => a.status === 'Em atraso');

  return (
    <div className="space-y-4" id="reports-view">
      
      {/* Controls Bar (hidden during print) */}
      <div className="bg-white p-4 rounded-xl border border-[#dde5ee] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#16202b]">
            Relatórios Mensais & Emissão de PDF
          </h2>
          <p className="text-xs text-[#5b6b7c]">
            Consolidado executivo para diretoria hospitalar e comissão de auditoria e conformidade.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 border border-[#dde5ee] rounded-lg text-xs font-semibold bg-[#f8fafc]"
          />

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-[#1565c0] hover:bg-[#0d3f75] text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Salvar PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document */}
      <div className="bg-white p-8 rounded-2xl border border-[#dde5ee] shadow-sm max-w-4xl mx-auto space-y-6 text-[#16202b] print:border-none print:shadow-none print:p-0">
        
        {/* Document Header */}
        <div className="border-b-2 border-[#1565c0] pb-4 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#1565c0] text-white flex items-center justify-center font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0d3f75]">HOSPITAL REGIONAL & MATERNIDADE</h1>
              <p className="text-xs text-[#5b6b7c] font-semibold">DIVISÃO DE SUPRIMENTOS - ALMOXARIFADO CENTRAL</p>
            </div>
          </div>

          <div className="text-right text-xs">
            <div className="font-bold text-[#1565c0]">RELATÓRIO OPERACIONAL</div>
            <div className="text-[#5b6b7c]">Competência: <strong>{selectedMonth}</strong></div>
            <div className="text-[10px] text-[#5b6b7c] mt-1">Gerado em: {new Date().toLocaleString('pt-BR')}</div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#0d3f75] border-b border-[#dde5ee] pb-1">
            1. Resumo Executivo e Indicadores Operacionais (KPIs)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#dde5ee]">
              <span className="text-[11px] text-[#5b6b7c] block">Total de Atividades</span>
              <strong className="text-lg text-[#16202b]">{kpis.total}</strong>
            </div>
            <div className="p-3 bg-[#e7f6ee] rounded-xl border border-[#86efac]">
              <span className="text-[11px] text-[#166534] block">Concluídas com Sucesso</span>
              <strong className="text-lg text-[#166534]">{kpis.completed} ({kpis.completionRate}%)</strong>
            </div>
            <div className="p-3 bg-[#fdeaea] rounded-xl border border-[#fca5a5]">
              <span className="text-[11px] text-[#991b1b] block">Em Atraso</span>
              <strong className="text-lg text-[#991b1b]">{kpis.delayed}</strong>
            </div>
            <div className="p-3 bg-[#ffedd5] rounded-xl border border-[#fdba74]">
              <span className="text-[11px] text-[#9a3412] block">Ocorrências Tratadas</span>
              <strong className="text-lg text-[#9a3412]">{occurrences.length}</strong>
            </div>
          </div>
        </div>

        {/* Operator Performance Table */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#0d3f75] border-b border-[#dde5ee] pb-1">
            2. Desempenho Operacional da Equipe
          </h2>
          <table className="w-full text-xs text-left border-collapse border border-[#dde5ee]">
            <thead>
              <tr className="bg-[#f8fafc] text-[#5b6b7c]">
                <th className="p-2 border border-[#dde5ee]">Operador</th>
                <th className="p-2 border border-[#dde5ee]">Cargo / Função</th>
                <th className="p-2 border border-[#dde5ee]">Tarefas Atribuídas</th>
                <th className="p-2 border border-[#dde5ee]">Concluídas</th>
                <th className="p-2 border border-[#dde5ee]">Pendentes</th>
                <th className="p-2 border border-[#dde5ee]">% de Cumprimento</th>
              </tr>
            </thead>
            <tbody>
              {kpis.assistantPerformance.map(ast => (
                <tr key={ast.name}>
                  <td className="p-2 border border-[#dde5ee] font-bold">{ast.name}</td>
                  <td className="p-2 border border-[#dde5ee] text-[#5b6b7c]">{ast.role}</td>
                  <td className="p-2 border border-[#dde5ee]">{ast.totalAssigned}</td>
                  <td className="p-2 border border-[#dde5ee] text-[#1b7f4f] font-semibold">{ast.completed}</td>
                  <td className="p-2 border border-[#dde5ee] text-[#c25708]">{ast.pending}</td>
                  <td className="p-2 border border-[#dde5ee] font-bold text-[#1565c0]">{ast.rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Key Completed Tasks */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#0d3f75] border-b border-[#dde5ee] pb-1">
            3. Registro de Auditorias e Contagens Cíclicas Finalizadas
          </h2>
          <div className="space-y-1.5 pt-1">
            {completedActivities.length === 0 ? (
              <p className="text-xs text-[#5b6b7c] italic">Nenhuma atividade concluída no período.</p>
            ) : (
              completedActivities.map(act => (
                <div key={act.id} className="p-2.5 bg-[#f8fafc] rounded-lg border border-[#dde5ee] text-xs flex justify-between items-center">
                  <div>
                    <div className="font-bold text-[#16202b]">{act.title}</div>
                    <div className="text-[11px] text-[#5b6b7c]">Resp: {act.responsible} | Categoria: {act.category} | Prazo: {act.dueDate}</div>
                  </div>
                  <span className="text-[11px] font-bold text-[#1b7f4f] bg-[#e7f6ee] px-2 py-0.5 rounded">
                    Concluído em {act.completedAt || act.updatedAt}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Occurrences & Corrective Actions */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#0d3f75] border-b border-[#dde5ee] pb-1">
            4. Ocorrências e Tratativas Corretivas
          </h2>
          <div className="space-y-1.5 pt-1">
            {occurrences.map(ocr => (
              <div key={ocr.id} className="p-2.5 bg-[#f8fafc] rounded-lg border border-[#dde5ee] text-xs">
                <div className="flex justify-between font-bold text-[#16202b] mb-1">
                  <span>[{ocr.sector}] {ocr.category}</span>
                  <span className={ocr.status === 'Resolvida' ? 'text-[#1b7f4f]' : 'text-[#c25708]'}>
                    {ocr.status}
                  </span>
                </div>
                <p className="text-[11px] text-[#5b6b7c]">{ocr.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Signatures */}
        <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
          <div className="border-t border-[#16202b] pt-2">
            <strong>Thiago Rosa</strong>
            <p className="text-[11px] text-[#5b6b7c]">Almoxarife Responsável Técnico</p>
          </div>
          <div className="border-t border-[#16202b] pt-2">
            <strong>Coordenação de Suprimentos & Farmácia</strong>
            <p className="text-[11px] text-[#5b6b7c]">Diretoria Administrativa Hospitalar</p>
          </div>
        </div>

      </div>

    </div>
  );
};
