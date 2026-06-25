import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Badge,
  ButtonGroup,
  Button
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useLoaderData, useSubmit } from "react-router";
import { db } from "../db.server";
import { customerBuildTable } from "../drizzle/schema.server";
import { eq } from "drizzle-orm";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  const builds = await db.select().from(customerBuildTable);
  return { builds };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);
  const formData = await request.formData();
  const buildId = formData.get("buildId") as string;
  const status = formData.get("status") as string;

  if (buildId && status) {
    await db.update(customerBuildTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(customerBuildTable.id, buildId));
  }
  return null;
};

export default function Workflows() {
  const { builds } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const handleStatusChange = (buildId: string, newStatus: string) => {
    submit({ buildId, status: newStatus }, { method: "POST" });
  };

  const columns = ["Pending", "Assembly", "Testing", "QA Passed", "Ready for Shipping"];

  return (
    <Page title="PC Build Workflow Tracker">
      <Layout>
        {columns.map((column) => (
          <Layout.Section variant="oneThird" key={column}>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  {column}
                </Text>
                {builds
                  .filter((b) => b.status === column)
                  .map((build) => (
                    <Card key={build.id}>
                      <BlockStack gap="200">
                        <Text as="p" variant="bodyMd" fontWeight="bold">
                          Build #{build.id.slice(-4)}
                        </Text>
                        <Badge tone={column === 'Ready for Shipping' ? 'success' : 'info'}>
                          {build.status}
                        </Badge>
                        <ButtonGroup>
                          {columns.indexOf(column) > 0 && (
                            <Button 
                              onClick={() => handleStatusChange(build.id, columns[columns.indexOf(column) - 1])}
                            >
                              Move Back
                            </Button>
                          )}
                          {columns.indexOf(column) < columns.length - 1 && (
                            <Button 
                              variant="primary" 
                              onClick={() => handleStatusChange(build.id, columns[columns.indexOf(column) + 1])}
                            >
                              Next Step
                            </Button>
                          )}
                        </ButtonGroup>
                      </BlockStack>
                    </Card>
                  ))}
              </BlockStack>
            </Card>
          </Layout.Section>
        ))}
      </Layout>
    </Page>
  );
}
