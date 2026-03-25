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

  // Financial States
  const [costPrice, setCostPrice] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number>(0);
  const [icms, setIcms] = useState<number>(0);
  const [icmsComplement, setIcmsComplement] = useState<number>(0);
  const [extraCosts, setExtraCosts] = useState<number>(0);

  const effectiveCost = costPrice + (costPrice * (icms / 100)) + (costPrice * (icmsComplement / 100)) + extraCosts;
  const profitMargin = salePrice > 0 ? ((salePrice - effectiveCost) / salePrice) * 100 : 0;
  const profitValue = salePrice - effectiveCost;

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
                value={costPrice || ''}
                onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
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
                value={salePrice || ''}
                onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                required
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-100 p-4 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-stone-800">Tributação e Custos Operacionais</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">ICMS Padrão (%)</label>
                <input 
                  name="icms" 
                  type="number" 
                  step="0.01"
                  min="0"
                  value={icms || ''}
                  onChange={(e) => setIcms(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">ICMS Complementar (%)</label>
                <input 
                  name="icmsComplement" 
                  type="number" 
                  step="0.01"
                  min="0"
                  value={icmsComplement || ''}
                  onChange={(e) => setIcmsComplement(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">Frete / Custo Extra (R$)</label>
                <input 
                  name="extraCosts" 
                  type="number" 
                  step="0.01"
                  min="0"
                  value={extraCosts || ''}
                  onChange={(e) => setExtraCosts(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>
            </div>

            <div className={`p-4 rounded-lg flex items-center justify-between border ${profitMargin < 0 ? 'bg-red-50 border-red-200' : profitMargin < 15 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
               <div>
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Custo Efetivo Final</p>
                  <p className="text-xl font-bold text-stone-900">
                    R$ {effectiveCost.toFixed(2)}
                  </p>
               </div>
               <div className="text-right">
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Lucro e Margem Reais</p>
                  <p className={`text-xl font-bold ${profitMargin < 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                    R$ {profitValue.toFixed(2)} ({profitMargin.toFixed(1)}%)
                  </p>
               </div>
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
