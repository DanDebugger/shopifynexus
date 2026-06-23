import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useLoaderData, useNavigate, useFetcher } from "react-router";
import { authenticate } from "../shopify.server";
import { db } from "../db.server";
import { productsTable, salesDataTable } from "../drizzle/schema.server";
import { calculateRankings, getTierForRank } from "../services/rankingService.server";
import { eq } from "drizzle-orm";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  
  // Left join products with their sales data
  const rawData = await db.select()
    .from(productsTable)
    .leftJoin(salesDataTable, eq(productsTable.id, salesDataTable.productId));
    
  const data = rawData.map(row => ({
    ...row,
    tier: getTierForRank(row.sales_data?.rankPosition ?? null)
  }));

  return { data };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "simulate_sale") {
    const productId = Number(formData.get("productId"));
    if (!productId) return Response.json({ error: "No product ID" }, { status: 400 });

    const existingSales = await db.select().from(salesDataTable).where(eq(salesDataTable.productId, productId));
    if (existingSales.length > 0) {
      const sd = existingSales[0];
      const product = await db.select().from(productsTable).where(eq(productsTable.id, productId));
      const price = parseFloat(product[0]?.price || "0");
      
      const newUnits = sd.unitsSold + Math.floor(Math.random() * 5) + 1; // 1-5 units
      const newRevenue = (parseFloat(sd.revenue || "0") + (newUnits - sd.unitsSold) * price).toFixed(2);
      const newViews = sd.views + Math.floor(Math.random() * 20);

      await db.update(salesDataTable)
        .set({ unitsSold: newUnits, revenue: newRevenue, views: newViews })
        .where(eq(salesDataTable.id, sd.id));

      await calculateRankings();
      return Response.json({ success: true, simulated: true });
    }
    return Response.json({ error: "Sales data not found" }, { status: 404 });
  }

  if (intent === "sync_products") {
    try {
      // Fetch up to 50 products from Shopify Admin GraphQL API
      const response = await admin.graphql(`
        query {
          products(first: 50) {
            edges {
              node {
                id
                title
                productType
                featuredImage {
                  url
                }
                variants(first: 1) {
                  edges {
                    node {
                      price
                    }
                  }
                }
                createdAt
              }
            }
          }
        }
      `);

      const responseJson = await response.json();
      
      if (responseJson.errors) {
        return Response.json({ error: JSON.stringify(responseJson.errors) }, { status: 400 });
      }
      
      const shopifyProducts = responseJson.data?.products?.edges.map((edge: any) => edge.node) || [];

  // Sync them into our Drizzle database
  for (const sp of shopifyProducts) {
    const price = sp.variants.edges.length > 0 ? sp.variants.edges[0].node.price : "0.00";
    
    // Upsert logic or simple ignore if exists. We'll do a basic lookup.
    const existing = await db.select().from(productsTable).where(eq(productsTable.shopifyProductId, sp.id));
    if (existing.length === 0) {
      const inserted = await db.insert(productsTable).values({
        shopifyProductId: sp.id,
        title: sp.title,
        category: sp.productType || "General",
        price: price,
        imageUrl: sp.featuredImage?.url || "",
      });

      // Also create empty sales data for the newly imported product so it can be ranked later
      await db.insert(salesDataTable).values({
        productId: inserted[0].insertId,
        unitsSold: 0,
        revenue: "0.00",
        views: 0,
        rankScore: "0.00"
      });
    }
  }

  return Response.json({ success: true, count: shopifyProducts.length });
} catch (e: any) {
      console.error("SYNC ERROR:", e);
      return Response.json({ error: e.message || "Unknown error occurred" }, { status: 500 });
    }
  }

  return Response.json({ error: "Invalid intent" }, { status: 400 });
};

export default function Products() {
  const { data } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const fetcher = useFetcher<any>();
  const isSyncing = fetcher.state !== "idle";
  const actionData = fetcher.data;

  return (
    <s-page heading="Sales Ranker Products">
      <s-stack direction="inline" slot="primary-action">
        <s-stack direction="inline" gap="base" alignment="center">
          {actionData?.error && <span style={{ color: "red", fontWeight: "bold" }}>Error: {actionData.error}</span>}
          {actionData?.success && <span style={{ color: "green", fontWeight: "bold" }}>Synced {actionData.count} products!</span>}
          
          <fetcher.Form method="post">
          <input type="hidden" name="intent" value="sync_products" />
          <button type="submit" style={{ padding: "8px 16px", cursor: "pointer" }}>
            Sync Shopify Products
          </button>
        </fetcher.Form>
        </s-stack>
        <s-button onClick={() => navigate("/app/promos/new")}>
          Create Promo
        </s-button>
      </s-stack>
      
      <s-section>
        {data.length === 0 ? (
          <s-paragraph>No products found in the database. Need to sync products.</s-paragraph>
        ) : (
          <s-stack direction="block" gap="base">
            {data.map((row) => {
              const prod = row.products;
              const sales = row.sales_data;
              const tier = row.tier;
              
              return (
                <s-box key={prod.id} padding="base" borderWidth="base" borderRadius="base" background="subdued">
                  <s-stack direction="inline" gap="base">
                    {prod.imageUrl && <img src={prod.imageUrl} alt={prod.title} width="50" height="50" style={{objectFit: 'cover', borderRadius: '4px'}} />}
                    <s-stack direction="block" gap="base">
                      <strong><s-text>{prod.title}</s-text></strong>
                      <s-text>Rank: #{sales?.rankPosition || 'Unranked'} - {tier}</s-text>
                      <s-text>Score: {sales?.rankScore || '0'}</s-text>
                    </s-stack>
                    <s-stack direction="block" gap="base">
                      <s-text>Units Sold: {sales?.unitsSold || 0}</s-text>
                      <s-text>Revenue: ₱{sales?.revenue || '0.00'}</s-text>
                      <s-text>Views: {sales?.views || 0}</s-text>
                    </s-stack>
                    <s-stack direction="block" gap="base">
                      <fetcher.Form method="post">
                        <input type="hidden" name="intent" value="simulate_sale" />
                        <input type="hidden" name="productId" value={prod.id} />
                        <button type="submit" style={{ padding: "8px 16px", cursor: "pointer" }}>Simulate Sale</button>
                      </fetcher.Form>
                    </s-stack>
                  </s-stack>
                </s-box>
              );
            })}
          </s-stack>
        )}
      </s-section>
    </s-page>
  );
}
