import { db } from "../app/db.server";
import { productsTable, salesDataTable } from "../app/drizzle/schema.server";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Deleting fake injected products...");
  
  const fakeIds = ["gid://shopify/Product/111", "gid://shopify/Product/333", "gid://shopify/Product/444"];
  
  for (const fakeId of fakeIds) {
    const products = await db.select().from(productsTable).where(eq(productsTable.shopifyProductId, fakeId));
    if (products.length > 0) {
      const p = products[0];
      await db.delete(salesDataTable).where(eq(salesDataTable.productId, p.id));
      await db.delete(productsTable).where(eq(productsTable.id, p.id));
    }
  }

  console.log("Fake products deleted!");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
