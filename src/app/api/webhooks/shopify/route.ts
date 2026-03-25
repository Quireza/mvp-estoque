import { NextRequest, NextResponse } from 'next/server';
import { ShopifyService } from '@/services/shopify.service';
import { InventoryService } from '@/services/inventory.service';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const hmacHeader = req.headers.get('x-shopify-hmac-sha256');
    const rawBody = await req.text();

    if (!hmacHeader) {
      return NextResponse.json({ error: 'Missing HMAC header' }, { status: 401 });
    }

    const isValid = ShopifyService.verifyWebhook(rawBody, hmacHeader);
    
    // NOTA MVP: Comentado para permitir testes sem HMAC válido se a chave não estiver configurada no .env
    // Em produção, você deve retornar erro 401 se a assinatura for inválida.
    if (!isValid && process.env.NODE_ENV === 'production') {
      console.warn('Assinatura do webhook inválida detectada.');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const topic = req.headers.get('x-shopify-topic');

    // 1. Tratamento para Criação de Produto (Inbound)
    if (topic === 'products/create' || topic === 'products/update') {
      const title = payload.title;
      const variants = payload.variants;
      
      if (variants && variants.length > 0) {
        const sku = variants[0].sku;
        const price = parseFloat(variants[0].price || "0");
        
        if (sku) {
           const existing = await prisma.product.findUnique({ where: { sku } });
           if (!existing) {
             await prisma.product.create({
               data: { 
                 name: title, 
                 sku, 
                 salePrice: price, 
                 costPrice: 0, 
                 minStock: 10 
               }
             });
             console.log(`[Shopify Webhook] Produto Inbound importado: ${sku}`);
           }
        }
      }
      return NextResponse.json({ message: 'Produto processado' }, { status: 200 });
    }

    // 2. Tratamento Padrão para Pedidos (Outbound/Baixa)
    if (payload.line_items && Array.isArray(payload.line_items)) {
      for (const item of payload.line_items) {
        const sku = item.sku;
        const quantity = item.quantity;
        
        if (sku && quantity > 0) {
          try {
            await InventoryService.registerStockExitBySku(
              sku, 
              quantity, 
              `Pedido Shopify #${payload.order_number || payload.id}`
            );
            console.log(`[Shopify Webhook] Baixa local efetuada: SKU ${sku}, Qtd ${quantity}`);
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`[Shopify Webhook] Erro ao baixar estoque do SKU ${sku}: ${msg}`);
            // Tratamos o erro individual para não falhar os outros itens do pedido
          }
        }
      }
    }

    return NextResponse.json({ message: 'Webhook processado' }, { status: 200 });

  } catch (error: unknown) {
    console.error('Erro geral no Webhook da Shopify:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Erro interno do servidor', details: msg }, { status: 500 });
  }
}
