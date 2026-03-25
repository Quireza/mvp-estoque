'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createProductAction } from '@/app/actions';
import Link from 'next/link';
import { toast } from 'sonner';

export default function NewProductPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorLine, setErrorLine] = useState('');

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      setErrorLine('');
      const res = await createProductAction(formData);
      
      if (res && res.success === false) {
        setErrorLine(res.error || 'Erro ao criar produto');
        toast.error('Erro ao criar produto.');
      } else {
        toast.success('Produto criado com sucesso!');
        router.push('/products');
      }
    });
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Novo Produto</h1>
          <p className="text-stone-500 mt-1">Cadastre um novo tipo de chá ou especiaria.</p>
        </div>
        <Link href="/products" className="text-stone-500 hover:text-stone-700 font-medium">Voltar</Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
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
              placeholder="Ex: Chá Preto Assam" 
              required
              className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">SKU (Código Único - Opcional)</label>
            <input 
              name="sku" 
              type="text" 
              placeholder="Ex: CHA-PRT-001" 
              className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-xs text-stone-400 mt-1">Deixe em branco para o sistema gerar automaticamente (Ex: SKU-X9AB2).</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Custo (R$)</label>
              <input 
                name="costPrice" 
                type="number" 
                step="0.01"
                min="0"
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
              required
              defaultValue="20"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full py-4 mt-4 bg-stone-900 text-white rounded-xl font-bold shadow-sm hover:bg-stone-800 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
          >
             {isPending ? 'Salvando...' : 'Cadastrar Produto'}
          </button>
        </form>
      </div>
    </div>
  );
}
