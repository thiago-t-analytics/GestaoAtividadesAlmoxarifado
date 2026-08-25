import React from 'react';
import { NavigationTab } from '../types';
import { 
  CheckSquare, 
  BarChart3, 
  ListTodo, 
  AlertTriangle, 
  Bell, 
  Boxes, 
  FileText, 
  Code2 
} from 'lucide-react';

interface NavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  counts: {
    kanban: number;
    atividades: number;
    ocorrencias: number;
    alertas: number;
  };
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  counts
}) => {
  const [syncTime, setSyncTime] = React.useState('14:32:05');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSyncTime(now.toLocaleTimeString('pt-BR'));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const navItems: { id: NavigationTab; label: string; badge?: number; badgeColor?: string }[] = [
    {
      id: 'kanban',
      label: 'Painel',
      badge: counts.kanban > 0 ? counts.kanban : undefined,
      badgeColor: 'bg-[#c62828] text-white'
    },
    {
      id: 'atividades',
      label: 'Atividades',
      badge: counts.atividades,
      badgeColor: 'bg-[#dde5ee] text-[#16202b]'
    },
    {
      id: 'ocorrencias',
      label: 'Ocorrências',
      badge: counts.ocorrencias > 0 ? counts.ocorrencias : undefined,
      badgeColor: 'bg-[#c25708] text-white'
    },
    {
      id: 'alertas',
      label: 'Alertas',
      badge: counts.alertas > 0 ? counts.alertas : undefined,
      badgeColor: 'bg-[#b57d00] text-white'
    },
    {
      id: 'dashboard',
      label: 'Indicadores'
    },
    {
      id: 'itens',
      label: 'Catálogo'
    },
    {
      id: 'relatorios',
      label: 'Relatórios'
    },
    {
      id: 'deliverables',
      label: 'Código GAS'
    }
  ];

  return (
    <nav className="h-12 bg-white border-b border-[#dde5ee] flex items-center px-4 sm:px-8 gap-4 sm:gap-6 shrink-0 overflow-x-auto no-scrollbar" id="navigation-tabs">
      <div className="flex items-center gap-4 sm:gap-6">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => onTabChange(item.id)}
              className={`h-12 px-2 font-medium text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-[#1565c0] text-[#1565c0] font-semibold'
                  : 'border-transparent text-[#5b6b7c] hover:text-[#1565c0]'
              }`}
            >
              {isActive && (
                <span className="w-2 h-2 rounded-full bg-[#1565c0]"></span>
              )}
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold leading-tight ${item.badgeColor || 'bg-[#dde5ee] text-[#16202b]'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="ml-auto hidden md:flex items-center gap-2">
        <span className="text-[11px] text-[#5b6b7c] font-mono bg-[#f2f5f9] px-2.5 py-1 rounded border border-[#dde5ee]/80">
          Sinc: {syncTime}
        </span>
      </div>
    </nav>
  );
};
