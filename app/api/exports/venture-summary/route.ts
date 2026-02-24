import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { fail } from "@/lib/http";

export async function GET(request: NextRequest) {
  const session = await requirePermission(request, "exportData");
  if (session === "UNAUTHORIZED") {
    return fail("Unauthorized", 401);
  }

  if (session === "FORBIDDEN") {
    return fail("Forbidden", 403);
  }

  const ventureId = request.nextUrl.searchParams.get("ventureId");
  const venture = await prisma.venture.findFirst({
    where: {
      userId: session.sub,
      ...(ventureId ? { id: ventureId } : {}),
    },
    include: {
      idea: true,
      financialModels: true,
      milestones: { orderBy: { dueDate: "asc" } },
      kpis: { orderBy: { weekStart: "desc" }, take: 8 },
      experiments: { orderBy: { createdAt: "desc" }, take: 6 },
      capitalAllocations: true,
    },
    orderBy: { priorityRank: "asc" },
  });

  if (!venture) {
    return fail("Venture not found", 404);
  }

  const latestAllocation = venture.capitalAllocations[0];

  const markdown = [
    `# Venture Summary: ${venture.name}`,
    "",
    `- Stage: ${venture.stage}`,
    `- Current ARR: INR ${venture.currentArr.toLocaleString("en-IN")}`,
    `- Monthly Burn: INR ${venture.monthlyBurn.toLocaleString("en-IN")}`,
    `- Runway: ${venture.runwayMonths} months`,
    `- Execution Score: ${venture.executionScore}/100`,
    "",
    "## 90-Day Battle Plan",
    venture.ninetyDayBattlePlan,
    "",
    "## Weekly Sprint Planner",
    venture.weeklySprintPlanner,
    "",
    "## Bottlenecks",
    venture.bottleneckTracker,
    "",
    "## Risks",
    venture.riskLog,
    "",
    "## Capital",
    latestAllocation
      ? `Required: INR ${latestAllocation.capitalRequired.toLocaleString("en-IN")} | Deployed: INR ${latestAllocation.capitalDeployed.toLocaleString("en-IN")}`
      : "No allocation data",
    "",
    "## Upcoming Milestones",
    ...venture.milestones.map((milestone) => `- ${milestone.title} (${milestone.status}) due ${milestone.dueDate.toISOString().slice(0, 10)}`),
    "",
    "## Latest KPI Trends",
    ...venture.kpis.map((kpi) => `- ${kpi.weekStart.toISOString().slice(0, 10)} | MRR INR ${kpi.mrr.toLocaleString("en-IN")} | CAC INR ${kpi.cac.toLocaleString("en-IN")}`),
  ].join("\n");

  return new Response(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${venture.name.toLowerCase().replace(/\s+/g, "-")}-summary.md"`,
      "Cache-Control": "no-store",
    },
  });
}
