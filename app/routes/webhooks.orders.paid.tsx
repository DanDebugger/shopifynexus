import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { productsTable, salesDataTable, activityLogsTable, customerBuildTable, buildHistoryLogTable, appSettingsTable } from "../drizzle/schema.server";
import { eq, sql, or } from "drizzle-orm";
import { calculateRankings } from "../services/rank-engine.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { payload, shop, topic, admin } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Extract line items from the order payload
  const lineItems = payload.line_items || [];
  
  // Fetch app settings to check trigger products
  const settings = await db.select().from(appSettingsTable).where(eq(appSettingsTable.shop, shop)).limit(1);
  const triggerProductIdsStr = settings.length > 0 ? settings[0].triggerProductIds : "";
  const triggerProducts = triggerProductIdsStr ? triggerProductIdsStr.split(",").map(id => id.trim()) : [];

  // Check if this order contains any custom builds or should trigger a build job
  const hasTriggerProduct = lineItems.some((item: any) => {
    const id = item.product_id?.toString();
    return id && triggerProducts.includes(id);
  });

  if (hasTriggerProduct && triggerProducts.length > 0) {
    const orderId = payload.id?.toString();
    const orderNumber = payload.order_number?.toString() || payload.name?.toString();
    const customerId = payload.customer?.id?.toString() || "";
    const existingBuild = await db.select().from(customerBuildTable).where(
      eq(customerBuildTable.orderId, orderId)
    ).limit(1);

    if (existingBuild.length === 0) {
      const buildId = `BLD-${orderNumber || Date.now()}`;
      
      await db.insert(customerBuildTable).values({
        id: buildId,
        shop: shop,
        orderId: orderId,
        orderNumber: orderNumber,
        customerId: customerId,
        status: 'Pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await db.insert(buildHistoryLogTable).values({
        id: `LOG-${Date.now()}`,
        buildId: buildId,
        newStatus: 'Pending',
        message: 'Build job created automatically from Shopify order.',
        timestamp: new Date()
      });
      console.log(`Created Build Job ${buildId} for Order ${orderNumber}`);
    }
  }

  for (const item of lineItems) {
    const shopifyProductId = item.product_id?.toString();
    if (!shopifyProductId) continue;

    const gidFormat = `gid://shopify/Product/${shopifyProductId}`;

    // Find the product in our database (checking both formats)
    const products = await db.select().from(productsTable).where(
      or(
        eq(productsTable.shopifyProductId, shopifyProductId),
        eq(productsTable.shopifyProductId, gidFormat)
      )
    ).limit(1);

    const targetProduct = products[0];

    if (targetProduct) {
      const quantity = item.quantity || 1;
      const price = parseFloat(item.price || "0");
      const revenue = price * quantity;

      // Check if sales data exists
      const existingSalesData = await db.select().from(salesDataTable).where(
        eq(salesDataTable.productId, targetProduct.id)
      ).limit(1);

      if (existingSalesData.length > 0) {
        await db.update(salesDataTable)
          .set({
            unitsSold: sql`${salesDataTable.unitsSold} + ${quantity}`,
            revenue: sql`${salesDataTable.revenue} + ${revenue}`,
            updatedAt: new Date()
          })
          .where(eq(salesDataTable.productId, targetProduct.id));
      } else {
        await db.insert(salesDataTable).values({
          productId: targetProduct.id,
          unitsSold: quantity,
          revenue: revenue.toString(),
        });
      }

      // Log the activity
      await db.insert(activityLogsTable).values({
        action: 'Product Purchased',
        productId: targetProduct.id,
        details: `Purchased ${quantity} unit(s) of ${targetProduct.title} for $${revenue}`,
      });
    }
  }

  // Recalculate rankings and update Shopify Metafields
  if (admin) {
    try {
      await calculateRankings(admin);
    } catch (e) {
      console.error("Failed to calculate rankings:", e);
    }
  }

  return new Response();
};
