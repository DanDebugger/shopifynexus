import { db } from "../app/db.server";
import { sessionTable } from "../app/drizzle/schema.server";

async function main() {
  const sessions = await db.select().from(sessionTable);
  const session = sessions[0];
  
  if (!session || !session.accessToken) {
    console.error("No valid session found!");
    process.exit(1);
  }

  console.log(`Using access token for shop: ${session.shop}`);

  const query = `
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
    console.log("Response status:", response.status);
    console.log("GraphQL Data:", JSON.stringify(json, null, 2));
  } catch (e) {
    console.error("Fetch Error:", e);
  }

  process.exit(0);
}

main();
