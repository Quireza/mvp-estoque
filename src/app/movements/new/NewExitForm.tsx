'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { registerStockExitAction } from '@/app/actions';
import { toast } from 'sonner';

export default function NewExitForm({ products }: { products: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorLine, setErrorLine] = useState('');

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      setErrorLine('');
      const res = await registerStockExitAction(formData);
      
      if (res && res.success === false) {
        setErrorLine(res.error || 'Erro ao registrar saída');
        toast.error('Ocorreu um erro ao processar a baixa no estoque.');
      } else {
        toast.success('Baixa registrada com sucesso pelo FEFO!');
        router.push('/');
      }
    });
  }

  return (
    <>
      {errorLine && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
          Exceção de Negócio: {errorLine}
        </div>
      )}
      
      <form action={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Qual Produto deseja faturar/dar saída?</label>
          <select 
            name="productId" 
            required
            className="w-full px-4 py-3 border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">-- Selecione o Produto --</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>
            ))}
          </select>
        </div>

        <div>
           <label className="block text-sm font-medium text-stone-700 mb-1">Quantidade</label>
           <input 
              name="quantity" 
              type="number" 
              min="1"
              required
              defaultValue="1"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
        </div>

        <div>
           <label className="block text-sm font-medium text-stone-700 mb-1">Observações (Opcional)</label>
           <textarea 
              name="notes"
              rows={3} 
              placeholder="Ex: Venda Shopify #1002"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          className="w-full py-4 mt-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold shadow-[0_4px_14px_0_theme(colors.amber.500/39%)] hover:from-amber-600 hover:to-orange-600 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 text-lg"
        >
          {isPending ? 'Processando Lotes (FEFO)...' : 'Confirmar Baixa de Estoque'}
        </button>
      </form>
    </>
  );
}
