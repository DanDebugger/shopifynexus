import { db } from "./app/db.server";
import { buildTemplateTable, buildComponentTable, customerBuildTable } from "./app/drizzle/schema.server";

async function main() {
  console.log("Seeding database...");
  
  // 1. Create a Base Template
  const templateId = "template-pro-gamer";
  await db.insert(buildTemplateTable).values({
    id: templateId,
    name: "Nexus Pro Gamer Setup",
    description: "High-end gaming PC configuration.",
    baseTierScore: 50,
    createdAt: new Date()
  }).onDuplicateKeyUpdate({ set: { name: "Nexus Pro Gamer Setup" }});

  // 2. Add some components to the template
  await db.insert(buildComponentTable).values([
    {
      id: "comp-cpu-i9",
      templateId,
      productId: "gid://shopify/Product/111",
      partType: "CPU",
      performanceScore: 95
    },
    {
      id: "comp-gpu-4090",
      templateId,
      productId: "gid://shopify/Product/222",
      partType: "GPU",
      performanceScore: 99
    },
    {
      id: "comp-psu-850",
      templateId,
      productId: "gid://shopify/Product/333",
      partType: "Power Supply",
      performanceScore: 80
    }
  ]).onDuplicateKeyUpdate({ set: { performanceScore: 90 } });

  // 3. Create a dummy customer build
  await db.insert(customerBuildTable).values({
    id: "build-001",
    shop: "nexuslab-lyqbuhkl.myshopify.com",
    customerId: "cust-1",
    templateId,
    status: "Pending",
    totalScore: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }).onDuplicateKeyUpdate({ set: { status: "Pending" }});

  console.log("Database seeded successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error seeding:", err);
  process.exit(1);
});
