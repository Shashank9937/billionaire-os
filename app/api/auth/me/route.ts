import { NextRequest } from "next/server";
import { requireSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { fail, ok } from "@/lib/http";

export async function GET(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return fail("Unauthorized", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
    },
  });

  return ok(user);
}
