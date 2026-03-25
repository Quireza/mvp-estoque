import { prisma } from '@/lib/prisma';
import { ShopifyService } from './shopify.service';

export class InventoryService {
  /**
   * Realiza a SAÍDA de estoque aplicando a lógica PEPS/FEFO filtrando por SKU
   */
  static async registerStockExitBySku(sku: string, quantityToDeduct: number, notes?: string) {
    const product = await prisma.product.findUnique({ where: { sku } });
    if (!product) {
      throw new Error(`Produto com SKU ${sku} não encontrado.`);
    }
    return this.registerStockExit(product.id, quantityToDeduct, notes);
  }

  /**
   * Realiza a SAÍDA de estoque aplicando a lógica PEPS/FEFO.
   */
  static async registerStockExit(productId: string, quantityToDeduct: number, notes?: string) {
    if (quantityToDeduct <= 0) {
      throw new Error('A quantidade de saída deve ser maior que zero.');
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Busca os lotes COM SALDO do produto, ordenados pela validade
      const availableBatches = await tx.batch.findMany({
        where: {
          productId: productId,
          quantity: { gt: 0 }
        },
        orderBy: {
          expirationDate: 'asc'
        }
      });

      // 2. Verifica se há estoque suficiente somando todos os lotes
      const totalAvailable = availableBatches.reduce((sum, batch) => sum + batch.quantity, 0);

      if (totalAvailable < quantityToDeduct) {
        throw new Error(
          `Estoque insuficiente para o produto. Solicitado: ${quantityToDeduct}, Disponível: ${totalAvailable}`
        );
      }

      // 3. Cria a movimentação
      const movement = await tx.stockMovement.create({
        data: {
          productId,
          type: "OUT",
          quantity: quantityToDeduct,
          notes
        }
      });

      let remainingToDeduct = quantityToDeduct;
      const movementItemsData = [];

      // 4. Itera pelos lotes dando baixa até satisfazer a quantidade
      for (const batch of availableBatches) {
        if (remainingToDeduct === 0) break;

        if (batch.quantity >= remainingToDeduct) {
          movementItemsData.push({
            stockMovementId: movement.id,
            batchId: batch.id,
            quantity: remainingToDeduct
          });

          await tx.batch.update({
            where: { id: batch.id },
            data: { quantity: batch.quantity - remainingToDeduct }
          });

          remainingToDeduct = 0;
        } else {
          movementItemsData.push({
            stockMovementId: movement.id,
            batchId: batch.id,
            quantity: batch.quantity
          });

          remainingToDeduct -= batch.quantity;

          await tx.batch.update({
            where: { id: batch.id },
            data: { quantity: 0 }
          });
        }
      }

      // 5. Salva os detalhes do de qual lote saiu
      await tx.stockMovementItem.createMany({
        data: movementItemsData
      });

      return movement;
    });

    // 6. Sincroniza com a Shopify se NÃO foi uma venda da própria Shopify
    if (!notes?.includes("Pedido Shopify")) {
      // Busca o SKU para mandar para a Shopify (já que registerStockExit recebeu ID)
      const thisProduct = await prisma.product.findUnique({
        where: { id: productId },
        select: { sku: true }
      });
      if (thisProduct?.sku) {
        // Envia valor negativo pois é uma baixa
        ShopifyService.adjustInventory(thisProduct.sku, -quantityToDeduct).catch(err => {
          console.error(`Falha ao sincronizar baixa com Shopify do SKU ${thisProduct.sku}:`, err);
        });
      }
    }

    return result;
  }
}
