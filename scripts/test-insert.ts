import { db } from "../app/db.server";
import { productsTable } from "../app/drizzle/schema.server";

async function main() {
  try {
    const inserted = await db.insert(productsTable).values({
      shopifyProductId: "gid://shopify/Product/test1234",
      title: "Test Insert Product",
      category: "Test",
      price: "10.00",
      imageUrl: ""
    });
    console.log("Insert result:", inserted);
    console.log("Insert ID:", inserted[0]?.insertId);
  } catch (e) {
    console.error("Insert error:", e);
  }
  process.exit(0);
}

main();
