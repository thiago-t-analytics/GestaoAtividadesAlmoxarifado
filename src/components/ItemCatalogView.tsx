import React, { useState } from 'react';
import { HospitalItem } from '../types';
import { 
  Package, 
  Search, 
  Filter, 
  AlertTriangle, 
  MapPin, 
  Layers, 
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

interface ItemCatalogViewProps {
  items: HospitalItem[];
  onTriggerOccurrence: (item: HospitalItem) => void;
}

export const ItemCatalogView: React.FC<ItemCatalogViewProps> = ({
  items,
  onTriggerOccurrence
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todos');

  const categories = Array.from(new Set(items.map(i => i.category)));

  const filtered = items.filter(item => {
    if (categoryFilter !== 'todos' && item.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchCode = item.code.includes(q);
      const matchLoc = item.location.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchLoc) return false;
    }
    return true;
  });

  const criticalStockCount = items.filter(i => i.currentStock < i.minimumStock).length;

  return (
    <div className="space-y-4" id="catalog-view">
      
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-[#dde5ee] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[#16202b]">
              Catálogo de Suprimentos & Materiais Hospitalares
            </h2>
            <span className="bg-[#e3f2fd] text-[#1565c0] font-bold text-xs px-2 py-0.5 rounded-full">
              {items.length} itens cadastrados
            </span>
          </div>
          <p className="text-xs text-[#5b6b7c]">
            Rastreabilidade de código, prateleira, saldo físico e monitoramento de estoque de segurança.
          </p>
        </div>

        {criticalStockCount > 0 && (
          <div className="bg-[#fee2e2] border border-[#fca5a5] px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs text-[#991b1b] font-bold">
            <AlertTriangle className="w-4 h-4 text-[#dc2626]" />
            <span>{criticalStockCount} itens abaixo do estoque mínimo!</span>
          </div>
        )}
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-3 rounded-xl border border-[#dde5ee] shadow-2xs flex flex-wrap items-center gap-3 text-xs">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-3.5 h-3.5 text-[#5b6b7c] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código, nome ou prateleira..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#f8fafc] border border-[#dde5ee] rounded-lg text-xs"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 bg-[#f8fafc] border border-[#dde5ee] rounded-lg text-xs"
        >
          <option value="todos">Todas as Categorias</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-xl border border-[#dde5ee] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] text-[#5b6b7c] border-b border-[#dde5ee] uppercase tracking-wider font-bold">
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Descrição do Material</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Localização Física</th>
                <th className="py-3 px-4">Estoque Atual</th>
                <th className="py-3 px-4">Estoque Mínimo</th>
                <th className="py-3 px-4">Condição</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dde5ee]">
              {filtered.map(item => {
                const isBelowMin = item.currentStock < item.minimumStock;
                return (
                  <tr key={item.id} className="hover:bg-[#f9fbfe] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#1565c0]">
                      {item.code}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#16202b]">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 text-[#5b6b7c]">
                      <span className="bg-[#f2f5f9] px-2 py-0.5 rounded font-medium text-[11px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-[#16202b]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#1565c0]" />
                        {item.location}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#16202b]">
                      {item.currentStock} {item.unit}
                    </td>
                    <td className="py-3 px-4 text-[#5b6b7c]">
                      {item.minimumStock} {item.unit}
                    </td>
                    <td className="py-3 px-4">
                      {isBelowMin ? (
                        <span className="bg-[#fee2e2] text-[#dc2626] font-bold text-[10px] px-2 py-0.5 rounded uppercase flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" /> Abaixo do Mínimo
                        </span>
                      ) : (
                        <span className="bg-[#e7f6ee] text-[#1b7f4f] font-bold text-[10px] px-2 py-0.5 rounded uppercase flex items-center gap-1 w-fit">
                          <ShieldCheck className="w-3 h-3" /> Conforme
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onTriggerOccurrence(item)}
                        className="px-2.5 py-1 bg-[#fdeaea] hover:bg-[#fbd3d3] text-[#c62828] font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                        title="Notificar desvio sobre este item"
                      >
                        + Ocorrência
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
