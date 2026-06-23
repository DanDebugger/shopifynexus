import { db } from "../app/db.server";
import { productsTable, salesDataTable } from "../app/drizzle/schema.server";
import { calculateRankings } from "../app/services/rankingService.server";

async function main() {
  console.log("Seeding dummy products with ZERO sales...");
  
  // Create 3 dummy products
  const newProducts = await db.insert(productsTable).values([
    { title: "Nexus Pro Gamer PC", shopifyProductId: "gid://shopify/Product/111", category: "Prebuilt", price: "1299.99", imageUrl: "https://placehold.co/100x100" },
    { title: "RGB Cooling Fan Pack", shopifyProductId: "gid://shopify/Product/333", category: "Accessories", price: "49.99", imageUrl: "https://placehold.co/100x100" },
    { title: "Mechanical Keyboard", shopifyProductId: "gid://shopify/Product/444", category: "Peripherals", price: "129.99", imageUrl: "https://placehold.co/100x100" }
  ]);

  const allProducts = await db.select().from(productsTable);

  // Add ZERO sales data for each so they appear unranked
  for (const product of allProducts) {
    await db.insert(salesDataTable).values({
      productId: product.id,
      unitsSold: 0,
      revenue: "0.00",
      views: 0,
      rankScore: "0"
    });
  }

  console.log("Calculating initial rankings...");
  await calculateRankings();
  
  console.log("Seeding complete!");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
