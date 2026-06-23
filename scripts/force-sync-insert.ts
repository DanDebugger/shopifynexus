import { db } from "../app/db.server";
import { productsTable, salesDataTable, sessionTable } from "../app/drizzle/schema.server";
import { eq } from "drizzle-orm";

async function main() {
  const sessions = await db.select().from(sessionTable);
  const session = sessions[0];
  
  if (!session || !session.accessToken) {
    console.error("No valid session found!");
    process.exit(1);
  }

  const query = `
    query {
      products(first: 50) {
        edges {
          node {
            id
            title
            productType
            featuredImage { url }
            variants(first: 1) {
              edges { node { price } }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(`https://${session.shop}/admin/api/2024-04/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": session.accessToken,
      },
      body: JSON.stringify({ query }),
    });

    const json = await response.json();
    const shopifyProducts = json.data?.products?.edges.map((e: any) => e.node) || [];
    
    console.log(`Found ${shopifyProducts.length} products. Inserting...`);

    let count = 0;
    for (const sp of shopifyProducts) {
      const price = sp.variants.edges.length > 0 ? sp.variants.edges[0].node.price : "0.00";
      
      const existing = await db.select().from(productsTable).where(eq(productsTable.shopifyProductId, sp.id));
      if (existing.length === 0) {
        const inserted = await db.insert(productsTable).values({
          shopifyProductId: sp.id,
          title: sp.title,
          category: sp.productType || "General",
          price: price,
          imageUrl: sp.featuredImage?.url || "",
        });

        await db.insert(salesDataTable).values({
          productId: inserted[0].insertId,
          unitsSold: 0,
          revenue: "0.00",
          views: 0,
          rankScore: "0.00"
        });
        count++;
      }
    }
    console.log(`Successfully synced ${count} products to the database!`);
  } catch (e) {
    console.error("Fetch/Insert Error:", e);
  }

  process.exit(0);
}

main();
