import { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { db } from "../db.server";
import { customerBuildTable, buildHistoryLogTable, buildTemplateTable } from "../drizzle/schema.server";
import { eq } from "drizzle-orm";

// Only handle POST requests from the Storefront
export const action = async ({ request }: ActionFunctionArgs) => {
  // authenticate.public.appProxy verifies the signature of requests coming from Shopify's App Proxy
  const { session } = await authenticate.public.appProxy(request);

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const templateId = formData.get("templateId") as string;
  const customerId = formData.get("customerId") as string || `web-${Math.random().toString(36).substring(7)}`;

  if (!templateId) {
    return Response.json({ error: "Missing templateId" }, { status: 400 });
  }

  // Validate template exists
  const templateRes = await db.select().from(buildTemplateTable).where(eq(buildTemplateTable.id, templateId));
  if (templateRes.length === 0) {
    return Response.json({ error: "Template not found" }, { status: 404 });
  }

  const newId = `build-${Math.random().toString(36).substring(7)}`;

  // Insert customer build
  await db.insert(customerBuildTable).values({
    id: newId,
    shop: session.shop,
    customerId,
    templateId,
    status: "Pending",
    totalScore: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Log history
  await db.insert(buildHistoryLogTable).values({
    id: Math.random().toString(36).substring(7),
    buildId: newId,
    newStatus: "Pending",
    message: `Build submitted from storefront via App Proxy for template ${templateId}`,
    timestamp: new Date()
  });

  return Response.json({ success: true, buildId: newId });
};
