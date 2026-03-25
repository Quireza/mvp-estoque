import { getProducts } from '@/app/actions';
import NewBatchForm from './NewBatchForm';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function NewBatchPage() {
  const products = await getProducts();

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="flex justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Entrada de Lote</h1>
          <p className="text-stone-500 mt-1">Registre o recebimento de novos produtos e suas validades.</p>
        </div>
        <Link href="/batches" className="text-stone-500 hover:text-stone-700 font-medium">Voltar</Link>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
        <NewBatchForm products={products} />
      </div>
    </div>
  );
}
