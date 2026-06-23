import { db } from "../app/db.server";
import { productsTable } from "../app/drizzle/schema.server";

async function main() {
  const products = await db.select().from(productsTable);
  console.log("Database Products:", products.length);
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
