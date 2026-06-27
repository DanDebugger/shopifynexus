import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Badge,
  ButtonGroup,
  Button,
  InlineStack,
  TextField,
  Banner
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useState, useCallback, useEffect } from "react";
import { useLoaderData, useSubmit, useNavigate, useActionData, Form as RemixForm, useNavigation } from "react-router";
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
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const buildId = formData.get("buildId") as string;
  const status = formData.get("status") as string;

  if (intent === "searchOrder") {
    let searchQuery = formData.get("searchQuery") as string;
    if (!searchQuery) return { action: "not_found", query: "" };
    
    // Clean query (e.g. #1006 -> 1006)
    searchQuery = searchQuery.trim().replace('#', '');
    
    // Check local db first (by orderNumber which might not have #)
    const existingBuild = await db.select().from(customerBuildTable).where(eq(customerBuildTable.orderNumber, searchQuery)).limit(1);
    if (existingBuild.length > 0) {
      return { action: "redirect", buildId: existingBuild[0].id };
    }
    
    // Search Shopify
    try {
      const response = await admin.graphql(
      `#graphql
      query getOrders($query: String!) {
        orders(first: 1, query: $query) {
          edges {
            node {
              id
              name
            }
          }
        }
      }`,
      { variables: { query: `name:${searchQuery}` } }
      );
      const json = (await response.json()) as any;
      
      if (json.errors) {
        return { action: "error", message: json.errors[0].message };
      }
      
      const orderNode = json.data?.orders?.edges[0]?.node;
      
      if (orderNode) {
        return { 
          action: "found", 
          order: {
            id: orderNode.id.split('/').pop(),
            name: orderNode.name.replace('#', ''),
            customerId: ""
          }
        };
      } else {
        return { action: "not_found", query: searchQuery };
      }
    } catch (e: any) {
      return { action: "error", message: e.message };
    }
  }

  if (intent === "startWorkflow") {
    const orderId = formData.get("orderId") as string;
    const orderNumber = formData.get("orderNumber") as string;
    const customerId = formData.get("customerId") as string;
    const newId = `build-${Math.random().toString(36).substring(7)}`;
    
    await db.insert(customerBuildTable).values({
      id: newId,
      shop: "nexuslab-lyqbuhkl.myshopify.com",
      orderId,
      orderNumber,
      customerId,
      status: "Pending",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return { action: "redirect", buildId: newId };
  }

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
  const navigate = useNavigate();
  const actionData = useActionData<any>();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearchChange = useCallback((value: string) => setSearchQuery(value), []);
  const isSearching = navigation.state === "submitting" && navigation.formData?.get("intent") === "searchOrder";

  useEffect(() => {
    if (actionData?.action === "redirect" && actionData?.buildId) {
      navigate(`/app/builds/${actionData.buildId}`);
    }
  }, [actionData, navigate]);

  const handleStatusChange = (buildId: string, newStatus: string) => {
    submit({ buildId, status: newStatus }, { method: "POST" });
  };

  const columns = ["Pending", "Assembly", "Testing", "QA Passed", "Ready for Shipping"];

  return (
    <Page title="PC Build Workflow Tracker">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">Manual Order Lookup</Text>
              <RemixForm method="post">
                <input type="hidden" name="intent" value="searchOrder" />
                <InlineStack gap="400" blockAlign="end">
                  <div style={{ flexGrow: 1, maxWidth: '400px' }}>
                    <input type="hidden" name="searchQuery" value={searchQuery} />
                    <TextField label="Order Number" value={searchQuery} onChange={handleSearchChange} autoComplete="off" placeholder="e.g. 1006" />
                  </div>
                  <Button submit loading={isSearching} variant="primary">Search</Button>
                </InlineStack>
              </RemixForm>

              {actionData?.action === "found" && (
                <Banner tone="success" title={`Order #${actionData.order.name} found! (Not in workflow)`}>
                  <RemixForm method="post">
                    <input type="hidden" name="intent" value="startWorkflow" />
                    <input type="hidden" name="orderId" value={actionData.order.id} />
                    <input type="hidden" name="orderNumber" value={actionData.order.name} />
                    <input type="hidden" name="customerId" value={actionData.order.customerId} />
                    <Button submit variant="primary">Start Workflow for Order #{actionData.order.name}</Button>
                  </RemixForm>
                </Banner>
              )}

              {actionData?.action === "not_found" && (
                <Banner tone="critical" title="Order not found">
                  Could not find a Shopify order matching "{actionData.query}".
                </Banner>
              )}
              {actionData?.action === "error" && (
                <Banner tone="critical" title="An error occurred">
                  {actionData.message}
                </Banner>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'nowrap',
            justifyContent: 'flex-start',
            gap: '16px', 
            overflowX: 'auto', 
            paddingBottom: '16px', 
            alignItems: 'flex-start',
            width: '100%',
            WebkitOverflowScrolling: 'touch'
          }}>
            {columns.map((column) => (
              <div key={column} style={{ 
                flex: '0 0 auto', 
                minWidth: '280px',
                maxWidth: '320px', 
                width: '85vw',
                backgroundColor: '#f4f6f8', 
                padding: '16px', 
                borderRadius: '12px' 
              }}>
                <Text as="h3" variant="headingMd">
                  {column}
                </Text>
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {builds
                    .filter((b) => b.status === column)
                    .map((build) => (
                      <Card key={build.id}>
                        <BlockStack gap="300">
                          <Text as="p" variant="bodyMd" fontWeight="bold">
                            Build #{build.id.slice(-4)} {build.orderNumber ? `(Order #${build.orderNumber})` : ''}
                          </Text>
                          <Badge tone={column === 'Ready for Shipping' ? 'success' : 'info'}>
                            {build.status}
                          </Badge>
                          <ButtonGroup>
                            <Button 
                              onClick={() => navigate(`/app/builds/${build.id}`)}
                            >
                              Manage
                            </Button>
                            {columns.indexOf(column) < columns.length - 1 && (
                              <Button 
                                variant="primary" 
                                onClick={() => handleStatusChange(build.id, columns[columns.indexOf(column) + 1])}
                              >
                                Next
                              </Button>
                            )}
                          </ButtonGroup>
                        </BlockStack>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
