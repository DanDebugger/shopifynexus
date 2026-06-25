import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  IndexTable,
  Badge,
  Button
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useLoaderData, useSubmit } from "react-router";
import { db } from "../db.server";
import { salesDataTable, productsTable } from "../drizzle/schema.server";
import { calculateRankings } from "../services/rank-engine.server";
import { eq, desc } from "drizzle-orm";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  const rankings = await db.select({
    id: salesDataTable.id,
    productId: productsTable.shopifyProductId,
    title: productsTable.title,
    unitsSold: salesDataTable.unitsSold,
    views: salesDataTable.views,
    rankScore: salesDataTable.rankScore,
    rankTier: salesDataTable.rankTier,
  })
  .from(salesDataTable)
  .innerJoin(productsTable, eq(salesDataTable.productId, productsTable.id))
  .orderBy(desc(salesDataTable.rankScore));

  return { rankings };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  
  if (formData.get("action") === "recalculate") {
    await calculateRankings(admin);
  }
  return null;
};

export default function Leaderboard() {
  const { rankings } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const handleRecalculate = () => {
    submit({ action: "recalculate" }, { method: "POST" });
  };

  const getTierColor = (tier: string) => {
    switch(tier) {
      case 'S': return 'success';
      case 'A': return 'info';
      case 'B': return 'warning';
      default: return 'critical';
    }
  };

  const rowMarkup = rankings.map(
    ({ id, title, unitsSold, views, rankScore, rankTier }, index) => (
      <IndexTable.Row id={id.toString()} key={id} position={index}>
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">
            {index + 1}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{title}</IndexTable.Cell>
        <IndexTable.Cell>
          <Badge tone={getTierColor(rankTier || 'C')}>
            {rankTier || 'Unranked'}
          </Badge>
        </IndexTable.Cell>
        <IndexTable.Cell>{unitsSold}</IndexTable.Cell>
        <IndexTable.Cell>{views}</IndexTable.Cell>
        <IndexTable.Cell>{rankScore}</IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  return (
    <Page 
      title="Sales Leaderboard"
      primaryAction={<Button variant="primary" onClick={handleRecalculate}>Recalculate Rankings</Button>}
    >
      <Layout>
        <Layout.Section>
          <Card padding="0">
            <IndexTable
              resourceName={{ singular: 'product', plural: 'products' }}
              itemCount={rankings.length}
              headings={[
                { title: 'Rank' },
                { title: 'Product' },
                { title: 'Tier' },
                { title: 'Units Sold' },
                { title: 'Views' },
                { title: 'Score' },
              ]}
              selectable={false}
            >
              {rowMarkup}
            </IndexTable>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
