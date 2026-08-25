import React, { useState } from 'react';
import { 
  Activity, 
  ActivityType, 
  PeriodicityType, 
  PriorityLevel, 
  HospitalItem,
  User 
} from '../types';
import { 
  X, 
  Plus, 
  Trash2, 
  Calendar, 
  Layers, 
  Package, 
  CheckSquare, 
  HelpCircle,
  FileText 
} from 'lucide-react';

interface NewActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: HospitalItem[];
  currentUser: User;
  onSave: (dados: Partial<Activity>) => void;
  todayDateStr: string;
}

export const NewActivityModal: React.FC<NewActivityModalProps> = ({
  isOpen,
  onClose,
  items,
  currentUser,
  onSave,
  todayDateStr
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Inventário & Contagem');
  const [type, setType] = useState<ActivityType>('cíclica');
  const [periodicity, setPeriodicity] = useState<PeriodicityType>('Semanal');
  const [dayOfWeek, setDayOfWeek] = useState<number>(3); // Quarta-feira
  const [dayOfMonth, setDayOfMonth] = useState<number>(15);
  const [responsible, setResponsible] = useState<'Thiago' | 'Marcel' | 'Rafael' | 'Todos'>('Marcel');
  const [executionDate, setExecutionDate] = useState(todayDateStr);
  const [deadlineDays, setDeadlineDays] = useState(1);
  const [priority, setPriority] = useState<PriorityLevel>('Alta');
  const [instructions, setInstructions] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [itemSearch, setItemSearch] = useState('');

  // Checklist items builder
  const [checklist, setChecklist] = useState<Array<{ id: string; text: string; targetQuantity?: number; unit?: string }>>([
    { id: '1', text: 'Conferência física quantitativa e checagem de lotes' }
  ]);
  const [newCheckText, setNewCheckText] = useState('');
  const [newCheckQty, setNewCheckQty] = useState('');
  const [newCheckUnit, setNewCheckUnit] = useState('un');

  const categories = [
    'Inventário & Contagem',
    'Manutenção & Limpeza',
    'Auditoria & Controle',
    'Recepção & Triagem',
    'Qualidade & Termolábeis',
    'Dispensação & Abastecimento',
    'Gestão de Lotes & Validades'
  ];

  const handleAddChecklistItem = () => {
    if (!newCheckText.trim()) return;
    setChecklist([
      ...checklist,
      {
        id: `chk-${Date.now()}`,
        text: newCheckText.trim(),
        targetQuantity: newCheckQty ? Number(newCheckQty) : undefined,
        unit: newCheckUnit
      }
    ]);
    setNewCheckText('');
    setNewCheckQty('');
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist(checklist.filter(c => c.id !== id));
  };

  const handleToggleItem = (itemId: string) => {
    if (selectedItemIds.includes(itemId)) {
      setSelectedItemIds(selectedItemIds.filter(id => id !== itemId));
    } else {
      setSelectedItemIds([...selectedItemIds, itemId]);
    }
  };

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
    i.code.includes(itemSearch) ||
    i.category.toLowerCase().includes(itemSearch.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      category,
      type,
      periodicity,
      dayOfWeek: periodicity === 'Semanal' ? Number(dayOfWeek) : undefined,
      dayOfMonth: periodicity === 'Mensal' ? Number(dayOfMonth) : undefined,
      responsible,
      executionDate,
      deadlineDays: Number(deadlineDays),
      priority,
      instructions: instructions.trim(),
      itemIds: selectedItemIds,
      checklist: checklist.map(c => ({
        id: c.id,
        text: c.text,
        completed: false,
        targetQuantity: c.targetQuantity,
        unit: c.unit
      }))
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto" id="new-activity-modal">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#dde5ee] overflow-hidden my-auto">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#dde5ee] flex items-center justify-between bg-[#fafbfc]">
          <div>
            <h2 className="text-lg font-bold text-[#16202b]">Cadastrar Nova Atividade Operacional</h2>
            <p className="text-xs text-[#5b6b7c]">Defina parâmetros, periodicidade, checklist e instruções para a equipe.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#5b6b7c] hover:bg-[#f2f5f9]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#16202b] mb-1">Título da Atividade *</label>
              <input
                type="text"
                required
                placeholder="Ex: Conferência quinzenal de seringas 5ml e agulhas"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-[#dde5ee] rounded-lg text-xs sm:text-sm focus:outline-none focus:border-[#1565c0]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#16202b] mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-[#dde5ee] rounded-lg text-xs sm:text-sm focus:outline-none focus:border-[#1565c0]"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Type, Periodicity, Recurrence */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#f8fafc] p-3.5 rounded-xl border border-[#dde5ee]">
            <div>
              <label className="block font-semibold text-[#16202b] mb-1">Tipo de Rotina</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ActivityType)}
                className="w-full px-3 py-1.5 bg-white border border-[#dde5ee] rounded-lg text-xs"
              >
                <option value="cíclica">Cíclica (Recorrente)</option>
                <option value="pontual">Pontual (Única)</option>
                <option value="auditoria">Auditoria</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#16202b] mb-1">Periodicidade</label>
              <select
                value={periodicity}
                onChange={(e) => setPeriodicity(e.target.value as PeriodicityType)}
                className="w-full px-3 py-1.5 bg-white border border-[#dde5ee] rounded-lg text-xs"
              >
                <option value="Pontual">Pontual</option>
                <option value="Semanal">Semanal</option>
                <option value="Mensal">Mensal</option>
              </select>
            </div>

            {periodicity === 'Semanal' && (
              <div>
                <label className="block font-semibold text-[#16202b] mb-1">Dia da Semana</label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-[#dde5ee] rounded-lg text-xs"
                >
                  <option value={1}>Segunda-feira</option>
                  <option value={2}>Terça-feira</option>
                  <option value={3}>Quarta-feira</option>
                  <option value={4}>Quinta-feira</option>
                  <option value={5}>Sexta-feira</option>
                  <option value={6}>Sábado</option>
                  <option value={0}>Domingo</option>
                </select>
              </div>
            )}

            {periodicity === 'Mensal' && (
              <div>
                <label className="block font-semibold text-[#16202b] mb-1">Dia do Mês (1-31)</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-[#dde5ee] rounded-lg text-xs"
                />
              </div>
            )}

            <div>
              <label className="block font-semibold text-[#16202b] mb-1">Responsável</label>
              <select
                value={responsible}
                onChange={(e) => setResponsible(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-white border border-[#dde5ee] rounded-lg text-xs font-bold text-[#1565c0]"
              >
                <option value="Todos">Todos (Fila Geral)</option>
                <option value="Marcel">Marcel (Assistente)</option>
                <option value="Rafael">Rafael (Assistente)</option>
                <option value="Thiago">Thiago (Almoxarife)</option>
              </select>
            </div>
          </div>

          {/* Dates & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[#16202b] mb-1">Data de Execução</label>
              <input
                type="date"
                value={executionDate}
                onChange={(e) => setExecutionDate(e.target.value)}
                className="w-full px-3 py-2 border border-[#dde5ee] rounded-lg text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#16202b] mb-1">Prazo Limite (Dias)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(Number(e.target.value))}
                className="w-full px-3 py-2 border border-[#dde5ee] rounded-lg text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#16202b] mb-1">Prioridade</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-3 py-2 border border-[#dde5ee] rounded-lg text-xs sm:text-sm"
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>
          </div>

          {/* Description & Detailed Instructions ("Como Executar") */}
          <div>
            <label className="block font-semibold text-[#16202b] mb-1">Descrição do Escopo</label>
            <textarea
              rows={2}
              placeholder="Resumo do objetivo da tarefa..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-[#dde5ee] rounded-lg text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#16202b] mb-1 flex items-center gap-1.5">
              <span>Instruções Detalhadas ("Como Executar")</span>
              <span className="text-[10px] text-[#5b6b7c] font-normal">(Passo a passo exibido ao assistente)</span>
            </label>
            <textarea
              rows={3}
              placeholder="1. Conferir lote e validade;&#10;2. Comparar contagem com o sistema;&#10;3. Organizar prateleiras pelo método PEPS..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3 py-2 border border-[#dde5ee] rounded-lg font-mono text-xs"
            />
          </div>

          {/* Associated Items Multi-select */}
          <div>
            <label className="block font-semibold text-[#16202b] mb-1">
              Itens Relacionados do Catálogo ({selectedItemIds.length} selecionados)
            </label>
            <input
              type="text"
              placeholder="Filtrar catálogo (ex: seringa, luva, 001)..."
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
              className="w-full px-3 py-1.5 border border-[#dde5ee] rounded-lg text-xs mb-2"
            />
            <div className="max-h-32 overflow-y-auto border border-[#dde5ee] rounded-lg p-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 bg-[#f8fafc]">
              {filteredItems.slice(0, 14).map(item => {
                const isSelected = selectedItemIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleToggleItem(item.id)}
                    className={`text-left p-1.5 rounded text-xs flex justify-between items-center transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#1565c0] text-white font-bold' : 'bg-white text-[#16202b] hover:bg-[#e2e8f0]'
                    }`}
                  >
                    <span className="truncate pr-1">{item.code} - {item.name}</span>
                    <span className="text-[10px] opacity-80 whitespace-nowrap">{item.currentStock} {item.unit}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Checklist Builder */}
          <div>
            <label className="block font-semibold text-[#16202b] mb-2">
              Checklist de Execução ({checklist.length} etapas)
            </label>

            <div className="space-y-1.5 mb-3">
              {checklist.map((c, idx) => (
                <div key={c.id} className="flex items-center justify-between p-2 bg-[#f8fafc] border border-[#dde5ee] rounded-lg text-xs">
                  <span className="font-medium text-[#16202b]">{idx + 1}. {c.text}</span>
                  <div className="flex items-center gap-2">
                    {c.targetQuantity !== undefined && (
                      <span className="text-[#1565c0] font-semibold">Meta: {c.targetQuantity} {c.unit}</span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklistItem(c.id)}
                      className="text-[#c62828] hover:bg-[#fdeaea] p-1 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Inline add stage */}
            <div className="flex flex-wrap gap-2 items-center bg-[#f2f5f9] p-2.5 rounded-lg border border-[#dde5ee]">
              <input
                type="text"
                placeholder="Descrição da etapa..."
                value={newCheckText}
                onChange={(e) => setNewCheckText(e.target.value)}
                className="flex-1 min-w-[180px] px-2.5 py-1.5 text-xs bg-white border border-[#dde5ee] rounded-lg"
              />
              <input
                type="number"
                placeholder="Qtd (opcional)"
                value={newCheckQty}
                onChange={(e) => setNewCheckQty(e.target.value)}
                className="w-24 px-2 py-1.5 text-xs bg-white border border-[#dde5ee] rounded-lg"
              />
              <select
                value={newCheckUnit}
                onChange={(e) => setNewCheckUnit(e.target.value)}
                className="px-2 py-1.5 text-xs bg-white border border-[#dde5ee] rounded-lg"
              >
                <option value="un">un</option>
                <option value="cx">cx</option>
                <option value="par">par</option>
                <option value="rl">rl</option>
                <option value="pct">pct</option>
                <option value="fr">fr</option>
              </select>
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="px-3 py-1.5 bg-[#1565c0] text-white text-xs font-bold rounded-lg hover:bg-[#0d3f75] cursor-pointer"
              >
                + Adicionar
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-[#dde5ee] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#16202b] bg-white border border-[#dde5ee] hover:bg-[#f2f5f9] rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#1565c0] hover:bg-[#0d3f75] rounded-lg shadow-sm cursor-pointer"
            >
              Salvar Atividade
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
