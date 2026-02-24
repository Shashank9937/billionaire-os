import { NextRequest } from "next/server";
import { breakEvenMonth, buildRevenueProjection } from "@/lib/calculations";
import { requireSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { fail, ok } from "@/lib/http";
import { financialModelSchema } from "@/lib/validations/schemas";

export async function GET(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return fail("Unauthorized", 401);
  }

  const models = await prisma.financialModel.findMany({
    where: {
      venture: {
        userId: session.sub,
      },
    },
    include: {
      venture: {
        select: { id: true, name: true, monthlyBurn: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return ok(models);
}

export async function POST(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return fail("Unauthorized", 401);
  }

  const payload = financialModelSchema.safeParse(await request.json());
  if (!payload.success) {
    return fail(payload.error.issues[0]?.message ?? "Invalid payload", 400);
  }

  const venture = await prisma.venture.findFirst({
    where: { id: payload.data.ventureId, userId: session.sub },
    select: { monthlyBurn: true },
  });

  if (!venture) {
    return fail("Venture not found", 404);
  }

  const monthlyProjection = buildRevenueProjection(payload.data.currentRevenue, payload.data.monthlyGrowthRate, 36);
  const arrProgression = monthlyProjection.map((value) => Number((value * 12).toFixed(2)));
  const breakEven = breakEvenMonth(monthlyProjection, venture.monthlyBurn) ?? 36;

  const model = await prisma.financialModel.upsert({
    where: {
      ventureId_scenario: {
        ventureId: payload.data.ventureId,
        scenario: payload.data.scenario,
      },
    },
    create: {
      ...payload.data,
      breakEvenMonth: breakEven,
      projectedRevenue36: monthlyProjection,
      arrProgression,
    },
    update: {
      currentRevenue: payload.data.currentRevenue,
      monthlyGrowthRate: payload.data.monthlyGrowthRate,
      grossMargin: payload.data.grossMargin,
      cac: payload.data.cac,
      ltv: payload.data.ltv,
      churn: payload.data.churn,
      expectedIrr: payload.data.expectedIrr,
      paybackPeriodMonths: payload.data.paybackPeriodMonths,
      breakEvenMonth: breakEven,
      projectedRevenue36: monthlyProjection,
      arrProgression,
    },
  });

  return ok(model, { status: 201 });
}
