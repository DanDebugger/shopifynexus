import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useLoaderData, useFetcher, useNavigate } from "react-router";
import { authenticate } from "../shopify.server";
import { db } from "../db.server";
import { customerBuildTable, buildHistoryLogTable, buildTemplateTable } from "../drizzle/schema.server";
import { calculateBuildTierScore } from "../services/buildScorer.server";
import { eq, desc } from "drizzle-orm";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  const id = params.id as string;
  
  if (id === 'new') {
    const templates = await db.select().from(buildTemplateTable);
    return { isNew: true, templates, build: null, logs: [], scoreData: null };
  }

  const buildRes = await db.select().from(customerBuildTable).where(eq(customerBuildTable.id, id));
  if (buildRes.length === 0) throw new Response("Not Found", { status: 404 });
  const build = buildRes[0];

  const logs = await db.select().from(buildHistoryLogTable).where(eq(buildHistoryLogTable.buildId, id)).orderBy(desc(buildHistoryLogTable.timestamp));
  
  const scoreData = await calculateBuildTierScore(id).catch(() => null);

  return { isNew: false, templates: [], build, logs, scoreData };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  await authenticate.admin(request);
  const id = params.id as string;
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "updateStatus") {
    const newStatus = formData.get("status") as string;
    const oldStatus = formData.get("oldStatus") as string;
    
    // Update build
    await db.update(customerBuildTable).set({ status: newStatus, updatedAt: new Date() }).where(eq(customerBuildTable.id, id));
    
    // Log history
    await db.insert(buildHistoryLogTable).values({
      id: Math.random().toString(36).substring(7),
      buildId: id,
      oldStatus,
      newStatus,
      message: `Status manually updated from ${oldStatus} to ${newStatus}`,
      timestamp: new Date()
    });
    
    return { success: true };
  }

  if (intent === "updateShipping") {
    const courier = formData.get("courier") as string;
    const trackingNumber = formData.get("trackingNumber") as string;
    
    await db.update(customerBuildTable).set({ courier, trackingNumber, updatedAt: new Date() }).where(eq(customerBuildTable.id, id));
    
    await db.insert(buildHistoryLogTable).values({
      id: Math.random().toString(36).substring(7),
      buildId: id,
      newStatus: "Ready for Shipping",
      message: `Shipping updated: ${courier} - ${trackingNumber}`,
      timestamp: new Date()
    });
    
    return { success: true };
  }

  if (intent === "createBuild") {
    const templateId = formData.get("templateId") as string;
    const customerId = formData.get("customerId") as string;
    const newId = `build-${Math.random().toString(36).substring(7)}`;

    await db.insert(customerBuildTable).values({
      id: newId,
      shop: "nexuslab-lyqbuhkl.myshopify.com",
      customerId,
      templateId,
      status: "Pending",
      totalScore: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await db.insert(buildHistoryLogTable).values({
      id: Math.random().toString(36).substring(7),
      buildId: newId,
      newStatus: "Pending",
      message: `Build created from template ${templateId} for customer ${customerId}`,
      timestamp: new Date()
    });

    return { success: true, newId };
  }

  return null;
};

export default function BuildDetails() {
  const { isNew, templates, build, logs, scoreData } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<any>();
  const navigate = useNavigate();

  // If a new build was just created, redirect to its detail page
  if (fetcher.data?.newId) {
    navigate(`/app/builds/${fetcher.data.newId}`);
  }

  if (isNew) {
    const isCreating = fetcher.state !== "idle";
    return (
      <s-page heading="Create New Customer Build">
        <s-section heading="Select a Template to begin assembly">
          <s-box padding="base" borderWidth="base" borderRadius="base">
            <fetcher.Form method="post">
              <input type="hidden" name="intent" value="createBuild" />
              <s-stack direction="block" gap="base">
                <s-stack direction="block" gap="base">
                  <strong><s-text>Customer Identifier</s-text></strong>
                  <input type="text" name="customerId" placeholder="e.g. cust-405" required style={{ padding: "0.5rem", borderRadius: "4px", width: "100%", maxWidth: "400px" }} />
                </s-stack>
                <s-stack direction="block" gap="base">
                  <strong><s-text>Base Template</s-text></strong>
                  <select name="templateId" required style={{ padding: "0.5rem", borderRadius: "4px", width: "100%", maxWidth: "400px" }}>
                    {templates.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.name} (Tier {t.baseTierScore})</option>
                    ))}
                  </select>
                </s-stack>
                <s-button type="submit" {...(isCreating ? { loading: true } : {})}>Create Build</s-button>
              </s-stack>
            </fetcher.Form>
          </s-box>
        </s-section>
      </s-page>
    );
  }

  const isLoading = fetcher.state !== "idle";

  return (
    <s-page heading={`Build Details: ${build?.id.substring(0,8)}`}>
      <s-section heading="Workflow Status">
        <s-stack direction="inline" gap="base">
          <strong><s-text>Current Status:</s-text></strong>
          <s-badge>{build?.status}</s-badge>
        </s-stack>

        <s-box padding="base">
          <fetcher.Form method="post">
            <input type="hidden" name="intent" value="updateStatus" />
            <input type="hidden" name="oldStatus" value={build?.status} />
            <s-stack direction="inline" gap="base">
              <select name="status" defaultValue={build?.status} style={{ padding: "0.5rem", borderRadius: "4px" }}>
                <option value="Pending">Pending</option>
                <option value="Assembly">Assembly</option>
                <option value="Testing">Testing</option>
                <option value="QA Passed">QA Passed</option>
                <option value="Ready for Shipping">Ready for Shipping</option>
              </select>
              <s-button type="submit" {...(isLoading ? { loading: true } : {})}>Update Status</s-button>
            </s-stack>
          </fetcher.Form>
        </s-box>
      </s-section>

      {build?.status === "Ready for Shipping" && (
        <s-section heading="Shipping & Fulfillment">
          <s-box padding="base" borderWidth="base" borderRadius="base">
            <fetcher.Form method="post">
              <input type="hidden" name="intent" value="updateShipping" />
              <s-stack direction="block" gap="base">
                <s-stack direction="block" gap="base">
                  <strong><s-text>Courier</s-text></strong>
                  <input type="text" name="courier" defaultValue={build.courier || ''} placeholder="e.g. FedEx, UPS" style={{ padding: "0.5rem", borderRadius: "4px", width: "100%", maxWidth: "400px" }} />
                </s-stack>
                <s-stack direction="block" gap="base">
                  <strong><s-text>Tracking Number</s-text></strong>
                  <input type="text" name="trackingNumber" defaultValue={build.trackingNumber || ''} placeholder="e.g. 1Z9999999999999999" style={{ padding: "0.5rem", borderRadius: "4px", width: "100%", maxWidth: "400px" }} />
                </s-stack>
                <s-button type="submit" {...(isLoading ? { loading: true } : {})}>Save Shipping Details</s-button>
              </s-stack>
            </fetcher.Form>
          </s-box>
        </s-section>
      )}

      {scoreData && (
        <s-section heading="Performance Tier & Bottleneck Scorer">
          <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
            <strong><s-text>Tier: {scoreData.tier}</s-text></strong>
            <s-text>Total Score: {scoreData.totalScore}</s-text>
            
            {scoreData.bottleneckWarning && (
              <s-box>
                <s-text color="subdued">{scoreData.bottleneckWarning}</s-text>
              </s-box>
            )}
          </s-box>
        </s-section>
      )}

      <s-section heading="Activity History">
        {logs.length === 0 ? (
          <s-paragraph>No activity logged yet.</s-paragraph>
        ) : (
          <s-unordered-list>
            {logs.map(log => (
              <s-list-item key={log.id}>
                <strong><s-text>{new Date(log.timestamp!).toLocaleString()}</s-text></strong> - {log.message}
              </s-list-item>
            ))}
          </s-unordered-list>
        )}
      </s-section>
    </s-page>
  );
}
