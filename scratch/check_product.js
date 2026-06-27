import mysql from "mysql2/promise";

async function main() {
  const pool = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "rootpassword",
    database: "nexuslab_app",
    port: 3307,
  });

  const [sessionRows] = await pool.query("SELECT shop, accessToken FROM session LIMIT 1");
  const sessions = sessionRows;
  
  if (sessions.length === 0) {
    console.log("No session found!");
    process.exit(1);
  }

  const shop = sessions[0].shop;
  const accessToken = sessions[0].accessToken;

  const query = `
    query {
      product(id: "gid://shopify/Product/7376518316112") {
        id
        title
        status
      }
    }
  `;

  const res = await fetch(`https://${shop}/admin/api/2024-04/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken
    },
    body: JSON.stringify({ query })
  });

  const result = await res.json();
  console.log(JSON.stringify(result, null, 2));

  await pool.end();
}

main().catch(console.error);
