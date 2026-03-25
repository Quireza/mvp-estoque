import { getProduct } from '@/app/actions';
import EditProductForm from './EditProductForm';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Editar Produto</h1>
          <p className="text-stone-500 mt-1">Atualize preços e regras de estoque.</p>
        </div>
        <Link href="/products" className="text-stone-500 hover:text-stone-700 font-medium">Voltar</Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
        <EditProductForm product={product} />
      </div>
    </div>
  );
}
