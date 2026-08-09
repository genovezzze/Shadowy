"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, hashPassword, verifyPassword } from "@/lib/auth";
import { createSession, destroySession } from "@/lib/session";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Lūdzu, ievadiet pašreizējo paroli."),
    newPassword: z
      .string()
      .min(8, "Jaunajai parolei jābūt vismaz 8 simbolus garai.")
      .max(200),
    confirmPassword: z.string().min(1, "Lūdzu, atkārtojiet jauno paroli."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Jaunās paroles nesakrīt.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "Jaunā parole nedrīkst sakrist ar pašreizējo.",
    path: ["newPassword"],
  });

export async function changeOwnPassword(formData: FormData) {
  const session = await requireUser();

  const parsed = schema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0].message };
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) {
    return { ok: false as const, error: "Lietotājs nav atrasts." };
  }

  if (!user.passwordHash) {
    return { ok: false as const, error: "Jūsu kontam nav paroles. Izmantojiet 'Aizmirsi paroli?' lai iestatītu." };
  }

  const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    return { ok: false as const, error: "Pašreizējā parole nav pareiza." };
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, sessionsValidFrom: new Date() },
  });

  // The caller's own cookie was issued before the cut-off too, so it has to be
  // replaced — otherwise changing a password would sign you out of your own tab.
  await createSession({
    userId: user.id,
    organizationId: user.organizationId,
    role: user.role,
    email: user.email,
    name: user.name,
  });

  return { ok: true as const };
}

/**
 * Revoke every session of the current account, including this one. Used when a
 * device is lost or a password may have leaked: the stateless tokens cannot be
 * deleted, so they are invalidated by moving the account's cut-off to now.
 */
export async function signOutEverywhere() {
  const session = await requireUser();

  await prisma.user.update({
    where: { id: session.userId },
    data: { sessionsValidFrom: new Date() },
  });

  await destroySession();
  return { ok: true as const };
}
