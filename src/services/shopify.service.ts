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
        console.warn(`SKU ${sku} não encontrado na Shopify. Indexação pode estar pendente.`);
        return false;
      }

      const adjustRes = await this.adjustInventoryByItemId(inventoryItemIdGid, adjustQuantity);
      return adjustRes.success;
    } catch (error) {
      console.error("Erro na comunicação com Shopify API:", error);
      return false;
    }
  }

  /**
   * Executa a Mutation de ajuste de inventário diretamente pelo ID global
   */
  static async adjustInventoryByItemId(inventoryItemIdGid: string, adjustQuantity: number) {
    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const token = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
    const locationId = process.env.SHOPIFY_LOCATION_ID;

    if (!domain || !token || !locationId) {
       return { success: false, error: "Credenciais ou SHOPIFY_LOCATION_ID ausente na Vercel." };
    }

    try {
      const mutation = `
        mutation inventoryAdjustQuantities($input: InventoryAdjustQuantitiesInput!) {
          inventoryAdjustQuantities(input: $input) {
            userErrors {
              field
              message
            }
            inventoryAdjustmentGroup {
              createdAt
              reason
            }
          }
        }
      `;

      const variables = {
        input: {
          name: "available",
          reason: "correction",
          changes: [
            {
              delta: adjustQuantity,
              inventoryItemId: inventoryItemIdGid,
              locationId: `gid://shopify/Location/${locationId}`
            }
          ]
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
      
      if (adjustData.errors) {
        return { success: false, error: adjustData.errors[0]?.message || "GraphQL Auth Error" };
      }

      const userErrors = adjustData?.data?.inventoryAdjustQuantities?.userErrors;
      if (userErrors && userErrors.length > 0) {
        console.error("Erro ao ajustar na Shopify:", userErrors);
        return { success: false, error: userErrors[0].message };
      }

      return { success: true };
    } catch (error: any) {
      console.error("Erro na comunicação para ajuste por ID:", error);
      return { success: false, error: error.message };
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
      return { success: false, error: "Credenciais de API não configuradas na Vercel (.env)" };
    }

    try {
      const payload = {
        product: {
          title: data.name,
          vendor: "Estoque Local",
          variants: [
            {
              sku: data.sku,
              price: data.price.toString(),
              inventory_management: "shopify"
            }
          ]
        }
      };

      const res = await fetch(`https://${domain}/admin/api/2024-01/products.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': token,
        },
        body: JSON.stringify(payload)
      });

      const responseData = await res.json();
      
      // Checa erro de requisição HTTP
      if (!res.ok) {
        console.error("Erro da Shopify REST API:", responseData);
        return { 
          success: false, 
          error: responseData.errors 
            ? JSON.stringify(responseData.errors) 
            : "Erro desconhecido ao criar na Shopify" 
        };
      }

      // Obter o OID real retornado para não precisarmos pesquisar o SKU (que sofre delay de indexação)
      const createdVariant = responseData.product?.variants?.[0];
      const inventoryItemId = createdVariant?.inventory_item_id;

      return { 
        success: true, 
        inventoryItemIdGid: inventoryItemId ? `gid://shopify/InventoryItem/${inventoryItemId}` : undefined 
      };
    } catch (err: any) {
      console.error("Erro na comunicação para criar produto:", err);
      return { success: false, error: err.message || "Erro de rede ao conectar com Shopify" };
    }
  }
}
