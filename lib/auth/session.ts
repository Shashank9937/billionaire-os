import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { AUTH_COOKIE, verifyAuthToken, type AuthPayload } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db/prisma";

export async function getSessionFromRequest(request: NextRequest): Promise<AuthPayload | null> {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) {
    return null;
  }
  return verifyAuthToken(token);
}

export async function getSessionFromCookies(): Promise<AuthPayload | null> {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  if (!token) {
    return null;
  }
  return verifyAuthToken(token);
}

export async function getCurrentUser() {
  const session = await getSessionFromCookies();
  if (!session?.sub) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
    },
  });
}
