import { NextRequest } from "next/server";
import { requireSession } from "@/lib/auth/guards";
import { getDashboardSummary } from "@/lib/dashboard";
import { fail, ok } from "@/lib/http";

export async function GET(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return fail("Unauthorized", 401);
  }

  const summary = await getDashboardSummary(session.sub);
  return ok(summary);
}
