import { db } from "../db.server";
import { buildComponentTable, customerBuildTable, buildTemplateTable } from "../drizzle/schema.server";
import { eq } from "drizzle-orm";

export async function calculateBuildTierScore(customerBuildId: string) {
  // 1. Fetch the Customer Build
  const buildResult = await db.select().from(customerBuildTable).where(eq(customerBuildTable.id, customerBuildId));
  if (buildResult.length === 0) throw new Error("Build not found");
  
  const build = buildResult[0];
  
  // 2. Fetch the associated Build Template
  if (!build.templateId) return null;
  
  const templateResult = await db.select().from(buildTemplateTable).where(eq(buildTemplateTable.id, build.templateId));
  const baseScore = templateResult.length > 0 && templateResult[0].baseTierScore ? templateResult[0].baseTierScore : 0;
  
  // 3. Fetch all components for this template
  const components = await db.select().from(buildComponentTable).where(eq(buildComponentTable.templateId, build.templateId));
  
  // 4. Calculate total performance score
  const componentScore = components.reduce((acc, curr) => acc + (curr.performanceScore || 0), 0);
  const totalScore = baseScore + componentScore;
  
  // 5. Logic-based Feature: Bottleneck Detection
  let bottleneckWarning = null;
  const cpu = components.find(c => c.partType === 'CPU');
  const gpu = components.find(c => c.partType === 'GPU');
  
  if (cpu && gpu) {
      if ((gpu.performanceScore || 0) > (cpu.performanceScore || 0) + 30) {
          bottleneckWarning = "⚠️ Warning: High-end GPU paired with lower-end CPU may cause bottlenecks.";
      } else if ((cpu.performanceScore || 0) > (gpu.performanceScore || 0) + 30) {
          bottleneckWarning = "⚠️ Warning: High-end CPU paired with lower-end GPU. The GPU will limit gaming performance.";
      }
  }
  
  // 6. Tier Ranking
  const tier = totalScore > 80 ? 'S-Tier (Enthusiast)' : 
               totalScore > 60 ? 'A-Tier (High-End)' : 
               totalScore > 40 ? 'B-Tier (Mid-Range)' : 
               'C-Tier (Budget)';

  return {
    totalScore,
    baseScore,
    componentScore,
    bottleneckWarning,
    tier
  };
}
