import crypto from 'crypto';

export class ShopifyService {
  /**
   * Verifica se o Webhook realmente veio da Shopify e não sofreu alterações
   */
  static verifyWebhook(rawBody: string, hmacHeader: string): boolean {
    const secret = process.env.SHOPIFY_WEBHOOK_SECRET || '';
    if (!secret) return false;

    const hash = crypto
      .createHmac('sha256', secret)
      .update(rawBody, 'utf8')
      .digest('base64');
    
    return hash === hmacHeader;
  }

  /**
   * Sincroniza o estoque local com a Shopify (Outbound)
   * Deve ser acionado ao fazer uma venda na loja física.
   */
  static async adjustInventory(sku: string, adjustQuantity: number) {
    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const token = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
    const locationId = process.env.SHOPIFY_LOCATION_ID;

    if (!domain || !token || !locationId) {
      console.warn("Credenciais do Shopify não configuradas. Ignorando sincronização.");
      return false;
    }

    try {
      // 1. Buscar o produto pelo SKU na Shopify para pegar o inventory_item_id
      const query = `
        {
          products(first: 1, query: "sku:${sku}") {
            edges {
              node {
                variants(first: 1) {
                  edges {
                    node {
                      inventoryItem {
                        id
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const res = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': token,
        },
        body: JSON.stringify({ query })
      });

      const data = await res.json();
      const inventoryItemIdGid = data?.data?.products?.edges?.[0]?.node?.variants?.edges?.[0]?.node?.inventoryItem?.id;

      if (!inventoryItemIdGid) {
        console.warn(`SKU ${sku} não encontrado na Shopify.`);
        return false;
      }

      // 2. Ajustar o inventário usando a Mutation
      const mutation = `
        mutation inventoryAdjustQuantity($input: InventoryAdjustQuantityInput!) {
          inventoryAdjustQuantity(input: $input) {
            inventoryLevel {
              available
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      // adjustQuantity deve ser negativo para redução (Delta)
      const variables = {
        input: {
          inventoryItemId: inventoryItemIdGid,
          locationId: `gid://shopify/Location/${locationId}`,
          availableDelta: adjustQuantity
        }
      };

      const adjustRes = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': token,
        },
        body: JSON.stringify({ query: mutation, variables })
      });

      const adjustData = await adjustRes.json();
      
      if (adjustData?.data?.inventoryAdjustQuantity?.userErrors?.length > 0) {
        console.error("Erro ao ajustar na Shopify:", adjustData.data.inventoryAdjustQuantity.userErrors);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Erro na comunicação com Shopify API:", error);
      return false;
    }
  }

  /**
   * Cria um novo produto na Shopify (Outbound)
   */
  static async createProduct(data: { name: string, sku: string, price: number }) {
    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const token = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;

    if (!domain || !token) {
      console.warn("Credenciais do Shopify não configuradas. Ignorando criação.");
      return false;
    }

    try {
      const mutation = `
        mutation productCreate($input: ProductInput!) {
          productCreate(input: $input) {
            product {
              id
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const variables = {
        input: {
          title: data.name,
          vendor: "Estoque Local",
          variants: [
            {
              sku: data.sku,
              price: data.price.toString()
            }
          ]
        }
      };

      const res = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': token,
        },
        body: JSON.stringify({ query: mutation, variables })
      });

      const responseData = await res.json();
      
      if (responseData?.data?.productCreate?.userErrors?.length > 0) {
        console.error("Erro ao criar produto na Shopify:", responseData.data.productCreate.userErrors);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Erro na comunicação para criar produto:", err);
      return false;
    }
  }
}
