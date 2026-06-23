import { db } from "./app/db.server";
import { buildTemplateTable } from "./app/drizzle/schema.server";
import { desc } from "drizzle-orm";

async function main() {
  try {
    console.log("Testing connection...");
    const templates = await db.select().from(buildTemplateTable).orderBy(desc(buildTemplateTable.createdAt)).limit(10);
    console.log("Success! Templates:", templates);
    process.exit(0);
  } catch (e) {
    console.error("Error executing query:");
    console.error(e);
    process.exit(1);
  }
}

main();
