import "server-only";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { getSession, type SessionPayload } from "./session";
import type { Role } from "@prisma/client";

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

/**
 * Verify the session cookie AND confirm it against the database.
 *
 * The cookie is a stateless JWT, so on its own it keeps asserting whatever was
 * true at sign-in: a deleted account, an old role, or a token stolen before the
 * password was changed would all still pass. This re-reads the account and
 * rejects tokens issued before `sessionsValidFrom`, then rebuilds the session
 * from current database values.
 */
export async function getValidatedSession(): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      organizationId: true,
      role: true,
      email: true,
      name: true,
      sessionsValidFrom: true,
    },
  });
  if (!user) return null;

  if (user.sessionsValidFrom) {
    const issuedAtMs = session.iat ? session.iat * 1000 : 0;
    if (issuedAtMs < user.sessionsValidFrom.getTime()) return null;
  }

  return {
    userId: user.id,
    organizationId: user.organizationId,
    role: user.role,
    email: user.email,
    name: user.name,
  };
}

/**
 * Require a logged-in user. Optionally enforce role(s).
 * Always redirects to /login if missing/invalid.
 */
export async function requireUser(allowedRoles?: Role[]): Promise<SessionPayload> {
  const session = await getValidatedSession();
  if (!session) redirect("/login");
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    // Send the user to their own dashboard based on role
    redirect(roleHome(session.role));
  }
  return session;
}

export function roleHome(role: Role) {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "MANAGER":
      return "/manager/dashboard";
    case "EMPLOYEE":
      return "/employee/smart-log";
  }
}

/**
 * Tenant-scoped Prisma helper: enforces organizationId on every read.
 * Use these wrappers instead of raw prisma in route handlers / actions.
 */
export function tenantWhere(organizationId: string) {
  return { organizationId };
}

export async function getUserById(id: string, organizationId: string) {
  return prisma.user.findFirst({
    where: { id, organizationId },
  });
}
