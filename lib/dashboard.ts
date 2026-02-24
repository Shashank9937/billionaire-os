import { Scenario } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { calculateRiskIndex, requiredMonthlyGrowth } from "@/lib/calculations";

export async function getDashboardSummary(userId: string) {
  const [ventures, allocations, experiments, kpis, priorities] = await Promise.all([
    prisma.venture.findMany({ where: { userId }, orderBy: { priorityRank: "asc" }, take: 5 }),
    prisma.capitalAllocation.findMany({ where: { userId } }),
    prisma.experiment.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.kPI.findMany({
      where: {
        venture: {
          userId,
        },
      },
      orderBy: { weekStart: "asc" },
      take: 24,
    }),
    prisma.note.findMany({
      where: { userId, type: "STRATEGIC_PRIORITY" },
      orderBy: { updatedAt: "desc" },
      take: 3,
    }),
  ]);

  const targetArr = 1000000000;
  const currentArr = ventures.reduce((sum, venture) => sum + venture.currentArr, 0);
  const revenueGap = Math.max(0, targetArr - currentArr);
  const burnRate = ventures.reduce((sum, venture) => sum + venture.monthlyBurn, 0);
  const runway = ventures.length
    ? Number((ventures.reduce((sum, venture) => sum + venture.runwayMonths, 0) / ventures.length).toFixed(1))
    : 0;

  const capitalDeployed = allocations.reduce((sum, item) => sum + item.capitalDeployed, 0);
  const capitalAvailable = allocations.reduce((sum, item) => sum + item.capitalAvailable, 0);

  const validationStrength = experiments.length
    ? Number(
        (
          experiments.reduce((sum, experiment) => sum + experiment.validationStrengthScore, 0) /
          experiments.length
        ).toFixed(1),
      )
    : 0;

  const churnAvg = kpis.length ? kpis.reduce((sum, kpi) => sum + kpi.churn, 0) / kpis.length : 0;
  const riskIndex = calculateRiskIndex({
    runwayMonths: runway,
    burnRate,
    validationStrength,
    churn: churnAvg,
    concentrationRisk: ventures.length < 2 ? 0.8 : 0.45,
  });

  const monthlyGrowthRequired = requiredMonthlyGrowth(currentArr || 1, targetArr, 36);

  const topVenture = ventures[0];
  const financialModel = topVenture
    ? await prisma.financialModel.findFirst({
        where: { ventureId: topVenture.id, scenario: Scenario.BASE },
      })
    : null;

  const revenueTrajectory = financialModel
    ? (financialModel.projectedRevenue36 as number[]).map((value, index) => ({
        month: index + 1,
        projected: value,
        target: targetArr / 12 / 36 * (index + 1),
      }))
    : [];

  const growthTracking = kpis.map((kpi, index) => {
    const prev = kpis[index - 1];
    const growth = prev?.mrr ? (kpi.mrr - prev.mrr) / prev.mrr : 0;
    return {
      week: index + 1,
      growth,
      mrr: kpi.mrr,
    };
  });

  const pipelineDistribution = ventures.reduce<Record<string, number>>((acc, venture) => {
    acc[venture.stage] = (acc[venture.stage] ?? 0) + 1;
    return acc;
  }, {});

  const validationByDecision = experiments.reduce<Record<string, { total: number; success: number }>>((acc, exp) => {
    if (!acc[exp.decision]) {
      acc[exp.decision] = { total: 0, success: 0 };
    }

    acc[exp.decision].total += 1;
    if (exp.decision === "SCALE" || exp.decision === "ITERATE") {
      acc[exp.decision].success += 1;
    }

    return acc;
  }, {});

  return {
    headline: {
      targetArr,
      currentArr,
      revenueGap,
      monthlyGrowthRequired,
      runway,
      burnRate,
      capitalDeployed,
      capitalAvailable,
      riskIndex,
      executionScore: ventures.length
        ? Number((ventures.reduce((sum, venture) => sum + venture.executionScore, 0) / ventures.length).toFixed(1))
        : 0,
    },
    priorities,
    charts: {
      revenueTrajectory,
      growthTracking,
      validationSuccessRate: Object.entries(validationByDecision).map(([decision, value]) => ({
        decision,
        successRate: value.total ? value.success / value.total : 0,
      })),
      pipelineStageDistribution: Object.entries(pipelineDistribution).map(([stage, count]) => ({
        stage,
        count,
      })),
    },
  };
}
