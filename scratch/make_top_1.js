import mysql from "mysql2/promise";

async function main() {
  const pool = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "rootpassword",
    database: "nexuslab_app",
    port: 3307,
  });

  // Find NexusBook Air
  const [rows] = await pool.query("SELECT id FROM products WHERE title LIKE '%NexusBook Air%' LIMIT 1");
  const products = rows;
  
  if (products.length > 0) {
    const id = products[0].id;
    console.log("Found NexusBook Air with ID:", id);
    
    // Check if sales data exists
    const [salesRows] = await pool.query("SELECT * FROM sales_data WHERE product_id = ?", [id]);
    const sales = salesRows;
    if (sales.length > 0) {
      await pool.query("UPDATE sales_data SET units_sold = 9999, views = 9999 WHERE product_id = ?", [id]);
      console.log("Updated existing sales data");
    } else {
      await pool.query("INSERT INTO sales_data (product_id, units_sold, views) VALUES (?, 9999, 9999)", [id]);
      console.log("Inserted new sales data");
    }
  } else {
    console.log("NexusBook Air not found in DB");
  }
  
  await pool.end();
}

main().catch(console.error);
