import { NextRequest } from "next/server";
import { subDays } from "date-fns";
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

  const sevenDaysAgo = subDays(new Date(), 7);

  const metrics = await prisma.founderMetric.findMany({
    where: {
      userId: session.sub,
      date: {
        gte: sevenDaysAgo,
      },
    },
    orderBy: { date: "asc" },
  });

  if (!metrics.length) {
    return fail("No weekly founder metrics available", 404);
  }

  const totalDeepWork = metrics.reduce((sum, item) => sum + item.deepWorkHours, 0);
  const totalOutreach = metrics.reduce((sum, item) => sum + item.outreachCount, 0);
  const decisions = metrics.reduce((sum, item) => sum + item.strategicDecisions, 0);
  const avgSleep = metrics.reduce((sum, item) => sum + item.sleepHours, 0) / metrics.length;

  const markdown = [
    "# Weekly Founder Performance Summary",
    "",
    `Period: ${metrics[0].date.toISOString().slice(0, 10)} to ${metrics[metrics.length - 1].date.toISOString().slice(0, 10)}`,
    "",
    "## Quantitative Summary",
    `- Deep Work Hours: ${totalDeepWork.toFixed(1)}`,
    `- Strategic Decisions: ${decisions}`,
    `- Outreach Count: ${totalOutreach}`,
    `- Average Sleep: ${avgSleep.toFixed(1)} hours`,
    "",
    "## Daily Highlights",
    ...metrics.map(
      (item) =>
        `- ${item.date.toISOString().slice(0, 10)} | Wins: ${item.wins} | Failures: ${item.failures} | Leverage: ${item.leverageGained}`,
    ),
    "",
    "## Next Week Focus",
    metrics[metrics.length - 1].nextWeekFocus,
  ].join("\n");

  return new Response(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": 'attachment; filename="weekly-performance-summary.md"',
      "Cache-Control": "no-store",
    },
  });
}
