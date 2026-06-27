import mysql from "mysql2/promise";

async function main() {
  const pool = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "rootpassword",
    database: "nexuslab_app",
    port: 3307,
  });

  // 1. Get Top 5 Products
  const [salesRows] = await pool.query(`
    SELECT p.shopify_product_id, s.units_sold 
    FROM sales_data s 
    JOIN products p ON s.product_id = p.id 
    ORDER BY s.units_sold DESC 
    LIMIT 5
  `);
  
  const rows = salesRows;
  let topProductGids = rows.map(row => {
    let gid = row.shopify_product_id;
    if (!gid.includes('gid://')) {
      gid = `gid://shopify/Product/${gid}`;
    }
    return gid;
  });
  
  // Remove duplicates to prevent Liquid errors!
  topProductGids = Array.from(new Set(topProductGids));

  console.log("Top Products:", topProductGids);

  // 2. Get Shop and Access Token
  const [sessionRows] = await pool.query("SELECT shop, accessToken FROM session LIMIT 1");
  const sessions = sessionRows;
  
  if (sessions.length === 0) {
    console.log("No session found!");
    process.exit(1);
  }

  const shop = sessions[0].shop;
  const accessToken = sessions[0].accessToken;

  // 3. Get Shop ID
  const shopQuery = await fetch(`https://${shop}/admin/api/2024-04/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken
    },
    body: JSON.stringify({ query: `query { shop { id } }` })
  });
  
  const shopData = await shopQuery.json();
  const shopId = shopData.data?.shop?.id;
  
  if (!shopId) {
    console.log("Failed to get shop ID:", shopData);
    process.exit(1);
  }

  // 4. Update Shop Metafield
  const mutation = `
    mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id value }
        userErrors { message field }
      }
    }
  `;

  const metafieldsRes = await fetch(`https://${shop}/admin/api/2024-04/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        metafields: [{
          ownerId: shopId,
          namespace: "nexus",
          key: "top_products",
          type: "list.product_reference",
          value: JSON.stringify(topProductGids)
        }]
      }
    })
  });

  const result = await metafieldsRes.json();
  console.log("Metafield Update Result:", JSON.stringify(result, null, 2));

  await pool.end();
}

main().catch(console.error);
