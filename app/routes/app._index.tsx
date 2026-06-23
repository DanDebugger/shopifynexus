import { useEffect } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, useNavigate } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { db } from "../db.server";
import { buildTemplateTable, customerBuildTable, salesDataTable, productsTable } from "../drizzle/schema.server";
import { desc, eq } from "drizzle-orm";
import { getTierForRank } from "../services/rankingService.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  
  // Fetch active templates and recent builds
  const templates = await db.select().from(buildTemplateTable).orderBy(desc(buildTemplateTable.createdAt)).limit(10);
  const recentBuilds = await db.select().from(customerBuildTable).orderBy(desc(customerBuildTable.createdAt)).limit(10);
  
  // Fetch top 10 ranked products
  const rawLeaderboard = await db.select()
    .from(salesDataTable)
    .leftJoin(productsTable, eq(salesDataTable.productId, productsTable.id))
    .orderBy(salesDataTable.rankPosition)
    .limit(10);
  
  const leaderboard = rawLeaderboard.map(row => ({
    ...row,
    tier: getTierForRank(row.sales_data?.rankPosition ?? null)
  }));

  return { templates, recentBuilds, leaderboard };
};

export default function Index() {
  const { templates, recentBuilds, leaderboard } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <s-page heading="NexusLab PC Build Tracker">
      <s-button slot="primary-action" onClick={() => navigate("/app/builds/new")}>
        Create New Build
      </s-button>

      <s-section heading="Dashboard Overview">
        <s-paragraph>
          Welcome to the NexusLab PC Build Tracker. Here you can manage your custom PC assembly workflows, 
          track customer builds, and view performance compatibility scores.
        </s-paragraph>
      </s-section>

      <s-section heading="Active Customer Builds">
        {recentBuilds.length === 0 ? (
          <s-paragraph>No active builds. Create one to get started.</s-paragraph>
        ) : (
          <s-stack direction="block" gap="base">
            {recentBuilds.map((build) => (
              <s-box key={build?.id} padding="base" borderWidth="base" borderRadius="base" background="subdued">
                <s-stack direction="inline" gap="base">
                  <strong><s-text>Build #{build?.id.substring(0,8)}</s-text></strong>
                  <s-text>Status: {build?.status}</s-text>
                  <s-text>Score: {build?.totalScore}</s-text>
                  <s-button variant="tertiary" onClick={() => navigate(`/app/builds/${build?.id}`)}>View Details</s-button>
                </s-stack>
              </s-box>
            ))}
          </s-stack>
        )}
      </s-section>

      <s-section heading="Available PC Templates">
        {templates.length === 0 ? (
          <s-paragraph>No templates configured. Create templates to standardize builds.</s-paragraph>
        ) : (
          <s-unordered-list>
            {templates.map(t => (
              <s-list-item key={t.id}>
                <strong><s-text>{t.name}</s-text></strong> - Base Tier: {t.baseTierScore}
              </s-list-item>
            ))}
          </s-unordered-list>
        )}
      </s-section>

      <s-divider />

      <s-section heading="Sales Ranker Top 10 Leaderboard">
        {leaderboard.length === 0 ? (
          <s-paragraph>No ranked products. Sync sales data to generate leaderboard.</s-paragraph>
        ) : (
          <s-stack direction="block" gap="base">
            {leaderboard.map((row) => {
              const sales = row.sales_data;
              const prod = row.products;
              const tier = row.tier;
              
              return (
                <s-box key={sales.id} padding="base" borderWidth="base" borderRadius="base" background="subdued">
                  <s-stack direction="inline" gap="base">
                    <strong><s-text>#{sales.rankPosition}</s-text></strong>
                    {prod?.imageUrl && <img src={prod.imageUrl} alt={prod.title} width="30" height="30" style={{objectFit: 'cover'}} />}
                    <s-stack direction="block" gap="none">
                      <strong><s-text>{prod?.title || 'Unknown'}</s-text></strong>
                      <s-text>{tier}</s-text>
                    </s-stack>
                    <s-text>Score: {sales.rankScore}</s-text>
                    <s-button variant="tertiary" onClick={() => navigate("/app/promos/new")}>Promo</s-button>
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

export const headers = (headersArgs: any) => {
  return boundary.headers(headersArgs);
};
