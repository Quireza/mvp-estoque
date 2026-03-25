import { getProducts } from '@/app/actions';
import NewExitForm from './NewExitForm';

export const dynamic = 'force-dynamic';

export default async function NewExitPage() {
  const products = await getProducts();

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="flex justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Nova Saída (PEPS/FEFO)</h1>
          <p className="text-stone-500 mt-1">O sistema automaticamente descontará do lote com validade mais próxima.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
        <NewExitForm products={products} />
      </div>
    </div>
  );
}
