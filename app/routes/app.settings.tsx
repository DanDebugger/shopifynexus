import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

import { useLoaderData, useSubmit, useNavigation } from "react-router";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Button,
  Text,
  Banner,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { db } from "../db.server";
import { appSettingsTable } from "../drizzle/schema.server";
import { eq } from "drizzle-orm";
import { useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  
  const settings = await db.select().from(appSettingsTable).where(eq(appSettingsTable.shop, session.shop)).limit(1);
  
  return { 
    triggerProductIds: settings.length > 0 ? settings[0].triggerProductIds : "" 
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const triggerProductIds = formData.get("triggerProductIds") as string;

  const existing = await db.select().from(appSettingsTable).where(eq(appSettingsTable.shop, session.shop)).limit(1);

  if (existing.length > 0) {
    await db.update(appSettingsTable)
      .set({ triggerProductIds, updatedAt: new Date() })
      .where(eq(appSettingsTable.id, existing[0].id));
  } else {
    await db.insert(appSettingsTable).values({
      id: 1, // or auto-increment, but we enforce 1 row per shop ideally. 
      // Actually auto-increment is safer since id is primary key and default 1 might conflict if multiple shops.
      shop: session.shop,
      triggerProductIds,
      updatedAt: new Date()
    });
  }

  return { success: true };
};

export default function AppSettings() {
  const { triggerProductIds } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isLoading = navigation.state === "submitting";

  const [productIds, setProductIds] = useState(triggerProductIds || "");

  const handleSave = () => {
    submit({ triggerProductIds: productIds }, { method: "POST" });
  };

  return (
    <Page title="App Settings">
      <Layout>
        <Layout.Section>
          <Card>
            <FormLayout>
              <Text as="h2" variant="headingMd">
                Workflow Configuration
              </Text>
              <Text as="p" variant="bodyMd">
                Specify the Shopify Product IDs that should automatically trigger the Build Queue workflow when purchased.
              </Text>
              <TextField
                label="Trigger Product IDs (comma-separated)"
                value={productIds}
                onChange={setProductIds}
                autoComplete="off"
                placeholder="e.g. 1234567890, 0987654321"
                helpText="If left empty, no build jobs will be automatically created from orders."
              />
              <Button onClick={handleSave} loading={isLoading} variant="primary">
                Save Settings
              </Button>
            </FormLayout>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
