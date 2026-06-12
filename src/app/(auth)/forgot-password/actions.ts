"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { createPasswordResetToken } from "@/lib/password-reset";
import { sendPasswordResetEmail } from "@/lib/email";
import { getClientIp, isActionRateLimited, recordActionHit, ACTION_RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";

const RATE_LIMIT_KEY = "forgot-password";
const RATE_LIMIT_WINDOW_MINUTES = 15;
const RATE_LIMIT_MAX = 5;

const schema = z.object({
  email: z.string().email("Lūdzu, ievadiet derīgu e-pasta adresi."),
});

export async function requestPasswordReset(formData: FormData) {
  const ip = getClientIp();
  if (await isActionRateLimited(RATE_LIMIT_KEY, ip, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MINUTES)) {
    return { ok: false as const, error: ACTION_RATE_LIMIT_MESSAGE };
  }
  await recordActionHit(RATE_LIMIT_KEY, ip, RATE_LIMIT_WINDOW_MINUTES);

  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0].message };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });

  // Only send if the account exists, but always return the same response
  // so the form cannot be used to discover which e-mails are registered.
  if (user) {
    const rawToken = await createPasswordResetToken(user.id);

    const h = headers();
    const host = h.get("host");
    const proto =
      h.get("x-forwarded-proto") ??
      (process.env.NODE_ENV === "production" ? "https" : "http");
    const resetLink = `${proto}://${host}/reset-password?token=${rawToken}`;

    try {
      await sendPasswordResetEmail(user.email, resetLink);
    } catch {
      return {
        ok: false as const,
        error: "Neizdevās nosūtīt e-pastu. Lūdzu, mēģiniet vēlāk.",
      };
    }
  }

  return { ok: true as const };
}
