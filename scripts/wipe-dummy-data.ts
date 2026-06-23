import { db } from "../app/db.server";
import { productsTable, salesDataTable, promosTable } from "../app/drizzle/schema.server";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Wiping dummy Sales Ranker data...");
  
  // To avoid foreign key constraint errors when deleting, we delete child tables first
  console.log("Deleting promos...");
  await db.delete(promosTable);

  console.log("Deleting sales data...");
  await db.delete(salesDataTable);

  console.log("Deleting products...");
  await db.delete(productsTable);

  console.log("Dummy data wiped successfully! Your database is now completely clean.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
