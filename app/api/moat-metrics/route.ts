import { NextRequest } from "next/server";
import { requireSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { fail, ok } from "@/lib/http";
import { moatMetricSchema } from "@/lib/validations/schemas";

export async function GET(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return fail("Unauthorized", 401);
  }

  const metrics = await prisma.moatMetric.findMany({
    where: {
      userId: session.sub,
    },
    include: {
      venture: { select: { id: true, name: true } },
    },
    orderBy: { date: "desc" },
    take: 120,
  });

  return ok(metrics);
}

export async function POST(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return fail("Unauthorized", 401);
  }

  const parsed = moatMetricSchema.safeParse(await request.json());
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid payload", 400);
  }

  const venture = await prisma.venture.findFirst({ where: { id: parsed.data.ventureId, userId: session.sub } });
  if (!venture) {
    return fail("Venture not found", 404);
  }

  const moatMetric = await prisma.moatMetric.create({
    data: {
      ...parsed.data,
      userId: session.sub,
    },
  });

  return ok(moatMetric, { status: 201 });
}
