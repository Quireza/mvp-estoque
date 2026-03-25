'use client';

import { useState } from 'react';

export default function BatchesTable({ initialBatches }: { initialBatches: any[] }) {
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>({ key: 'expirationDate', direction: 'asc' });

  // Sorting logic
  let sortedBatches = [...initialBatches];
  if (sortConfig !== null) {
    sortedBatches.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle nested or derived values
      if (sortConfig.key === 'productName') {
        aValue = a.product.name;
        bValue = b.product.name;
      }
      if (sortConfig.key === 'expirationDate') {
        aValue = new Date(a.expirationDate).getTime();
        bValue = new Date(b.expirationDate).getTime();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 text-stone-500 text-sm border-b border-stone-100 select-none">
                <th 
                  className="p-4 font-medium pl-6 cursor-pointer hover:bg-stone-100 hover:text-amber-600 transition-colors" 
                  onClick={() => requestSort('batchNumber')}
                >
                  <div className="flex items-center gap-2">Lote (Código) <span className="text-xs text-stone-400 font-mono">{getSortIndicator('batchNumber')}</span></div>
                </th>
                <th 
                  className="p-4 font-medium cursor-pointer hover:bg-stone-100 hover:text-amber-600 transition-colors" 
                  onClick={() => requestSort('productName')}
                >
                  <div className="flex items-center gap-2">Produto <span className="text-xs text-stone-400 font-mono">{getSortIndicator('productName')}</span></div>
                </th>
                <th 
                  className="p-4 font-medium cursor-pointer hover:bg-stone-100 hover:text-amber-600 transition-colors" 
                  onClick={() => requestSort('quantity')}
                >
                  <div className="flex items-center gap-2">Qtd Atual <span className="text-xs text-stone-400 font-mono">{getSortIndicator('quantity')}</span></div>
                </th>
                <th 
                  className="p-4 font-medium cursor-pointer hover:bg-stone-100 hover:text-amber-600 transition-colors" 
                  onClick={() => requestSort('expirationDate')}
                >
                  <div className="flex items-center gap-2">Validade <span className="text-xs text-stone-400 font-mono">{getSortIndicator('expirationDate')}</span></div>
                </th>
                <th className="p-4 font-medium text-stone-400">Status / Prazo</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {sortedBatches.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-stone-500">
                    Nenhum lote com saldo encontrado.
                  </td>
                </tr>
              )}
              {sortedBatches.map((batch) => {
                const daysLeft = Math.ceil((new Date(batch.expirationDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                
                let statusBadge;
                if (daysLeft <= 15) {
                  statusBadge = <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">Crítico</span>;
                } else if (daysLeft <= 30) {
                  statusBadge = <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">Atenção</span>;
                } else {
                  statusBadge = <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Seguro</span>;
                }

                return (
                  <tr key={batch.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                    <td className="p-4 pl-6"><span className="px-2 py-1 bg-stone-100 text-stone-600 rounded text-xs font-mono">{batch.batchNumber}</span></td>
                    <td className="p-4 font-medium text-stone-900">{batch.product.name}</td>
                    <td className="p-4 font-bold text-stone-800">{batch.quantity} un</td>
                    <td className="p-4 text-stone-600">{new Date(batch.expirationDate).toLocaleDateString('pt-BR')}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {statusBadge}
                        <span className="text-stone-500 text-xs">{daysLeft} dias rest.</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
  );
}
