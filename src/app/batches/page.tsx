import { getBatches } from '@/app/actions';
import Link from 'next/link';
import BatchesTable from './BatchesTable';

export const dynamic = 'force-dynamic';

export default async function BatchesPage() {
  const batches = await getBatches();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="flex justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Lotes e Validades</h1>
          <p className="text-stone-500 mt-1">Exibindo todos os lotes ativos. Clique nas colunas para buscar ou reordenar.</p>
        </div>
        <Link href="/batches/new" className="px-4 py-2 bg-amber-500 text-white rounded-xl font-medium shadow-[0_4px_14px_0_theme(colors.amber.400/39%)] hover:bg-amber-600 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
            Nova Entrada de Lote
        </Link>
      </div>

      <BatchesTable initialBatches={batches} />
    </div>
  );
}
