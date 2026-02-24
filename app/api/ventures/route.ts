import { NextRequest } from "next/server";
import { requireSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { fail, ok } from "@/lib/http";
import { ventureSchema } from "@/lib/validations/schemas";

export async function GET(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return fail("Unauthorized", 401);
  }

  const ventures = await prisma.venture.findMany({
    where: { userId: session.sub },
    include: {
      idea: { select: { id: true, title: true } },
      financialModels: true,
      capitalAllocations: true,
      kpis: { orderBy: { weekStart: "desc" }, take: 4 },
      milestones: { orderBy: { dueDate: "asc" }, take: 6 },
    },
    orderBy: { priorityRank: "asc" },
  });

  return ok(ventures);
}

export async function POST(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return fail("Unauthorized", 401);
  }

  const parsed = ventureSchema.safeParse(await request.json());
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid payload", 400);
  }

  const venture = await prisma.venture.create({
    data: {
      ...parsed.data,
      userId: session.sub,
    },
  });

  return ok(venture, { status: 201 });
}
