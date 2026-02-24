import { NextRequest } from "next/server";
import { calculateIce, calculateViabilityIndex } from "@/lib/calculations";
import { requireSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { fail, ok } from "@/lib/http";
import { evaluationSchema } from "@/lib/validations/schemas";

export async function GET(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return fail("Unauthorized", 401);
  }

  const evaluations = await prisma.evaluation.findMany({
    where: { userId: session.sub },
    include: {
      idea: {
        select: {
          id: true,
          title: true,
          status: true,
          strategicFitScore: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return ok(evaluations);
}

export async function POST(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return fail("Unauthorized", 401);
  }

  const parsed = evaluationSchema.safeParse(await request.json());
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid payload", 400);
  }

  const ice = calculateIce(parsed.data.impact, parsed.data.confidence, parsed.data.ease);
  const viabilityIndex = calculateViabilityIndex({
    ice,
    strategicFit: parsed.data.strategicFitScore,
    validationStrength: parsed.data.validationStrength,
    moatStrength: parsed.data.moatStrength,
    capitalEfficiency: parsed.data.capitalEfficiency,
  });

  const evaluation = await prisma.evaluation.upsert({
    where: { ideaId: parsed.data.ideaId },
    create: {
      userId: session.sub,
      ideaId: parsed.data.ideaId,
      impact: parsed.data.impact,
      confidence: parsed.data.confidence,
      ease: parsed.data.ease,
      iceScore: ice,
      assumptions: parsed.data.assumptions,
      criticalAssumption: parsed.data.criticalAssumption,
      validationExperiment: parsed.data.validationExperiment,
      validationResult: parsed.data.validationResult,
      swotStrengths: parsed.data.swotStrengths,
      swotWeaknesses: parsed.data.swotWeaknesses,
      swotOpportunities: parsed.data.swotOpportunities,
      swotThreats: parsed.data.swotThreats,
      killCriteriaChecklist: parsed.data.killCriteriaChecklist,
      viabilityIndex,
    },
    update: {
      impact: parsed.data.impact,
      confidence: parsed.data.confidence,
      ease: parsed.data.ease,
      iceScore: ice,
      assumptions: parsed.data.assumptions,
      criticalAssumption: parsed.data.criticalAssumption,
      validationExperiment: parsed.data.validationExperiment,
      validationResult: parsed.data.validationResult,
      swotStrengths: parsed.data.swotStrengths,
      swotWeaknesses: parsed.data.swotWeaknesses,
      swotOpportunities: parsed.data.swotOpportunities,
      swotThreats: parsed.data.swotThreats,
      killCriteriaChecklist: parsed.data.killCriteriaChecklist,
      viabilityIndex,
    },
  });

  return ok(evaluation, { status: 201 });
}
