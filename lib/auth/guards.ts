import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { getSessionFromRequest } from "@/lib/auth/session";
import { can, PermissionKey } from "@/lib/auth/permissions";
import { type AuthPayload } from "@/lib/auth/jwt";

export async function requireSession(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session?.sub) {
    return null;
  }
  return session;
}

export type PermissionResult = AuthPayload | "UNAUTHORIZED" | "FORBIDDEN";

export async function requirePermission(request: NextRequest, permission: PermissionKey) {
  const session = await getSessionFromRequest(request);
  if (!session?.sub) {
    return "UNAUTHORIZED";
  }

  if (!can(session.role as Role, permission)) {
    return "FORBIDDEN";
  }

  return session;
}
