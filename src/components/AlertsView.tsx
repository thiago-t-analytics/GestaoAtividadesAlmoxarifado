import React, { useState } from 'react';
import { Alert, AlertPriority, User } from '../types';
import { 
  Bell, 
  Plus, 
  AlertTriangle, 
  Calendar, 
  User as UserIcon, 
  CheckCircle2, 
  X, 
  ShieldAlert 
} from 'lucide-react';

interface AlertsViewProps {
  alerts: Alert[];
  currentUser: User;
  onSaveAlert: (dados: Partial<Alert>) => void;
  onDismissAlert: (id: string) => void;
  todayDateStr: string;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  currentUser,
  onSaveAlert,
  onDismissAlert,
  todayDateStr
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<AlertPriority>('Vermelho');
  const [targetUser, setTargetUser] = useState<'Todos' | 'Thiago' | 'Marcel' | 'Rafael'>('Todos');
  const [expiresAt, setExpiresAt] = useState(todayDateStr);

  const activeAlerts = alerts.filter(a => a.active);
  const archivedAlerts = alerts.filter(a => !a.active);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    onSaveAlert({
      message: message.trim(),
      priority,
      targetUser,
      expiresAt
    });

    setIsModalOpen(false);
    setMessage('');
  };

  const getAlertStyles = (p: AlertPriority) => {
    switch (p) {
      case 'Vermelho':
        return { bg: 'bg-[#fee2e2]', border: 'border-[#ef4444]', text: 'text-[#991b1b]', tag: 'bg-[#dc2626] text-white' };
      case 'Laranja':
        return { bg: 'bg-[#ffedd5]', border: 'border-[#f97316]', text: 'text-[#9a3412]', tag: 'bg-[#ea580c] text-white' };
      case 'Amarelo':
        return { bg: 'bg-[#fef9c3]', border: 'border-[#eab308]', text: 'text-[#854d0e]', tag: 'bg-[#ca8a04] text-white' };
      case 'Verde':
        return { bg: 'bg-[#dcfce7]', border: 'border-[#22c55e]', text: 'text-[#166534]', tag: 'bg-[#16a34a] text-white' };
    }
  };

  return (
    <div className="space-y-4" id="alerts-view">
      
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-[#dde5ee] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[#16202b]">
              Quadro de Avisos & Alertas Operacionais
            </h2>
            <span className="bg-[#fee2e2] text-[#dc2626] font-bold text-xs px-2 py-0.5 rounded-full">
              {activeAlerts.length} ativos
            </span>
          </div>
          <p className="text-xs text-[#5b6b7c]">
            Comunicação direta de urgências, avisos de desabastecimento crítico e notas de conformidade sanitária.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-xs font-bold text-white bg-[#1565c0] hover:bg-[#0d3f75] rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Emitir Alerta</span>
        </button>
      </div>

      {/* Active Alerts List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#5b6b7c]">Alertas Ativos ({activeAlerts.length})</h3>
        
        {activeAlerts.length === 0 ? (
          <div className="bg-white p-6 rounded-xl border border-[#dde5ee] text-center text-[#5b6b7c] text-xs">
            Nenhum alerta crítico ativo no momento.
          </div>
        ) : (
          activeAlerts.map(alert => {
            const style = getAlertStyles(alert.priority);
            return (
              <div
                key={alert.id}
                className={`${style.bg} ${style.border} border-l-4 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${style.tag}`}>
                      Prioridade {alert.priority}
                    </span>
                    <span className="text-xs font-semibold text-[#16202b] flex items-center gap-1">
                      <UserIcon className="w-3 h-3 text-[#1565c0]" />
                      Destinatário: <strong>{alert.targetUser}</strong>
                    </span>
                    <span className="text-[11px] text-[#5b6b7c] flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Expira em: {alert.expiresAt}
                    </span>
                  </div>

                  <p className={`text-xs sm:text-sm font-semibold ${style.text} leading-relaxed`}>
                    {alert.message}
                  </p>

                  <div className="text-[10px] text-[#5b6b7c]">
                    Emitido por: {alert.createdBy} em {alert.createdAt}
                  </div>
                </div>

                <button
                  onClick={() => onDismissAlert(alert.id)}
                  className="px-3 py-1.5 bg-white/80 hover:bg-white text-xs font-bold rounded-lg border border-black/10 text-[#16202b] transition-colors self-end sm:self-auto cursor-pointer"
                >
                  Arquivar
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Archived Alerts Accordion */}
      {archivedAlerts.length > 0 && (
        <div className="pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#5b6b7c] mb-2">Alertas Arquivados ({archivedAlerts.length})</h3>
          <div className="space-y-2 opacity-70">
            {archivedAlerts.slice(0, 5).map(alert => (
              <div key={alert.id} className="bg-white p-3 rounded-lg border border-[#dde5ee] text-xs flex justify-between items-center text-[#5b6b7c]">
                <div>
                  <span className="font-bold text-[#16202b] pr-2">[{alert.priority}]</span>
                  <span>{alert.message}</span>
                </div>
                <span className="text-[10px]">{alert.createdAt}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Emitir Alerta */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#dde5ee]">
            <div className="flex justify-between items-center pb-3 border-b border-[#dde5ee] mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#1565c0]" />
                <h3 className="font-bold text-[#16202b] text-base">Emitir Alerta Operacional</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-[#f2f5f9]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-[#16202b] mb-1">Nível de Prioridade *</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Vermelho', 'Laranja', 'Amarelo', 'Verde'] as AlertPriority[]).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`p-2 rounded-lg font-bold text-xs border transition-all cursor-pointer ${
                        priority === p
                          ? p === 'Vermelho' ? 'bg-[#fee2e2] text-[#dc2626] border-[#dc2626] ring-2 ring-[#dc2626]/20' :
                            p === 'Laranja' ? 'bg-[#ffedd5] text-[#ea580c] border-[#ea580c] ring-2 ring-[#ea580c]/20' :
                            p === 'Amarelo' ? 'bg-[#fef9c3] text-[#ca8a04] border-[#ca8a04] ring-2 ring-[#ca8a04]/20' :
                            'bg-[#dcfce7] text-[#16a34a] border-[#16a34a] ring-2 ring-[#16a34a]/20'
                          : 'bg-[#f8fafc] text-[#5b6b7c] border-[#dde5ee]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#16202b] mb-1">Destinatário do Aviso</label>
                <select
                  value={targetUser}
                  onChange={(e) => setTargetUser(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[#dde5ee] rounded-lg"
                >
                  <option value="Todos">Todos os Colaboradores</option>
                  <option value="Marcel">Marcel (Assistente)</option>
                  <option value="Rafael">Rafael (Assistente)</option>
                  <option value="Thiago">Thiago (Almoxarife)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#16202b] mb-1">Data de Expiração</label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dde5ee] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#16202b] mb-1">Mensagem do Alerta *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ex: 🔴 ATENÇÃO: Inventário emergencial de cateteres da UTI deve ser concluído até às 17h..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dde5ee] rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#16202b] bg-white border border-[#dde5ee] hover:bg-[#f2f5f9] rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#1565c0] hover:bg-[#0d3f75] rounded-lg shadow-sm"
                >
                  Publicar Alerta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
