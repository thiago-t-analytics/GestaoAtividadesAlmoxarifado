import React, { useState } from 'react';
import { Occurrence, HospitalItem, User, Activity } from '../types';
import { 
  AlertTriangle, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Package, 
  ExternalLink, 
  Building, 
  User as UserIcon,
  X,
  Zap
} from 'lucide-react';

interface OccurrencesViewProps {
  occurrences: Occurrence[];
  items: HospitalItem[];
  currentUser: User;
  onSaveOccurrence: (dados: Partial<Occurrence>) => void;
  onUpdateOccurrence: (id: string, dados: Partial<Occurrence>) => void;
  onOpenActivityDetailsById: (activityId: string) => void;
}

export const OccurrencesView: React.FC<OccurrencesViewProps> = ({
  occurrences,
  items,
  currentUser,
  onSaveOccurrence,
  onUpdateOccurrence,
  onOpenActivityDetailsById
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sector, setSector] = useState('UTI Adulto');
  const [category, setCategory] = useState('Avaria / Embalagem Violada');
  const [type, setType] = useState('Divergência Física');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  const [description, setDescription] = useState('');
  const [needsAction, setNeedsAction] = useState(true);

  const [statusFilter, setStatusFilter] = useState('todos');

  const sectors = [
    'UTI Adulto - Bloco B',
    'Pronto Atendimento',
    'Centro Cirúrgico',
    'Maternidade',
    'Enfermaria Clínica',
    'Farmácia Central',
    'Almoxarifado Central (Doca)',
    'Hemodinâmica',
    'Pediatria'
  ];

  const categories = [
    'Avaria / Embalagem Violada',
    'Ruptura de Estoque / Estoque Crítico',
    'Validade Próxima (< 60 dias)',
    'Divergência de Quantidade',
    'Item Fora da Especificação',
    'Problema com Transportadora / NF',
    'Desvio de Armazenamento / Temperatura'
  ];

  const types = [
    'Divergência Física',
    'Falta de Material',
    'Gestão de Lote',
    'Dispensação Errada',
    'Qualidade / Quarentena',
    'Ajuste de Inventário'
  ];

  const filtered = occurrences.filter(o => {
    if (statusFilter !== 'todos' && o.status !== statusFilter) return false;
    return true;
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const itemObj = items.find(i => i.id === selectedItemId);

    onSaveOccurrence({
      sector,
      category,
      type,
      itemId: selectedItemId || undefined,
      itemName: itemObj ? `${itemObj.code} - ${itemObj.name}` : undefined,
      description: description.trim(),
      needsAction
    });

    setIsModalOpen(false);
    setDescription('');
    setSelectedItemId('');
    setItemSearch('');
  };

  const filteredCatalogItems = items.filter(i =>
    i.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
    i.code.includes(itemSearch) ||
    i.category.toLowerCase().includes(itemSearch.toLowerCase())
  );

  return (
    <div className="space-y-4" id="occurrences-view">
      
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-[#dde5ee] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[#16202b]">
              Registro de Ocorrências e Desvios Operacionais
            </h2>
            <span className="bg-[#fdeee2] text-[#c25708] font-bold text-xs px-2 py-0.5 rounded-full">
              {occurrences.filter(o => o.status !== 'Resolvida').length} abertas
            </span>
          </div>
          <p className="text-xs text-[#5b6b7c]">
            Rastreio de faltas, embalagens rompidas, divergências de dispensação e disparador automático de ações corretivas.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-xs font-bold text-white bg-[#c62828] hover:bg-[#b71c1c] rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer self-start md:self-auto"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>+ Registrar Ocorrência</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs font-semibold">
        <span className="text-[#5b6b7c]">Filtrar por Status:</span>
        <button
          onClick={() => setStatusFilter('todos')}
          className={`px-3 py-1 rounded-lg border transition-all ${
            statusFilter === 'todos' ? 'bg-[#1565c0] text-white border-[#1565c0]' : 'bg-white text-[#5b6b7c] border-[#dde5ee]'
          }`}
        >
          Todas ({occurrences.length})
        </button>
        <button
          onClick={() => setStatusFilter('Aberta')}
          className={`px-3 py-1 rounded-lg border transition-all ${
            statusFilter === 'Aberta' ? 'bg-[#c62828] text-white border-[#c62828]' : 'bg-white text-[#5b6b7c] border-[#dde5ee]'
          }`}
        >
          Abertas ({occurrences.filter(o => o.status === 'Aberta').length})
        </button>
        <button
          onClick={() => setStatusFilter('Em Tratamento')}
          className={`px-3 py-1 rounded-lg border transition-all ${
            statusFilter === 'Em Tratamento' ? 'bg-[#c25708] text-white border-[#c25708]' : 'bg-white text-[#5b6b7c] border-[#dde5ee]'
          }`}
        >
          Em Tratamento ({occurrences.filter(o => o.status === 'Em Tratamento').length})
        </button>
        <button
          onClick={() => setStatusFilter('Resolvida')}
          className={`px-3 py-1 rounded-lg border transition-all ${
            statusFilter === 'Resolvida' ? 'bg-[#1b7f4f] text-white border-[#1b7f4f]' : 'bg-white text-[#5b6b7c] border-[#dde5ee]'
          }`}
        >
          Resolvidas ({occurrences.filter(o => o.status === 'Resolvida').length})
        </button>
      </div>

      {/* Occurrences Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white p-8 rounded-xl border border-[#dde5ee] text-center text-[#5b6b7c]">
            <CheckCircle2 className="w-10 h-10 text-[#1b7f4f] mx-auto mb-2 opacity-60" />
            <p className="font-semibold text-sm text-[#16202b]">Nenhuma ocorrência neste status</p>
            <p className="text-xs mt-1">O setor está operando em conformidade total.</p>
          </div>
        ) : (
          filtered.map(ocr => {
            const isResolved = ocr.status === 'Resolvida';
            const isInProgress = ocr.status === 'Em Tratamento';
            return (
              <div
                key={ocr.id}
                className="bg-white rounded-xl p-4 border border-[#dde5ee] shadow-xs flex flex-col justify-between gap-3 relative overflow-hidden"
              >
                {/* Status Bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  isResolved ? 'bg-[#1b7f4f]' : isInProgress ? 'bg-[#c25708]' : 'bg-[#c62828]'
                }`} />

                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-[11px] font-mono font-bold text-[#5b6b7c] bg-[#f2f5f9] px-2 py-0.5 rounded">
                      {ocr.id}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase ${
                      isResolved ? 'bg-[#e7f6ee] text-[#1b7f4f]' :
                      isInProgress ? 'bg-[#fdeee2] text-[#c25708]' :
                      'bg-[#fdeaea] text-[#c62828]'
                    }`}>
                      {ocr.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-[#16202b] text-sm leading-snug flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#1565c0]" />
                    {ocr.sector}
                  </h3>

                  <div className="flex flex-wrap gap-1.5 my-2">
                    <span className="bg-[#fdeaea] text-[#c62828] text-[11px] font-bold px-2 py-0.5 rounded">
                      {ocr.category}
                    </span>
                    <span className="bg-[#f2f5f9] text-[#5b6b7c] text-[11px] font-medium px-2 py-0.5 rounded">
                      {ocr.type}
                    </span>
                  </div>

                  {ocr.itemName && (
                    <div className="bg-[#f8fafc] p-2 rounded-lg border border-[#dde5ee] text-xs font-semibold text-[#16202b] flex items-center gap-1.5 my-2">
                      <Package className="w-3.5 h-3.5 text-[#1565c0]" />
                      <span className="truncate">{ocr.itemName}</span>
                    </div>
                  )}

                  <p className="text-xs text-[#5b6b7c] leading-relaxed line-clamp-3">
                    {ocr.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#dde5ee]/60">
                  
                  {/* Auto-task link */}
                  {ocr.generatedActivityId && (
                    <button
                      onClick={() => onOpenActivityDetailsById(ocr.generatedActivityId!)}
                      className="w-full text-left p-2 rounded-lg bg-[#e3f2fd] hover:bg-[#bbdefb] border border-[#90caf9] text-xs font-bold text-[#1565c0] flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-[#c25708]" />
                        <span>Ver Ação Corretiva Gerada</span>
                      </span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div className="flex justify-between items-center text-[11px] text-[#5b6b7c]">
                    <span>Reg: <strong>{ocr.registeredBy}</strong> ({ocr.registeredAt})</span>
                    {!isResolved && (
                      <button
                        onClick={() => onUpdateOccurrence(ocr.id, { status: 'Resolvida' })}
                        className="px-2 py-1 bg-[#1b7f4f] hover:bg-[#15803d] text-white font-bold text-[10px] rounded cursor-pointer"
                      >
                        Encerrar
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Modal Nova Ocorrência */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#dde5ee] overflow-hidden my-auto">
            
            <div className="px-6 py-4 border-b border-[#dde5ee] flex items-center justify-between bg-[#fafbfc]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#c62828]" />
                <h3 className="font-bold text-[#16202b] text-base">Registrar Nova Ocorrência Hospitalar</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-[#f2f5f9]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              
              <div>
                <label className="block font-semibold text-[#16202b] mb-1">Setor Solicitante / Notificante *</label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dde5ee] rounded-lg"
                >
                  {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#16202b] mb-1">Categoria do Desvio *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-[#dde5ee] rounded-lg"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#16202b] mb-1">Tipo de Ocorrência</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 border border-[#dde5ee] rounded-lg"
                  >
                    {types.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Item Selection Autocomplete */}
              <div>
                <label className="block font-semibold text-[#16202b] mb-1">Item Relacionado (Catálogo Hospitalar)</label>
                <input
                  type="text"
                  placeholder="Buscar código ou descrição do item..."
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#dde5ee] rounded-lg text-xs mb-1.5"
                />
                <div className="max-h-28 overflow-y-auto border border-[#dde5ee] rounded-lg p-1.5 bg-[#f8fafc] space-y-1">
                  <div
                    onClick={() => { setSelectedItemId(''); setItemSearch(''); }}
                    className={`p-1.5 rounded text-xs cursor-pointer ${
                      selectedItemId === '' ? 'bg-[#1565c0] text-white font-bold' : 'hover:bg-[#e2e8f0]'
                    }`}
                  >
                    Nenhum item específico / Desvio estrutural
                  </div>
                  {filteredCatalogItems.slice(0, 10).map(i => (
                    <div
                      key={i.id}
                      onClick={() => { setSelectedItemId(i.id); setItemSearch(`${i.code} - ${i.name}`); }}
                      className={`p-1.5 rounded text-xs cursor-pointer flex justify-between ${
                        selectedItemId === i.id ? 'bg-[#1565c0] text-white font-bold' : 'hover:bg-[#e2e8f0]'
                      }`}
                    >
                      <span>{i.code} - {i.name}</span>
                      <span className="text-[10px] opacity-80">{i.location}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#16202b] mb-1">Descrição Detalhada do Fato *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Descreva o que ocorreu, lote do produto, impacto no atendimento e medidas imediatas adotadas..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dde5ee] rounded-lg"
                />
              </div>

              {/* Mandatory Business Rule Highlight: Flag Necessita Ação -> Auto Activity */}
              <div className="bg-[#fdeee2] border border-[#fdba74] p-3.5 rounded-xl flex items-start gap-3">
                <input
                  id="chk-needs-action"
                  type="checkbox"
                  checked={needsAction}
                  onChange={(e) => setNeedsAction(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded text-[#c25708] focus:ring-[#c25708] cursor-pointer"
                />
                <label htmlFor="chk-needs-action" className="cursor-pointer">
                  <div className="font-bold text-[#c25708] flex items-center gap-1.5 text-xs sm:text-sm">
                    <Zap className="w-4 h-4" />
                    <span>Necessita Ação Corretiva Imediata</span>
                  </div>
                  <p className="text-[11px] text-[#9a3412] mt-0.5 leading-relaxed">
                    <strong>Regra Automática:</strong> Ao marcar esta opção, o sistema criará instantaneamente uma atividade de conferência/ajuste urgente na fila de <strong>TODOS os assistentes ativos</strong> com checklist de tratativa.
                  </p>
                </label>
              </div>

              <div className="pt-3 border-t border-[#dde5ee] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#16202b] bg-white border border-[#dde5ee] hover:bg-[#f2f5f9] rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#c62828] hover:bg-[#b71c1c] rounded-lg shadow-sm"
                >
                  Confirmar e Registrar
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
