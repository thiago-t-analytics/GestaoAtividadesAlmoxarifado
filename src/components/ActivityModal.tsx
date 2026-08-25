import React, { useState } from 'react';
import { Activity, User, HospitalItem, ChecklistItem } from '../types';
import { 
  X, 
  CheckSquare, 
  MessageSquare, 
  Calendar, 
  User as UserIcon, 
  AlertTriangle, 
  Send, 
  CheckCircle2, 
  Plus, 
  Layers, 
  FileText, 
  Package, 
  Clock, 
  Trash2,
  Edit3
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ActivityModalProps {
  activity: Activity | null;
  items: HospitalItem[];
  currentUser: User;
  onClose: () => void;
  onChecklistToggle: (activityId: string, checklistId: string, completed: boolean, completedQty?: number) => void;
  onAddChecklistItem: (activityId: string, text: string, targetQty?: number, unit?: string) => void;
  onSendMessage: (activityId: string, text: string) => void;
  onCompleteActivity: (activityId: string) => void;
  onCancelActivity: (activityId: string) => void;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  activity,
  items,
  currentUser,
  onClose,
  onChecklistToggle,
  onAddChecklistItem,
  onSendMessage,
  onCompleteActivity,
  onCancelActivity
}) => {
  if (!activity) return null;

  const [messageText, setMessageText] = useState('');
  const [newChecklistText, setNewChecklistText] = useState('');
  const [newChecklistQty, setNewChecklistQty] = useState('');
  const [newChecklistUnit, setNewChecklistUnit] = useState('un');
  const [showAddChecklist, setShowAddChecklist] = useState(false);

  const relatedItems = items.filter(i => activity.itemIds?.includes(i.id) || activity.itemIds?.includes(i.code));
  const completedCount = activity.checklist.filter(c => c.completed).length;
  const totalCount = activity.checklist.length;
  const isDone = activity.status === 'Concluída';

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    onSendMessage(activity.id, messageText.trim());
    setMessageText('');
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    const qty = newChecklistQty ? Number(newChecklistQty) : undefined;
    onAddChecklistItem(activity.id, newChecklistText.trim(), qty, newChecklistUnit);
    setNewChecklistText('');
    setNewChecklistQty('');
    setShowAddChecklist(false);
  };

  const handleCompleteWithConfetti = () => {
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 }
    });
    onCompleteActivity(activity.id);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto" id="activity-detail-modal">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#dde5ee] overflow-hidden my-auto animate-in fade-in duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#dde5ee] flex items-start justify-between bg-[#fafbfc]">
          <div className="space-y-1 flex-1 pr-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                activity.status === 'Concluída' ? 'bg-[#e7f6ee] text-[#1b7f4f]' :
                activity.status === 'Em atraso' ? 'bg-[#fdeaea] text-[#c62828]' :
                activity.status === 'Pendente' ? 'bg-[#fdeee2] text-[#c25708]' :
                activity.status === 'Agendada' ? 'bg-[#fff5dc] text-[#b57d00]' :
                'bg-[#f1f5f9] text-[#94a3b8]'
              }`}>
                {activity.status}
              </span>
              <span className="bg-[#e3f2fd] text-[#1565c0] text-xs font-semibold px-2 py-0.5 rounded">
                {activity.category}
              </span>
              <span className="bg-[#f2f5f9] text-[#5b6b7c] text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {activity.periodicity} ({activity.type})
              </span>
              {activity.priority === 'Urgente' && (
                <span className="bg-[#c62828] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  URGENTE
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-[#16202b] pt-1">
              {activity.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#5b6b7c] hover:text-[#16202b] hover:bg-[#f2f5f9] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          
          {/* Metadata Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#f8fafc] p-3 rounded-xl border border-[#dde5ee]">
            <div>
              <span className="text-[11px] text-[#5b6b7c] block font-medium">Responsável</span>
              <span className="font-bold text-[#16202b] flex items-center gap-1 mt-0.5">
                <UserIcon className="w-3.5 h-3.5 text-[#1565c0]" />
                {activity.responsible}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-[#5b6b7c] block font-medium">Data de Execução</span>
              <span className="font-bold text-[#16202b] flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-[#1565c0]" />
                {activity.executionDate}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-[#5b6b7c] block font-medium">Prazo Limite</span>
              <span className={`font-bold flex items-center gap-1 mt-0.5 ${
                activity.status === 'Em atraso' ? 'text-[#c62828]' : 'text-[#16202b]'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                {activity.dueDate} ({activity.deadlineDays}d)
              </span>
            </div>

            <div>
              <span className="text-[11px] text-[#5b6b7c] block font-medium">Progresso Checklist</span>
              <span className="font-bold text-[#1565c0] flex items-center gap-1 mt-0.5">
                <CheckSquare className="w-3.5 h-3.5" />
                {completedCount}/{totalCount} ({totalCount > 0 ? Math.round((completedCount/totalCount)*100) : 0}%)
              </span>
            </div>
          </div>

          {/* Occurrence Source Notice */}
          {activity.originOccurrenceId && (
            <div className="bg-[#fdeee2] border-l-4 border-[#c25708] p-3 rounded-r-lg flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[#c25708] font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Atividade de Ação Corretiva vinculada à Ocorrência #{activity.originOccurrenceId}</span>
              </div>
            </div>
          )}

          {/* Description */}
          {activity.description && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#5b6b7c] mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#1565c0]" />
                Descrição e Escopo
              </h4>
              <p className="text-[#16202b] leading-relaxed bg-[#ffffff] p-3 rounded-lg border border-[#dde5ee]">
                {activity.description}
              </p>
            </div>
          )}

          {/* "Como Executar" Detailed Instructions (Mandatory Requirement) */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5b6b7c] mb-1 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#1565c0]" />
              Instruções Operacionais ("Como Executar")
            </h4>
            <div className="bg-[#eef2f6] p-3.5 rounded-lg border border-[#dde5ee] text-[#16202b] whitespace-pre-line leading-relaxed text-xs sm:text-sm font-mono">
              {activity.instructions || 'Nenhuma instrução específica detalhada. Seguir manual de boas práticas do almoxarifado hospitalar.'}
            </div>
          </div>

          {/* Related Hospital Items from Catalog */}
          {relatedItems.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#5b6b7c] mb-2 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#1565c0]" />
                Itens Relacionados ({relatedItems.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {relatedItems.map(item => (
                  <div key={item.id} className="p-2.5 rounded-lg bg-[#ffffff] border border-[#dde5ee] flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-[#16202b]">{item.code} - {item.name}</div>
                      <div className="text-[11px] text-[#5b6b7c] mt-0.5">Local: <strong>{item.location}</strong> | Categoria: {item.category}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#1565c0]">{item.currentStock} {item.unit}</span>
                      <span className="text-[10px] text-[#5b6b7c] block">Mín: {item.minimumStock}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#5b6b7c] flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-[#1565c0]" />
                Checklist de Execução ({completedCount}/{totalCount})
              </h4>
              <button
                type="button"
                onClick={() => setShowAddChecklist(!showAddChecklist)}
                className="text-xs font-semibold text-[#1565c0] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Etapa</span>
              </button>
            </div>

            {/* Add checklist inline form */}
            {showAddChecklist && (
              <form onSubmit={handleAddChecklist} className="mb-3 p-3 bg-[#f2f5f9] rounded-xl border border-[#dde5ee] flex flex-wrap gap-2 items-center">
                <input
                  type="text"
                  placeholder="Nova etapa do checklist..."
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  className="flex-1 min-w-[200px] text-xs px-3 py-1.5 bg-white border border-[#dde5ee] rounded-lg focus:outline-none focus:border-[#1565c0]"
                  autoFocus
                />
                <input
                  type="number"
                  placeholder="Meta Qtd (opcional)"
                  value={newChecklistQty}
                  onChange={(e) => setNewChecklistQty(e.target.value)}
                  className="w-28 text-xs px-3 py-1.5 bg-white border border-[#dde5ee] rounded-lg focus:outline-none focus:border-[#1565c0]"
                />
                <select
                  value={newChecklistUnit}
                  onChange={(e) => setNewChecklistUnit(e.target.value)}
                  className="text-xs px-2 py-1.5 bg-white border border-[#dde5ee] rounded-lg"
                >
                  <option value="un">un</option>
                  <option value="cx">cx</option>
                  <option value="par">par</option>
                  <option value="rl">rl</option>
                  <option value="pct">pct</option>
                  <option value="fr">fr</option>
                </select>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#1565c0] text-white text-xs font-bold rounded-lg hover:bg-[#0d3f75]"
                >
                  Salvar
                </button>
              </form>
            )}

            {/* Checklist items list */}
            <div className="space-y-2">
              {activity.checklist.length === 0 ? (
                <p className="text-xs text-[#5b6b7c] italic bg-[#f8fafc] p-3 rounded-lg border border-[#dde5ee]">
                  Nenhuma etapa cadastrada no checklist.
                </p>
              ) : (
                activity.checklist.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      item.completed
                        ? 'bg-[#e7f6ee]/40 border-[#86efac]'
                        : 'bg-white border-[#dde5ee] hover:border-[#bbdefb]'
                    }`}
                  >
                    <label className="flex items-center gap-3 flex-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={(e) => onChecklistToggle(activity.id, item.id, e.target.checked)}
                        className="w-4 h-4 rounded text-[#1565c0] focus:ring-[#1565c0] cursor-pointer"
                      />
                      <span className={`text-xs sm:text-sm font-medium ${
                        item.completed ? 'line-through text-[#5b6b7c]' : 'text-[#16202b]'
                      }`}>
                        {item.text}
                      </span>
                    </label>

                    {/* Target quantity display or quick updater */}
                    {item.targetQuantity !== undefined && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold ml-2">
                        <span className={item.completed ? 'text-[#1b7f4f]' : 'text-[#5b6b7c]'}>
                          {item.completed ? item.targetQuantity : (item.completedQuantity || 0)} / {item.targetQuantity} {item.unit || 'un'}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Operational Chat / Communication History */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5b6b7c] mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#1565c0]" />
              Chat e Observações de Plantão ({activity.messages?.length || 0})
            </h4>

            {/* Message log */}
            <div className="bg-[#f8fafc] border border-[#dde5ee] rounded-xl p-3 max-h-48 overflow-y-auto space-y-2 mb-2">
              {(!activity.messages || activity.messages.length === 0) ? (
                <p className="text-xs text-[#5b6b7c] italic text-center py-2">
                  Nenhuma mensagem registrada nesta atividade ainda.
                </p>
              ) : (
                activity.messages.map((msg) => (
                  <div key={msg.id} className="bg-white p-2.5 rounded-lg border border-[#dde5ee] shadow-2xs">
                    <div className="flex justify-between items-center text-[11px] mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#16202b]">{msg.author}</span>
                        <span className="text-[10px] text-[#1565c0] bg-[#e3f2fd] px-1.5 py-0.2 rounded font-semibold">
                          {msg.role}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#5b6b7c]">{msg.timestamp}</span>
                    </div>
                    <p className="text-xs text-[#16202b] leading-relaxed">{msg.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Message input */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                placeholder={`Escrever como ${currentUser.name} (${currentUser.role})...`}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 text-xs px-3 py-2 bg-white border border-[#dde5ee] rounded-lg focus:outline-none focus:border-[#1565c0]"
              />
              <button
                type="submit"
                disabled={!messageText.trim()}
                className="px-4 py-2 bg-[#1565c0] hover:bg-[#0d3f75] disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar</span>
              </button>
            </form>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-[#dde5ee] bg-[#fafbfc] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {!isDone && activity.status !== 'Cancelada' && (
              <button
                type="button"
                onClick={() => onCancelActivity(activity.id)}
                className="px-3 py-2 text-xs font-semibold text-[#c62828] hover:bg-[#fdeaea] rounded-lg transition-colors cursor-pointer"
              >
                Cancelar Atividade
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#16202b] bg-white border border-[#dde5ee] hover:bg-[#f2f5f9] rounded-lg transition-colors cursor-pointer"
            >
              Fechar
            </button>

            {!isDone && (
              <button
                type="button"
                onClick={handleCompleteWithConfetti}
                className="px-4 py-2 text-xs font-bold text-white bg-[#1b7f4f] hover:bg-[#15803d] rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Concluir Atividade</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
