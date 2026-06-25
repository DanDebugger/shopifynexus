import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { db } from "../db.server";
import { salesDataTable, productsTable } from "../drizzle/schema.server";
import { eq, desc } from "drizzle-orm";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Authenticate the request via app proxy
  await authenticate.public.appProxy(request);

  // Fetch the top 10 products
  const rankings = await db.select({
    id: salesDataTable.id,
    title: productsTable.title,
    rankTier: salesDataTable.rankTier,
  })
  .from(salesDataTable)
  .innerJoin(productsTable, eq(salesDataTable.productId, productsTable.id))
  .orderBy(desc(salesDataTable.rankScore))
  .limit(10);

  return Response.json(rankings);
};
