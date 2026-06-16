"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { roleHome } from "@/lib/auth";
import {
  getClientIp,
  isLoginRateLimited,
  recordFailedLogin,
  clearLoginAttempts,
  RATE_LIMIT_MESSAGE,
} from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email("Lūdzu, ievadiet derīgu e-pasta adresi."),
  password: z.string().min(1, "Lūdzu, ievadiet paroli."),
});

export async function loginAction(formData: FormData) {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0].message };
  }

  const { email, password } = parsed.data;
  const ip = getClientIp();

  if (await isLoginRateLimited(ip, email)) {
    return { ok: false as const, error: RATE_LIMIT_MESSAGE };
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    await recordFailedLogin(ip, email);
    return { ok: false as const, error: "Nederīgs e-pasts vai parole." };
  }

  if (!user.passwordHash) {
    return { ok: false as const, error: "Lūdzu, pieņemiet uzaicinājumu no e-pasta, lai iestatītu paroli." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    await recordFailedLogin(ip, email);
    return { ok: false as const, error: "Nederīgs e-pasts vai parole." };
  }

  await clearLoginAttempts(ip, email);

  await createSession({
    userId: user.id,
    organizationId: user.organizationId,
    role: user.role,
    email: user.email,
    name: user.name,
  });

  return { ok: true as const, redirectTo: roleHome(user.role) };
}
