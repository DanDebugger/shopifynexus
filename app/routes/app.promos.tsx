import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, useNavigate } from "react-router";
import { authenticate } from "../shopify.server";
import { db } from "../db.server";
import { promosTable, productsTable } from "../drizzle/schema.server";
import { desc, eq } from "drizzle-orm";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  
  const data = await db.select()
    .from(promosTable)
    .leftJoin(productsTable, eq(promosTable.productId, productsTable.id))
    .orderBy(desc(promosTable.createdAt));
    
  return { data };
};

export default function Promos() {
  const { data } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <s-page heading="Sales Ranker Promos">
      <s-button slot="primary-action" onClick={() => navigate("/app/promos/new")}>
        Create New Promo
      </s-button>
      
      <s-section>
        {data.length === 0 ? (
          <s-paragraph>No promotional campaigns created yet.</s-paragraph>
        ) : (
          <s-unordered-list>
            {data.map((row) => {
              const promo = row.promos;
              const product = row.products;
              
              return (
                <s-list-item key={promo.id}>
                  <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
                    <strong><s-text>{promo.promoName} - {promo.discountPercent}% OFF</s-text></strong>
                    <s-text>Product: {product?.title || 'Unknown Product'}</s-text>
                    <s-badge>{promo.status}</s-badge>
                    <s-text>Created: {new Date(promo.createdAt!).toLocaleDateString()}</s-text>
                  </s-box>
                </s-list-item>
              );
            })}
          </s-unordered-list>
        )}
      </s-section>
    </s-page>
  );
}
