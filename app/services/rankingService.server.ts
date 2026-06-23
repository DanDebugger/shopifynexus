import { db } from "../db.server";
import { salesDataTable, activityLogsTable } from "../drizzle/schema.server";
import { eq } from "drizzle-orm";

export async function calculateRankings() {
  const allSales = await db.select().from(salesDataTable);
  
  const scoredProducts = allSales.map(item => {
    const units = item.unitsSold ?? 0;
    const revenue = parseFloat(item.revenue ?? "0");
    const views = item.views ?? 0;
    
    // Score = (units_sold × 0.5) + (revenue × 0.3) + (views × 0.2)
    const rawScore = (units * 0.5) + (revenue * 0.3) + (views * 0.2);
    
    return {
      ...item,
      rawScore
    };
  });

  // Sort descending by rawScore
  scoredProducts.sort((a, b) => b.rawScore - a.rawScore);

  // Update positions and scores in DB
  let currentRank = 1;
  for (const product of scoredProducts) {
    await db.update(salesDataTable)
      .set({ 
        rankScore: product.rawScore.toFixed(2),
        rankPosition: currentRank,
        updatedAt: new Date()
      })
      .where(eq(salesDataTable.id, product.id));
    
    currentRank++;
  }

  return scoredProducts;
}

export function getTierForRank(rankPosition: number | null) {
  if (!rankPosition) return "⚠️ Needs Promo";
  if (rankPosition >= 1 && rankPosition <= 3) return "🥇 Top Performer";
  if (rankPosition >= 4 && rankPosition <= 6) return "🥈 Strong";
  if (rankPosition >= 7 && rankPosition <= 10) return "🥉 Average";
  return "⚠️ Needs Promo";
}

export async function logActivity(action: string, productId?: number, details?: string) {
  await db.insert(activityLogsTable).values({
    action,
    productId,
    details,
    createdAt: new Date()
  });
}
