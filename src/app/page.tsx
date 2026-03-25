import { getProductsWithStock, getCriticalBatches } from '@/app/actions';
import Link from 'next/link';
import { ExportAllButton, ExportPurchaseButton } from './DashboardActions';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const products = await getProductsWithStock();
  const criticalBatches = await getCriticalBatches(30);

  // Calcular KPIs reais
  const totalStock = products.reduce((sum, p) => sum + p.totalQuantity, 0);
  const lowStockCount = products.filter(p => p.isLowStock).length;
  const criticalCount = criticalBatches.length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Visão Geral</h1>
          <p className="text-stone-500 mt-1">Bem-vindo de volta! Aqui está o resumo do seu estoque hoje.</p>
        </div>
        <div className="flex gap-3">
          <ExportAllButton allProducts={products} />
          <Link href="/movements/new" className="px-4 py-2 bg-amber-500 text-white rounded-xl font-medium shadow-[0_4px_14px_0_theme(colors.amber.400/39%)] hover:bg-amber-600 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
            Nova Saída
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-stone-500 font-medium">Estoque Total</h3>
            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-stone-900">{totalStock} <span className="text-sm font-normal text-stone-400">un</span></p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-stone-500 font-medium">Lotes a Vencer (30d)</h3>
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-stone-900">{criticalCount}</p>
          <p className="text-sm text-red-500 font-medium mt-2">Atenção imediata requerida</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-stone-500 font-medium">Estoque Baixo</h3>
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-stone-900">{lowStockCount} <span className="text-sm font-normal text-stone-400">SKUs</span></p>
          <p className="text-sm text-orange-500 font-medium mt-2">Abaixo do ponto de pedido</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow bg-gradient-to-br from-white to-amber-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-stone-500 font-medium">Última Sincronização</h3>
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-stone-900 mt-2">Shopify MVP</p>
          <p className="text-sm text-stone-500 font-medium mt-1">Tempo real local</p>
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lotes a Vencer */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="p-6 border-b border-stone-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-stone-900">Lotes Críticos (Validade)</h2>
            <Link href="/batches" className="text-amber-500 text-sm font-medium hover:text-amber-600">Ver Todos</Link>
          </div>
          <div className="w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 text-stone-500 text-sm border-b border-stone-100">
                  <th className="p-4 font-medium">Produto</th>
                  <th className="p-4 font-medium">Lote</th>
                  <th className="p-4 font-medium">Qtd</th>
                  <th className="p-4 font-medium">Validade</th>
                  <th className="p-4 font-medium text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {criticalBatches.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-stone-500">
                      Nenhum lote crítico no momento.
                    </td>
                  </tr>
                )}
                {criticalBatches.map(batch => {
                  const daysLeft = Math.ceil((new Date(batch.expirationDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                  return (
                    <tr key={batch.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                      <td className="p-4 font-medium text-stone-900">{batch.product.name}</td>
                      <td className="p-4"><span className="px-2 py-1 bg-stone-100 text-stone-600 rounded text-xs font-mono">{batch.batchNumber}</span></td>
                      <td className="p-4">{batch.quantity}</td>
                      <td className="p-4">
                        <span className={daysLeft <= 15 ? "text-red-500 font-medium" : "text-orange-500 font-medium"}>
                          {daysLeft} Dias
                        </span> 
                        <span className="text-xs text-stone-400 block">{new Date(batch.expirationDate).toLocaleDateString('pt-BR')}</span>
                      </td>
                      <td className="p-4 text-right">
                        <Link href="/movements/new" className="text-stone-400 hover:text-amber-500 transition-colors">Dar Baixa</Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Painel Lateral Direto com Alertas de Estoque */}
        <div className="flex flex-col gap-8">
          
          {/* Risco de Ruptura (Overselling) */}
          <div className="bg-white rounded-2xl shadow-sm border border-red-200 flex flex-col">
            <div className="p-6 border-b border-red-100 bg-red-50/50 rounded-t-2xl flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-red-800">Risco Overselling</h2>
                <p className="text-xs text-red-600 mt-1">Esgotado ou c/ 1 unidade</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 animate-pulse">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col gap-4">
              {products.filter(p => p.totalQuantity <= 1).length === 0 && (
                <div className="text-center text-stone-500 text-sm mt-4">
                  Nenhum produto em risco imediato.
                </div>
              )}
              {products.filter(p => p.totalQuantity <= 1).map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border border-red-200 bg-red-50">
                  <div>
                    <h4 className="font-bold text-red-900 text-sm">{p.name}</h4>
                    <p className="text-xs text-red-700 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">Venda bloqueada</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-700 font-extrabold text-lg">{p.totalQuantity} <span className="text-xs font-normal">un</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Produtos com Estoque Baixo */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 flex flex-col">
            <div className="p-6 border-b border-stone-100">
              <h2 className="text-lg font-bold text-stone-900">Ponto de Pedido</h2>
              <p className="text-xs text-stone-500 mt-1">Produtos abaixo do limite mínimo</p>
            </div>
            <div className="p-6 flex-1 flex flex-col gap-4">
              
              {products.filter(p => p.isLowStock && p.totalQuantity > 1).length === 0 && (
                <div className="text-center text-stone-500 text-sm mt-4">
                  Nenhum produto precisando de compra.
                </div>
              )}
              
              {products.filter(p => p.isLowStock && p.totalQuantity > 1).map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border border-orange-100 bg-orange-50/30">
                  <div>
                    <h4 className="font-medium text-stone-900 text-sm">{p.name}</h4>
                    <p className="text-xs text-stone-500">Min: {p.minStock} un</p>
                  </div>
                  <div className="text-right">
                    <p className="text-orange-600 font-bold">{p.totalQuantity} un</p>
                  </div>
                </div>
              ))}

              <ExportPurchaseButton lowStockProducts={products.filter(p => p.isLowStock)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
