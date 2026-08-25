import React from 'react';
import { User, Alert } from '../types';
import { INITIAL_USERS } from '../data/initialData';
import { 
  Building2, 
  UserCheck, 
  Bell, 
  RefreshCw, 
  PlusCircle, 
  AlertTriangle,
  Search,
  Calendar,
  Layers,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  activeAlertsCount?: number;
  openOccurrencesCount?: number;
  onOpenDeliverables?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSync?: () => void;
  onNewActivity?: () => void;
  onNewOccurrence?: () => void;
  todayDateStr?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onUserChange,
  activeAlertsCount = 0,
  openOccurrencesCount = 0,
  onOpenDeliverables,
  searchQuery = '',
  onSearchChange,
  onSync,
  onNewActivity,
  onNewOccurrence,
  todayDateStr
}) => {
  return (
    <header className="h-16 bg-[#1565c0] flex items-center justify-between px-4 sm:px-8 text-white shrink-0 shadow-md sticky top-0 z-40" id="main-header">
      {/* Brand & Hospital Logistics Title */}
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center font-bold text-xl text-white shadow-inner">
          H
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center">
            <span>Gestão de Almoxarifado</span>
            <span className="hidden sm:inline-block font-light opacity-80 uppercase text-[10px] sm:text-xs ml-2 border-l border-white/30 pl-2 tracking-wider">
              Logística Hospitalar
            </span>
          </h1>
          <p className="text-[11px] text-white/70 flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Plantão: {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}</span>
          </p>
        </div>
      </div>

      {/* Global Search & Quick Actions */}
      <div className="flex items-center gap-3 sm:gap-6">
        
        {/* Quick Action Buttons (Compact & Geometric) */}
        <div className="hidden lg:flex items-center gap-2">
          {onSync && (
            <button
              id="btn-sync-executions"
              onClick={onSync}
              title="Sincronizar rotinas"
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-white/90" />
              <span>Sincronizar</span>
            </button>
          )}

          {onNewOccurrence && (
            <button
              id="btn-quick-new-occurrence"
              onClick={onNewOccurrence}
              title="Registrar Ocorrência / Falta de Material"
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-[#c62828] hover:bg-[#b71c1c] text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Ocorrência</span>
            </button>
          )}

          {onNewActivity && (
            <button
              id="btn-quick-new-activity"
              onClick={onNewActivity}
              title="Criar Nova Atividade"
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white text-[#1565c0] hover:bg-blue-50 flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Atividade</span>
            </button>
          )}
        </div>

        {/* User Identity & Switcher matching Geometric Balance Header */}
        <div className="flex items-center gap-3 pl-2 sm:border-l sm:border-white/20">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5">
              <label htmlFor="header-user-select" className="sr-only">Operador</label>
              <select
                id="header-user-select"
                value={currentUser.name}
                onChange={(e) => {
                  const found = INITIAL_USERS.find(u => u.name === e.target.value);
                  if (found) onUserChange(found);
                }}
                aria-label="Selecionar Operador Ativo"
                className="bg-transparent text-xs sm:text-sm font-semibold text-white focus:outline-none cursor-pointer text-right hover:text-white/90"
              >
                {INITIAL_USERS.map((user) => (
                  <option key={user.id} value={user.name} className="text-[#16202b] bg-white">
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-white/60 pointer-events-none -ml-1" />
            </div>
            <span className="text-[9px] sm:text-[10px] opacity-75 uppercase tracking-widest font-mono">
              {currentUser.role === 'Almoxarife' ? 'Acesso Administrador' : 'Assistente Operacional'}
            </span>
          </div>

          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#0d3f75] rounded-full border-2 border-white/30 flex items-center justify-center font-bold text-xs sm:text-sm shadow-inner text-white">
            {currentUser.name.charAt(0)}
          </div>
        </div>

      </div>
    </header>
  );
};
