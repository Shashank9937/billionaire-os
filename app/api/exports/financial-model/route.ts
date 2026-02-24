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
      financialModels: true,
    },
    orderBy: { priorityRank: "asc" },
  });

  if (!venture) {
    return fail("Venture not found", 404);
  }

  const base = venture.financialModels.find((model) => model.scenario === "BASE");
  const aggressive = venture.financialModels.find((model) => model.scenario === "AGGRESSIVE");
  const conservative = venture.financialModels.find((model) => model.scenario === "CONSERVATIVE");

  if (!base && !aggressive && !conservative) {
    return fail("No financial model data found", 404);
  }

  const rows = ["Month,Base Revenue,Aggressive Revenue,Conservative Revenue,Base ARR,Aggressive ARR,Conservative ARR"];

  for (let month = 0; month < 36; month += 1) {
    const baseRevenue = ((base?.projectedRevenue36 as number[] | undefined) ?? [])[month] ?? "";
    const aggressiveRevenue = ((aggressive?.projectedRevenue36 as number[] | undefined) ?? [])[month] ?? "";
    const conservativeRevenue = ((conservative?.projectedRevenue36 as number[] | undefined) ?? [])[month] ?? "";

    const baseArr = ((base?.arrProgression as number[] | undefined) ?? [])[month] ?? "";
    const aggressiveArr = ((aggressive?.arrProgression as number[] | undefined) ?? [])[month] ?? "";
    const conservativeArr = ((conservative?.arrProgression as number[] | undefined) ?? [])[month] ?? "";

    rows.push(
      `${month + 1},${baseRevenue},${aggressiveRevenue},${conservativeRevenue},${baseArr},${aggressiveArr},${conservativeArr}`,
    );
  }

  return new Response(rows.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${venture.name.toLowerCase().replace(/\s+/g, "-")}-financial-model.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
