'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <>
      {!isLoginPage && <Sidebar />}
      <main className={isLoginPage ? 'flex-1 bg-stone-50 h-full' : 'flex-1 overflow-y-auto bg-stone-50 p-8'}>
        <div className={isLoginPage ? 'h-full w-full' : 'mx-auto max-w-7xl'}>
          {children}
        </div>
      </main>
    </>
  );
}
