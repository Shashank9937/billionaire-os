import { NextRequest } from "next/server";
import { NoteType } from "@prisma/client";
import { requireSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { fail, ok } from "@/lib/http";
import { noteSchema } from "@/lib/validations/schemas";

export async function GET(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return fail("Unauthorized", 401);
  }

  const type = request.nextUrl.searchParams.get("type");
  const safeType = type && Object.values(NoteType).includes(type as NoteType) ? (type as NoteType) : undefined;
  const notes = await prisma.note.findMany({
    where: {
      userId: session.sub,
      ...(safeType ? { type: safeType } : {}),
    },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    take: 50,
  });

  return ok(notes);
}

export async function POST(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return fail("Unauthorized", 401);
  }

  const parsed = noteSchema.safeParse(await request.json());
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid payload", 400);
  }

  const existingPriorityCount = await prisma.note.count({
    where: {
      userId: session.sub,
      type: "STRATEGIC_PRIORITY",
    },
  });

  if (parsed.data.type === "STRATEGIC_PRIORITY" && existingPriorityCount >= 3) {
    return fail("Only top 3 strategic priorities are allowed", 400);
  }

  const note = await prisma.note.create({
    data: {
      ...parsed.data,
      userId: session.sub,
    },
  });

  return ok(note, { status: 201 });
}
