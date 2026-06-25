import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, useNavigate } from "react-router";
import {
  Page,
  Layout,
  Card,
  IndexTable,
  Badge,
  Text,
  Button,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { customerBuildTable } from "../drizzle/schema.server";
import { desc } from "drizzle-orm";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  
  const builds = await db.select().from(customerBuildTable).orderBy(desc(customerBuildTable.createdAt));
  
  return { builds };
};

export default function BuildQueue() {
  const { builds } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const getStatusBadgeStatus = (status: string) => {
    switch (status) {
      case 'New Order': return 'attention';
      case 'In Review': return 'warning';
      case 'Building': return 'info';
      case 'Testing': return 'info';
      case 'Shipped': return 'success';
      default: return 'new';
    }
  };

  const rowMarkup = builds.map(
    ({ id, orderNumber, status, createdAt }: { id: string, orderNumber: string | null, status: string, createdAt: Date | null }, index: number) => (
      <IndexTable.Row id={id} key={id} position={index}>
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">
            {id}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{orderNumber || '-'}</IndexTable.Cell>
        <IndexTable.Cell>
          <Badge tone={getStatusBadgeStatus(status)}>{status}</Badge>
        </IndexTable.Cell>
        <IndexTable.Cell>{createdAt ? new Date(createdAt).toLocaleDateString() : '-'}</IndexTable.Cell>
        <IndexTable.Cell>
          <Button onClick={() => navigate(`/app/builds/${id}`)}>Manage</Button>
        </IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  return (
    <Page title="Build Queue">
      <Layout>
        <Layout.Section>
          <Card padding="0">
            <IndexTable
              resourceName={{ singular: 'build', plural: 'builds' }}
              itemCount={builds.length}
              headings={[
                { title: 'Build ID' },
                { title: 'Order Number' },
                { title: 'Status' },
                { title: 'Created At' },
                { title: 'Action' },
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
