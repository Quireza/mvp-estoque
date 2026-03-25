'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { syncProductToShopifyAction } from '@/app/actions';
import { toast } from 'sonner';

export default function ProductsTable({ initialProducts }: { initialProducts: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>({ key: 'name', direction: 'asc' });

  // 1. Filter
  const filteredProducts = initialProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. Sort
  let sortedProducts = [...filteredProducts];
  if (sortConfig !== null) {
    sortedProducts.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

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

  const handleSyncShopify = async (productId: string) => {
    setSyncingId(productId);
    const toastId = toast.loading('Sincronizando com a Shopify...');
    const res = await syncProductToShopifyAction(productId);
    setSyncingId(null);
    
    if (res.success) {
      if (res.warning) {
        toast.warning(res.warning, { id: toastId, duration: 6000 });
      } else {
        toast.success('Produto e estoque sincronizados na Shopify!', { id: toastId });
      }
    } else {
      toast.error(`Erro: ${res.error}`, { id: toastId });
    }
  };

  return (
    <>
      {/* Header with Search and Action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Produtos</h1>
          <p className="text-stone-500 mt-1">Gerencie o catálogo e verifique os níveis de estoque.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input 
              type="text" 
              placeholder="Buscar por SKU ou Nome..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-shadow bg-white"
            />
            <svg className="w-5 h-5 text-stone-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <Link href="/products/new" className="px-4 py-2 bg-amber-500 text-white rounded-xl font-medium shadow-[0_4px_14px_0_theme(colors.amber.400/39%)] hover:bg-amber-600 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 flex-shrink-0">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
             Novo
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 text-stone-500 text-sm border-b border-stone-100 select-none">
                <th className="p-4 font-medium pl-6 cursor-pointer hover:bg-stone-100 hover:text-amber-600 transition-colors" onClick={() => requestSort('sku')}>
                  <div className="flex items-center gap-2">SKU <span className="text-xs text-stone-400 font-mono">{getSortIndicator('sku')}</span></div>
                </th>
                <th className="p-4 font-medium cursor-pointer hover:bg-stone-100 hover:text-amber-600 transition-colors" onClick={() => requestSort('name')}>
                  <div className="flex items-center gap-2">Nome do Produto <span className="text-xs text-stone-400 font-mono">{getSortIndicator('name')}</span></div>
                </th>
                <th className="p-4 font-medium cursor-pointer hover:bg-stone-100 hover:text-amber-600 transition-colors" onClick={() => requestSort('salePrice')}>
                  <div className="flex items-center gap-2">Preço Venda <span className="text-xs text-stone-400 font-mono">{getSortIndicator('salePrice')}</span></div>
                </th>
                <th className="p-4 font-medium cursor-pointer hover:bg-stone-100 hover:text-amber-600 transition-colors" onClick={() => requestSort('totalQuantity')}>
                  <div className="flex items-center gap-2">Estoque Atual <span className="text-xs text-stone-400 font-mono">{getSortIndicator('totalQuantity')}</span></div>
                </th>
                <th className="p-4 font-medium cursor-pointer hover:bg-stone-100 hover:text-amber-600 transition-colors" onClick={() => requestSort('minStock')}>
                  <div className="flex items-center gap-2">Mínimo <span className="text-xs text-stone-400 font-mono">{getSortIndicator('minStock')}</span></div>
                </th>
                <th className="p-4 font-medium cursor-pointer hover:bg-stone-100 hover:text-amber-600 transition-colors" onClick={() => requestSort('isLowStock')}>
                  <div className="flex items-center gap-2">Status <span className="text-xs text-stone-400 font-mono">{getSortIndicator('isLowStock')}</span></div>
                </th>
                <th className="p-4 font-medium text-right pr-6">Ações</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {sortedProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-500">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
              {sortedProducts.map((product) => (
                <tr key={product.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                  <td className="p-4 pl-6"><span className="px-2 py-1 bg-stone-100 text-stone-600 rounded text-xs font-mono">{product.sku}</span></td>
                  <td className="p-4 font-medium text-stone-900">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-stone-100 flex items-center justify-center text-stone-600 uppercase">
                        {product.name.charAt(0)}
                      </div>
                      {product.name}
                    </div>
                  </td>
                  <td className="p-4 text-stone-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.salePrice)}
                  </td>
                  <td className="p-4 font-bold text-stone-800">{product.totalQuantity} un</td>
                  <td className="p-4 text-stone-500">{product.minStock} un</td>
                  <td className="p-4">
                    {product.isLowStock ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Estoque Baixo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Adequado
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                         onClick={() => handleSyncShopify(product.id)}
                         disabled={syncingId !== null}
                         className="inline-flex items-center justify-center px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 disabled:opacity-50 border border-emerald-200 text-sm font-medium rounded-lg transition-colors"
                         title="Enviar produto para a loja virtual Shopify"
                       >
                         {syncingId === product.id ? 'Enviando...' : 'Sync Shopify'}
                       </button>
                       <Link href={`/products/${product.id}/edit`} className="inline-flex items-center justify-center px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium rounded-lg transition-colors">
                         Editar
                       </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
