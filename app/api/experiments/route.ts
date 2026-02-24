import { NextRequest } from "next/server";
import { requireSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { fail, ok } from "@/lib/http";
import { experimentSchema } from "@/lib/validations/schemas";

export async function GET(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return fail("Unauthorized", 401);
  }

  const experiments = await prisma.experiment.findMany({
    where: { userId: session.sub },
    include: {
      idea: { select: { id: true, title: true } },
      venture: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return ok(experiments);
}

export async function POST(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return fail("Unauthorized", 401);
  }

  const parsed = experimentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid payload", 400);
  }

  const experiment = await prisma.experiment.create({
    data: {
      userId: session.sub,
      ...parsed.data,
    },
  });

  return ok(experiment, { status: 201 });
}
