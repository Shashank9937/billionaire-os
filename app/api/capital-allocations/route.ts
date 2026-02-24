import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { fail, ok } from "@/lib/http";
import { capitalAllocationSchema } from "@/lib/validations/schemas";

export async function GET(request: NextRequest) {
  const session = await requirePermission(request, "manageCapital");
  if (session === "UNAUTHORIZED") {
    return fail("Unauthorized", 401);
  }

  if (session === "FORBIDDEN") {
    return fail("Forbidden", 403);
  }

  const allocations = await prisma.capitalAllocation.findMany({
    where: { userId: session.sub },
    include: {
      venture: { select: { id: true, name: true, stage: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return ok(allocations);
}

export async function POST(request: NextRequest) {
  const session = await requirePermission(request, "manageCapital");
  if (session === "UNAUTHORIZED") {
    return fail("Unauthorized", 401);
  }

  if (session === "FORBIDDEN") {
    return fail("Forbidden", 403);
  }

  const parsed = capitalAllocationSchema.safeParse(await request.json());
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid payload", 400);
  }

  const venture = await prisma.venture.findFirst({ where: { id: parsed.data.ventureId, userId: session.sub } });
  if (!venture) {
    return fail("Venture not found", 404);
  }

  const allocation = await prisma.capitalAllocation.create({
    data: {
      ...parsed.data,
      userId: session.sub,
    },
  });

  return ok(allocation, { status: 201 });
}
