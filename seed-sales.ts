import { db } from "./app/db.server";
import { productsTable, salesDataTable } from "./app/drizzle/schema.server";
import { calculateRankings } from "./app/services/rankingService.server";

async function main() {
  console.log("Seeding Sales Ranker data...");
  
  // Create 5 dummy products
  await db.insert(productsTable).values([
    { title: "Nexus Pro Gamer PC", shopifyProductId: "gid://shopify/Product/111", category: "Prebuilt", price: "1299.99", imageUrl: "https://placehold.co/100x100" },
    { title: "Nexus Streamer Elite", shopifyProductId: "gid://shopify/Product/222", category: "Prebuilt", price: "1899.99", imageUrl: "https://placehold.co/100x100" },
    { title: "RGB Cooling Fan Pack", shopifyProductId: "gid://shopify/Product/333", category: "Accessories", price: "49.99", imageUrl: "https://placehold.co/100x100" },
    { title: "Mechanical Keyboard", shopifyProductId: "gid://shopify/Product/444", category: "Peripherals", price: "129.99", imageUrl: "https://placehold.co/100x100" },
    { title: "UltraWide Monitor 34\"", shopifyProductId: "gid://shopify/Product/555", category: "Peripherals", price: "499.99", imageUrl: "https://placehold.co/100x100" }
  ]);

  const allProducts = await db.select().from(productsTable);

  // Add random sales data for each
  for (const product of allProducts) {
    const randomUnits = Math.floor(Math.random() * 50);
    const randomRevenue = (randomUnits * parseFloat(product.price || "0")).toFixed(2);
    const randomViews = randomUnits * 10 + Math.floor(Math.random() * 100);

    await db.insert(salesDataTable).values({
      productId: product.id,
      unitsSold: randomUnits,
      revenue: randomRevenue,
      views: randomViews
    });
  }

  // Calculate and update ranks
  console.log("Calculating rankings...");
  await calculateRankings();
  
  console.log("Seeding complete! Top 10 leaderboard generated.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
