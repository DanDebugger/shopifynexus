import { db } from "../app/db.server";
import { sessionTable } from "../app/drizzle/schema.server";
import shopify from "../app/shopify.server";

async function main() {
  const sessions = await db.select().from(sessionTable);
  const session = sessions[0];
  
  if (!session) {
    console.log("No session found");
    return;
  }

  // Construct a valid Session object expected by shopify-api-node
  const validSession = {
    ...session,
    isActive: () => true,
  };

  const client = new shopify.api.clients.Graphql({ session: validSession as any });
  
  try {
    const response = await client.request(`
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
    `);
    
    console.log("Response data:", JSON.stringify(response.data, null, 2));
    if (response.data && response.data.products) {
      console.log(`Found ${response.data.products.edges.length} products.`);
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
