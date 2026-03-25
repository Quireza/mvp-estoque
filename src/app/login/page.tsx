'use client';

import { useState, useTransition } from 'react';
import { loginAction } from '@/app/actions';
import { toast } from 'sonner';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await loginAction(username, password);
      if (res.success) {
        toast.success('Entrando...');
        // O redirecionamento é feito mandatoriamente recarregando para o middleware recalcular
        window.location.href = '/';
      } else {
        toast.error('Usuário ou senha incorretos.');
      }
    });
  };

  return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-stone-100 mt-[-10vh]">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 text-2xl font-bold tracking-tighter text-stone-900 mb-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#F59E0B" fillOpacity="0.2" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2.5 10H21.5" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 21.5V10" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Chai MVP
          </div>
          <h1 className="text-xl font-medium text-stone-800">Acesso Restrito</h1>
          <p className="text-stone-500 mt-1 text-sm">Insira suas credenciais para gerenciar estoques.</p>
        </div>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Usuário</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Senha</label>
            <input 
               type="password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
               required
            />
          </div>
          <button 
            type="submit" 
            disabled={isPending}
            className="w-full mt-4 py-3 bg-stone-900 text-white font-medium rounded-xl hover:bg-stone-800 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Validando...' : 'Entrar no Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}
