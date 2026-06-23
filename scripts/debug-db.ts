import { db } from "../app/db.server";
import { productsTable, salesDataTable } from "../app/drizzle/schema.server";

async function main() {
  const products = await db.select().from(productsTable);
  const sales = await db.select().from(salesDataTable);
  console.log("Products count:", products.length);
  console.log("Sales data count:", sales.length);
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
