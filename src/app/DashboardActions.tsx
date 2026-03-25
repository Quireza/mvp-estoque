'use client';
import { toast } from 'sonner';

export function ExportAllButton({ allProducts }: { allProducts: any[] }) {
  const handleExportAll = () => {
    const rows = [
      ["SKU", "Nome", "Custo", "Preço Venda", "Estoque Atual", "Minimo", "Status"].join(","),
      ...allProducts.map(p => [
        p.sku, 
        p.name, 
        p.costPrice, 
        p.salePrice, 
        p.totalQuantity, 
        p.minStock, 
        p.isLowStock ? 'Baixo' : 'Adequado'
      ].join(","))
    ];
    
    const csvContent = "\uFEFF" + rows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
      
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `estoque_geral_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Relatório Geral exportado com sucesso!');
  };

  return (
    <button onClick={handleExportAll} className="px-4 py-2 bg-white text-stone-700 rounded-xl font-medium border border-stone-200 shadow-sm hover:bg-stone-50 transition-all flex items-center gap-2">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
      Exportar
    </button>
  );
}

export function ExportPurchaseButton({ lowStockProducts }: { lowStockProducts: any[] }) {
  const handleExportPurchase = () => {
    if (lowStockProducts.length === 0) {
      toast.info('Perfeito! Nenhum produto em estoque crítico para comprar no momento.');
      return;
    }

    const rows = [
      ["SKU", "Nome", "Estoque Atual", "Estoque Mínimo", "Quantidade a Comprar (Recomendado)"].join(","),
      ...lowStockProducts.map(p => [
        p.sku, 
        p.name, 
        p.totalQuantity, 
        p.minStock, 
        (p.minStock - p.totalQuantity) + 20 
      ].join(","))
    ];
    
    const csvContent = "\uFEFF" + rows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
      
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_compras_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Relatório de Compras gerado e baixado para o Excel!');
  };

  return (
    <button onClick={handleExportPurchase} className="mt-auto w-full py-3 border border-stone-200 rounded-xl text-stone-600 font-medium text-sm hover:bg-stone-50 transition-colors flex items-center justify-center gap-2">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
      Gerar Relatório de Compra
    </button>
  );
}
