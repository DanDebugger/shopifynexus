import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { db } from "../db.server";
import { salesDataTable, productsTable } from "../drizzle/schema.server";
import { eq, desc } from "drizzle-orm";
import { calculateRankings } from "../services/rank-engine.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Authenticate the request via app proxy
  const { admin } = await authenticate.public.appProxy(request);

  if (admin) {
    await calculateRankings(admin);
  }

  // Fetch the top 10 products
  const rankings = await db.select({
    id: salesDataTable.id,
    title: productsTable.title,
    rankTier: salesDataTable.rankTier,
    unitsSold: salesDataTable.unitsSold,
  })
  .from(salesDataTable)
  .innerJoin(productsTable, eq(salesDataTable.productId, productsTable.id))
  .orderBy(desc(salesDataTable.rankScore))
  .limit(10);

  return Response.json(rankings);
};
