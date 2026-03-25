import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chai WMS | Mini-ERP",
  description: "Sistema avançado de gestão de estoque, lotes e validade",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} bg-stone-50 text-stone-900 flex h-screen overflow-hidden antialiased`} suppressHydrationWarning>
        <Toaster richColors position="top-right" />
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-stone-50 p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
