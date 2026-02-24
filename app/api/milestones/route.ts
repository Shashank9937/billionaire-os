import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { fail, ok } from "@/lib/http";
import { milestoneSchema } from "@/lib/validations/schemas";

export async function GET(request: NextRequest) {
  const session = await requirePermission(request, "manageVentures");
  if (session === "UNAUTHORIZED") {
    return fail("Unauthorized", 401);
  }

  if (session === "FORBIDDEN") {
    return fail("Forbidden", 403);
  }

  const milestones = await prisma.milestone.findMany({
    where: {
      venture: {
        userId: session.sub,
      },
    },
    include: {
      venture: { select: { id: true, name: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  return ok(milestones);
}

export async function POST(request: NextRequest) {
  const session = await requirePermission(request, "manageVentures");
  if (session === "UNAUTHORIZED") {
    return fail("Unauthorized", 401);
  }

  if (session === "FORBIDDEN") {
    return fail("Forbidden", 403);
  }

  const parsed = milestoneSchema.safeParse(await request.json());
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid payload", 400);
  }

  const venture = await prisma.venture.findFirst({ where: { id: parsed.data.ventureId, userId: session.sub } });
  if (!venture) {
    return fail("Venture not found", 404);
  }

  const milestone = await prisma.milestone.create({
    data: parsed.data,
  });

  return ok(milestone, { status: 201 });
}
