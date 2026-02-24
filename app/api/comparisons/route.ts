import { NextRequest } from "next/server";
import { requireSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { fail, ok } from "@/lib/http";
import { comparisonSchema } from "@/lib/validations/schemas";

export async function GET(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return fail("Unauthorized", 401);
  }

  const comparisons = await prisma.comparison.findMany({
    where: { userId: session.sub },
    orderBy: { updatedAt: "desc" },
  });

  return ok(comparisons);
}

export async function POST(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return fail("Unauthorized", 401);
  }

  const parsed = comparisonSchema.safeParse(await request.json());
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid payload", 400);
  }

  const ideas = await prisma.idea.findMany({
    where: {
      userId: session.sub,
      id: {
        in: parsed.data.ideaIds,
      },
    },
    include: {
      evaluation: true,
      experiments: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      venture: {
        include: {
          capitalAllocations: true,
          moatMetrics: {
            orderBy: { date: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  if (ideas.length < 2) {
    return fail("At least two valid ideas are required", 400);
  }

  const matrix = ideas.map((idea) => {
    const latestExperiment = idea.experiments[0];
    const latestAllocation = idea.venture?.capitalAllocations[0];
    const latestMoat = idea.venture?.moatMetrics[0];

    return {
      ideaId: idea.id,
      title: idea.title,
      ice: idea.evaluation?.iceScore ?? 0,
      validationStrength: latestExperiment?.validationStrengthScore ?? 0,
      capitalRequired: latestAllocation?.capitalRequired ?? 0,
      speedToScale: idea.speedTo100CrYears,
      revenuePotential: idea.som,
      moatStrength:
        latestMoat
          ? Number(
              (
                (latestMoat.customerLockInScore + latestMoat.networkEffectsGrowth + latestMoat.switchingCostIndex) /
                3
              ).toFixed(2),
            )
          : 0,
      strategicFit: idea.strategicFitScore,
    };
  });

  const comparison = await prisma.comparison.create({
    data: {
      userId: session.sub,
      name: parsed.data.name,
      ideaIds: parsed.data.ideaIds,
      metrics: matrix,
    },
  });

  return ok({ comparison, matrix }, { status: 201 });
}
