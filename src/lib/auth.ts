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
 * Require a logged-in user. Optionally enforce role(s).
 * Always redirects to /login if missing/invalid.
 */
export async function requireUser(allowedRoles?: Role[]): Promise<SessionPayload> {
  const session = await getSession();
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
      return "/employee/dashboard";
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
