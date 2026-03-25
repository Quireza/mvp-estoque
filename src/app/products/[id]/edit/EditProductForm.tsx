'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateProductAction } from '@/app/actions';
import { toast } from 'sonner';

export default function EditProductForm({ product }: { product: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorLine, setErrorLine] = useState('');

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      setErrorLine('');
      const res = await updateProductAction(product.id, formData);
      
      if (res && res.success === false) {
        setErrorLine(res.error || 'Erro ao atualizar produto');
        toast.error('Ocorreu um erro ao atualizar o produto.');
      } else {
        toast.success(`Produto "${product.name}" atualizado com sucesso!`);
        router.push('/products');
      }
    });
  }

  return (
    <>
      {errorLine && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
          Erro: {errorLine}
        </div>
      )}
      
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Nome do Produto</label>
          <input 
            name="name" 
            type="text" 
            defaultValue={product.name}
            required
            className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">SKU (Código Único - Opcional)</label>
          <input 
            name="sku" 
            type="text" 
            defaultValue={product.sku}
            className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Custo (R$)</label>
            <input 
              name="costPrice" 
              type="number" 
              step="0.01"
              min="0"
              defaultValue={product.costPrice}
              required
              className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Venda (R$)</label>
            <input 
              name="salePrice" 
              type="number" 
              step="0.01"
              min="0"
              defaultValue={product.salePrice}
              required
              className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Estoque Mínimo (Alerta)</label>
          <input 
            name="minStock" 
            type="number" 
            min="0"
            defaultValue={product.minStock}
            required
            className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          className="w-full py-4 mt-4 bg-stone-900 text-white rounded-xl font-bold shadow-sm hover:bg-stone-800 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
        >
           {isPending ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
    </>
  );
}
