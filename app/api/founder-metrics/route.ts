import { NextRequest } from "next/server";
import { requireSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { fail, ok } from "@/lib/http";
import { founderMetricSchema } from "@/lib/validations/schemas";

export async function GET(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return fail("Unauthorized", 401);
  }

  const metrics = await prisma.founderMetric.findMany({
    where: { userId: session.sub },
    orderBy: { date: "desc" },
    take: 90,
  });

  return ok(metrics);
}

export async function POST(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return fail("Unauthorized", 401);
  }

  const parsed = founderMetricSchema.safeParse(await request.json());
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid payload", 400);
  }

  const metric = await prisma.founderMetric.upsert({
    where: {
      userId_date: {
        userId: session.sub,
        date: parsed.data.date,
      },
    },
    create: {
      userId: session.sub,
      ...parsed.data,
    },
    update: {
      ...parsed.data,
    },
  });

  return ok(metric, { status: 201 });
}
