import { NextRequest } from "next/server";
import { requireSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { fail, ok } from "@/lib/http";
import { ideaSchema } from "@/lib/validations/schemas";

export async function GET(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return fail("Unauthorized", 401);
  }

  const ideas = await prisma.idea.findMany({
    where: { userId: session.sub },
    include: {
      evaluation: true,
      experiments: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return ok(ideas);
}

export async function POST(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return fail("Unauthorized", 401);
  }

  const parsed = ideaSchema.safeParse(await request.json());
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid payload", 400);
  }

  const idea = await prisma.idea.create({
    data: {
      ...parsed.data,
      userId: session.sub,
    },
  });

  return ok(idea, { status: 201 });
}
