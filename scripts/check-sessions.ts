import { db } from "../app/db.server";
import { sessionTable } from "../app/drizzle/schema.server";

async function main() {
  const sessions = await db.select().from(sessionTable);
  console.log("Sessions found:", sessions.length);
  for (const s of sessions) {
    console.log(`Shop: ${s.shop}, IsOnline: ${s.isOnline}, HasToken: ${!!s.accessToken}`);
  }
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
