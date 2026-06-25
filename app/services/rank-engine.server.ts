import { db } from "../db.server";
import { productsTable, salesDataTable } from "../drizzle/schema.server";
import { eq, desc } from "drizzle-orm";

/**
 * Calculates rank score based on units sold and views.
 * Updates the database and returns the ranked data.
 */
export async function calculateRankings(admin: any) {
  // Fetch all products and their sales data
  const data = await db.select({
    id: salesDataTable.id,
    productId: salesDataTable.productId,
    shopifyProductId: productsTable.shopifyProductId,
    unitsSold: salesDataTable.unitsSold,
    views: salesDataTable.views,
  })
  .from(salesDataTable)
  .innerJoin(productsTable, eq(salesDataTable.productId, productsTable.id));

  // Calculate scores (example: 10 points per unit sold, 1 point per view)
  const scoredData = data.map(item => ({
    ...item,
    score: (item.unitsSold || 0) * 10 + (item.views || 0)
  }));

  // Sort descending by score
  scoredData.sort((a, b) => b.score - a.score);

  // Assign tiers based on distribution or absolute numbers
  const totalItems = scoredData.length;
  
  for (let i = 0; i < totalItems; i++) {
    const item = scoredData[i];
    let tier = 'C';
    const percentile = (totalItems - i) / totalItems; // 1.0 for highest score, down to ~0
    
    if (percentile >= 0.9) tier = 'S';
    else if (percentile >= 0.7) tier = 'A';
    else if (percentile >= 0.4) tier = 'B';
    
    // 1. Update Database
    await db.update(salesDataTable)
      .set({ 
        rankScore: item.score.toString(), 
        rankPosition: i + 1,
        rankTier: tier,
        updatedAt: new Date()
      })
      .where(eq(salesDataTable.id, item.id));

    // 2. Update Shopify Metafield (assuming graphql client provided via admin)
    // Product ID format needs to be 'gid://shopify/Product/...'
    const gid = item.shopifyProductId.includes('gid://') 
      ? item.shopifyProductId 
      : `gid://shopify/Product/${item.shopifyProductId}`;

    if (admin) {
      await admin.graphql(
        `#graphql
        mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
          metafieldsSet(metafields: $metafields) {
            metafields {
              id
              key
              value
            }
            userErrors {
              field
              message
            }
          }
        }`,
        {
          variables: {
            metafields: [
              {
                ownerId: gid,
                namespace: "nexus",
                key: "rank_tier",
                type: "single_line_text_field",
                value: tier
              }
            ]
          }
        }
      );
    }
  }

  return scoredData;
}
