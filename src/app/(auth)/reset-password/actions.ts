"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { consumePasswordResetToken } from "@/lib/password-reset";

const schema = z
  .object({
    token: z.string().min(1),
    newPassword: z
      .string()
      .min(8, "Jaunajai parolei jābūt vismaz 8 simbolus garai.")
      .max(200),
    confirmPassword: z.string().min(1, "Lūdzu, atkārtojiet jauno paroli."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Paroles nesakrīt.",
    path: ["confirmPassword"],
  });

export async function resetPassword(token: string, formData: FormData) {
  const parsed = schema.safeParse({
    token,
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0].message };
  }

  const consumed = await consumePasswordResetToken(parsed.data.token);
  if (!consumed) {
    return {
      ok: false as const,
      error: "Saite ir nederīga vai tās derīguma termiņš ir beidzies.",
    };
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({
    where: { id: consumed.userId },
    data: { passwordHash },
  });

  return { ok: true as const };
}
