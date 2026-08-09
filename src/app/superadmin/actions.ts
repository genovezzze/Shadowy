"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getValidatedSession } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/superadmin";

async function requireSuperAdmin() {
  const session = await getValidatedSession();
  if (!session || !isSuperAdmin(session.email)) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function extendTrial(orgId: string, days: number = 30) {
  await requireSuperAdmin();

  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) return { ok: false as const, error: "Organizācija nav atrasta." };

  const base =
    org.trialEndsAt && org.trialEndsAt > new Date()
      ? org.trialEndsAt
      : new Date();

  await prisma.organization.update({
    where: { id: orgId },
    data: {
      trialEndsAt: new Date(base.getTime() + days * 24 * 60 * 60 * 1000),
    },
  });

  revalidatePath("/superadmin");
  return { ok: true as const };
}

export async function setTrialExpired(orgId: string) {
  await requireSuperAdmin();

  await prisma.organization.update({
    where: { id: orgId },
    data: { trialEndsAt: new Date(Date.now() - 1000) },
  });

  revalidatePath("/superadmin");
  return { ok: true as const };
}

export async function updateOrg(orgId: string, data: { name: string; trialEndsAt: string | null }) {
  await requireSuperAdmin();

  await prisma.organization.update({
    where: { id: orgId },
    data: {
      name: data.name.trim(),
      trialEndsAt: data.trialEndsAt ? new Date(data.trialEndsAt) : null,
    },
  });

  revalidatePath("/superadmin");
  return { ok: true as const };
}

export async function deleteOrg(orgId: string) {
  await requireSuperAdmin();

  await prisma.organization.delete({ where: { id: orgId } });

  revalidatePath("/superadmin");
  return { ok: true as const };
}
