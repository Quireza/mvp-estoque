'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { registerStockEntryAction } from '@/app/actions';
import { toast } from 'sonner';

export default function NewBatchForm({ products }: { products: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorLine, setErrorLine] = useState('');

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      setErrorLine('');
      const res = await registerStockEntryAction(formData);
      
      if (res && res.success === false) {
        setErrorLine(res.error || 'Erro ao registrar entrada');
        toast.error('Erro ao registrar entrada de lote.');
      } else {
        toast.success('Entrada de Estoque registrada com sucesso!');
        router.push('/batches');
      }
    });
  }

  return (
    <>
      {errorLine && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
          Exceção: {errorLine}
        </div>
      )}
      
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Produto (SKU)</label>
          <select 
            name="productId" 
            required
            className="w-full px-4 py-3 border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">-- Selecione o Produto --</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Número do Lote</label>
            <input 
              name="batchNumber" 
              type="text" 
              required
              placeholder="Ex: LOTE-10A"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Data de Validade</label>
            <input 
              name="expirationDate" 
              type="date" 
              required
              className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
           <label className="block text-sm font-medium text-stone-700 mb-1">Quantidade Recebida</label>
           <input 
              name="quantity" 
              type="number" 
              min="1"
              required
              defaultValue="50"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
        </div>

        <div>
           <label className="block text-sm font-medium text-stone-700 mb-1">Observações da Compra</label>
           <textarea 
              name="notes"
              rows={2} 
              placeholder="Ex: Fornecedor XYZ, NFe 99201"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          className="w-full py-4 mt-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold shadow-[0_4px_14px_0_theme(colors.emerald.500/39%)] hover:from-emerald-600 hover:to-green-700 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 text-lg"
        >
          {isPending ? 'Registrando Estoque...' : 'Confirmar Entrada'}
        </button>
      </form>
    </>
  );
}
