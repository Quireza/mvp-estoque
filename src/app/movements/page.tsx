import { getMovements } from '@/app/actions';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function MovementsPage() {
  const movements = await getMovements();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
      {/* Header */}
      <div className="flex justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Movimentações</h1>
          <p className="text-stone-500 mt-1">Histórico completo de entradas e saídas e rastreabilidade dos lotes.</p>
        </div>
        <Link href="/movements/new" className="px-4 py-2 bg-amber-500 text-white rounded-xl font-medium shadow-[0_4px_14px_0_theme(colors.amber.400/39%)] hover:bg-amber-600 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
            Nova Saída
        </Link>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 text-stone-500 text-sm border-b border-stone-100">
                <th className="p-4 font-medium pl-6">Data</th>
                <th className="p-4 font-medium">Produto</th>
                <th className="p-4 font-medium">Tipo</th>
                <th className="p-4 font-medium">Quantidade</th>
                <th className="p-4 font-medium">Rastreabilidade (Lotes)</th>
                <th className="p-4 font-medium">Observações</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {movements.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-500">
                    Nenhuma movimentação registrada.
                  </td>
                </tr>
              )}
              {movements.map((movement) => (
                <tr key={movement.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                  <td className="p-4 pl-6 text-stone-500 whitespace-nowrap">
                    {new Date(movement.createdAt).toLocaleString('pt-BR')}
                  </td>
                  <td className="p-4 font-medium text-stone-900">
                    {movement.product.name}
                  </td>
                  <td className="p-4">
                    {movement.type === 'IN' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Entrada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        Saída
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-bold text-stone-800">
                    {movement.type === 'IN' ? '+' : '-'}{movement.quantity} un
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      {movement.items.map((item) => (
                        <div key={item.id} className="text-xs text-stone-600 bg-stone-100 px-2 py-1 rounded border border-stone-200 inline-block w-fit">
                          <span className="font-mono font-medium">{item.batch.batchNumber}</span> 
                          <span className="text-stone-400 mx-1">→</span> 
                          {item.quantity} un
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-stone-500 max-w-xs truncate" title={movement.notes || '-'}>
                    {movement.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
