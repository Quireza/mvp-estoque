'use server'

import { prisma } from '@/lib/prisma';
import { InventoryService } from '@/services/inventory.service';
import { revalidatePath } from 'next/cache';

// Fetch all products
export async function getProducts() {
  return await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

// Fetch all products with their total available quantity based on batches
export async function getProductsWithStock() {
  const products = await prisma.product.findMany({
    include: {
      batches: {
        where: { quantity: { gt: 0 } }
      }
    },
    orderBy: { name: 'asc' }
  });

  return products.map(product => {
    const totalQuantity = product.batches.reduce((sum, batch) => sum + batch.quantity, 0);
    return {
      ...product,
      totalQuantity,
      isLowStock: totalQuantity < product.minStock
    };
  });
}

// Fetch critical batches (expiring soon)
export async function getCriticalBatches(daysLimit = 30) {
  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() + daysLimit);

  return await prisma.batch.findMany({
    where: {
      quantity: { gt: 0 },
      expirationDate: { lte: limitDate }
    },
    include: {
      product: true
    },
    orderBy: { expirationDate: 'asc' }
  });
}

// Server Action to trigger Stock Exit
export async function registerStockExitAction(formData: FormData) {
  const productId = formData.get('productId') as string;
  const quantity = parseInt(formData.get('quantity') as string, 10);
  const notes = formData.get('notes') as string;

  if (!productId || isNaN(quantity) || quantity <= 0) {
    return { success: false, error: "Dados inválidos." };
  }

  try {
    await InventoryService.registerStockExit(productId, quantity, notes);
    
    // Revalidate the frontend pages to show fresh data
    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/movements');
    
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Erro desconhecido" };
  }
}

// Fetch movements history
export async function getMovements() {
  return await prisma.stockMovement.findMany({
    include: {
      product: true,
      items: {
        include: {
          batch: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
}

// Fetch all batches with balance
export async function getBatches() {
  return await prisma.batch.findMany({
    where: { quantity: { gt: 0 } },
    include: { product: true },
    orderBy: { expirationDate: 'asc' }
  });
}

// Add new product
export async function createProductAction(formData: FormData) {
  const name = formData.get('name') as string;
  let sku = formData.get('sku') as string;
  const costPrice = parseFloat(formData.get('costPrice') as string);
  const salePrice = parseFloat(formData.get('salePrice') as string);
  const minStock = parseInt(formData.get('minStock') as string, 10);

  if (!sku || sku.trim() === '') {
    sku = 'SKU-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  if (!name || isNaN(costPrice) || isNaN(salePrice) || isNaN(minStock)) {
    return { success: false, error: "Preencha todos os campos obrigatórios corretamente." };
  }

  try {
    await prisma.product.create({
      data: { name, sku, costPrice, salePrice, minStock }
    });
    revalidatePath('/products');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: "Erro ao criar produto. Verifique se o SKU já existe." };
  }
}

// Fetch single product
export async function getProduct(id: string) {
  return await prisma.product.findUnique({ where: { id } });
}

// Update product
export async function updateProductAction(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const sku = formData.get('sku') as string;
  const costPrice = parseFloat(formData.get('costPrice') as string);
  const salePrice = parseFloat(formData.get('salePrice') as string);
  const minStock = parseInt(formData.get('minStock') as string, 10);

  if (!name || isNaN(costPrice) || isNaN(salePrice) || isNaN(minStock)) {
    return { success: false, error: "Preencha todos os campos obrigatórios corretamente." };
  }

  try {
    await prisma.product.update({
      where: { id },
      data: { name, sku, costPrice, salePrice, minStock }
    });
    revalidatePath('/products');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: "Erro ao atualizar produto." };
  }
}

// Register new stock entry
export async function registerStockEntryAction(formData: FormData) {
  const productId = formData.get('productId') as string;
  const batchNumber = formData.get('batchNumber') as string;
  const quantity = parseInt(formData.get('quantity') as string, 10);
  const expirationDateStr = formData.get('expirationDate') as string;
  const notes = formData.get('notes') as string;

  if (!productId || !batchNumber || isNaN(quantity) || quantity <= 0 || !expirationDateStr) {
    return { success: false, error: "Preencha todos os campos obrigatórios corretamente." };
  }

  // To fix timezone issues roughly for expiration dates, add timezone offset or use string.
  const expirationDate = new Date(expirationDateStr + "T12:00:00Z");

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Create or Find Batch
      let batch = await tx.batch.findUnique({
        where: {
          productId_batchNumber: { productId, batchNumber }
        }
      });

      if (batch) {
        batch = await tx.batch.update({
          where: { id: batch.id },
          data: { quantity: batch.quantity + quantity }
        });
      } else {
        batch = await tx.batch.create({
          data: { productId, batchNumber, quantity, expirationDate }
        });
      }

      // 2. Register stock movement (IN)
      const movement = await tx.stockMovement.create({
        data: { productId, type: "IN", quantity, notes }
      });

      // 3. Register traceability item
      await tx.stockMovementItem.create({
        data: { stockMovementId: movement.id, batchId: batch.id, quantity }
      });
    });

    revalidatePath('/');
    revalidatePath('/batches');
    revalidatePath('/products');
    revalidatePath('/movements');

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Erro ao registrar entrada." };
  }
}
