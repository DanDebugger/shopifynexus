import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useLoaderData, useNavigate, useFetcher } from "react-router";
import { authenticate } from "../shopify.server";
import { db } from "../db.server";
import { productsTable, promosTable } from "../drizzle/schema.server";
import { logActivity } from "../services/rankingService.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  const products = await db.select().from(productsTable);
  return { products };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);
  const formData = await request.formData();
  
  const productId = parseInt(formData.get("productId") as string, 10);
  const promoName = formData.get("promoName") as string;
  const discountPercent = parseInt(formData.get("discountPercent") as string, 10);
  
  await db.insert(promosTable).values({
    productId,
    promoName,
    discountPercent,
    status: "active",
    createdAt: new Date(),
  });
  
  await logActivity("promo_created", productId, `Created promo ${promoName} at ${discountPercent}%`);
  
  return Response.json({ success: true });
};

export default function NewPromo() {
  const { products } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<any>();
  const navigate = useNavigate();

  if (fetcher.data?.success) {
    navigate("/app/promos");
  }

  const isCreating = fetcher.state !== "idle";

  return (
    <s-page heading="Create New Promotion">
      <s-button slot="primary-action" onClick={() => navigate("/app/promos")}>
        Back to Promos
      </s-button>
      
      <s-section heading="Boost Slow Moving Inventory">
        <s-box padding="base" borderWidth="base" borderRadius="base">
          <fetcher.Form method="post">
            <s-stack direction="block" gap="base">
              
              <s-stack direction="block" gap="base">
                <strong><s-text>Select Product</s-text></strong>
                <select name="productId" required style={{ padding: "0.5rem", borderRadius: "4px", width: "100%", maxWidth: "400px" }}>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </s-stack>

              <s-stack direction="block" gap="base">
                <strong><s-text>Promo Name</s-text></strong>
                <input type="text" name="promoName" placeholder="e.g. Clearance Sale 2026" required style={{ padding: "0.5rem", borderRadius: "4px", width: "100%", maxWidth: "400px" }} />
              </s-stack>
              
              <s-stack direction="block" gap="base">
                <strong><s-text>Discount Percentage</s-text></strong>
                <input type="number" name="discountPercent" min="1" max="99" placeholder="20" required style={{ padding: "0.5rem", borderRadius: "4px", width: "100%", maxWidth: "400px" }} />
              </s-stack>

              <s-button type="submit" {...(isCreating ? { loading: true } : {})}>Launch Promo</s-button>
            </s-stack>
          </fetcher.Form>
        </s-box>
      </s-section>
    </s-page>
  );
}
