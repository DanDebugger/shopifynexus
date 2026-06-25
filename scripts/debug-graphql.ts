import { db } from "../app/db.server";
import { sessionTable } from "../app/drizzle/schema.server";

async function main() {
  const sessions = await db.select().from(sessionTable);
  const session = sessions[0];
  
  if (!session) {
    console.log("No session found");
    return;
  }

  try {
    const response = await fetch(`https://${session.shop}/admin/api/2024-10/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": session.accessToken,
      },
      body: JSON.stringify({
        query: `
          query {
            products(first: 50) {
              edges {
                node {
                  id
                  title
                  productType
                  featuredImage {
                    url
                  }
                  variants(first: 1) {
                    edges {
                      node {
                        price
                      }
                    }
                  }
                  createdAt
                }
              }
            }
          }
        `
      })
    });
    
    const data = (await response.json()) as any;
    console.log("Response data:", JSON.stringify(data, null, 2));
    if (data && data.data && data.data.products) {
      console.log(`Found ${data.data.products.edges.length} products.`);
    }
  } catch (e) {
    console.error("GraphQL Error:", e);
  }
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
