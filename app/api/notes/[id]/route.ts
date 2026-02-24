import { NextRequest } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { fail, ok } from "@/lib/http";

const noteUpdateSchema = z.object({
  title: z.string().min(2).optional(),
  content: z.string().min(3),
  pinned: z.boolean().optional(),
});

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, { params }: Params) {
  const session = await requireSession(request);
  if (!session) {
    return fail("Unauthorized", 401);
  }

  const { id } = await params;
  const payload = await request.json();
  const parsed = noteUpdateSchema.safeParse({
    ...payload,
    pinned:
      typeof payload.pinned === "string"
        ? ["1", "true", "on", "yes"].includes(payload.pinned.toLowerCase())
        : payload.pinned,
  });

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid payload", 400);
  }

  const note = await prisma.note.findFirst({
    where: {
      id,
      userId: session.sub,
    },
  });

  if (!note) {
    return fail("Priority not found", 404);
  }

  const updated = await prisma.note.update({
    where: { id },
    data: {
      title: parsed.data.title ?? note.title,
      content: parsed.data.content,
      pinned: parsed.data.pinned ?? note.pinned,
    },
  });

  return ok(updated);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const session = await requireSession(request);
  if (!session) {
    return fail("Unauthorized", 401);
  }

  const { id } = await params;
  const note = await prisma.note.findFirst({ where: { id, userId: session.sub } });
  if (!note) {
    return fail("Priority not found", 404);
  }

  await prisma.note.delete({ where: { id } });
  return ok({ deleted: true });
}
