"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { roleHome } from "@/lib/auth";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Parolei jābūt vismaz 8 simbolus garai."),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Paroles nesakrīt.",
  path: ["confirmPassword"],
});

export async function acceptInviteAction(formData: FormData) {
  const parsed = schema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0].message };
  }

  const user = await prisma.user.findFirst({
    where: {
      inviteToken: parsed.data.token,
      inviteTokenExpiresAt: { gt: new Date() },
    },
  });

  if (!user) {
    return { ok: false as const, error: "Uzaicinājums nav derīgs vai ir beidzies. Lūdzu, sazinieties ar administratoru." };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      inviteToken: null,
      inviteTokenExpiresAt: null,
    },
  });

  await createSession({
    userId: user.id,
    organizationId: user.organizationId,
    role: user.role,
    email: user.email,
    name: user.name,
  });

  return { ok: true as const, redirectTo: roleHome(user.role) };
}
