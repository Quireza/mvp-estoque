import { getProductsWithStock } from '@/app/actions';
import Link from 'next/link';
import ProductsTable from './ProductsTable';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const products = await getProductsWithStock();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <ProductsTable initialProducts={products} />
    </div>
  );
}
