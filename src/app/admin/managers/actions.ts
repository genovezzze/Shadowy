"use server";

import { z } from "zod";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser, hashPassword } from "@/lib/auth";
import { sendInviteEmail } from "@/lib/email";

const schema = z.object({
  name: z.string().min(2, "Vārds ir pārāk īss.").max(80),
  email: z.string().email("Lūdzu, ievadiet derīgu e-pastu."),
  title: z.string().max(80).optional().nullable(),
});

const updateSchema = z.object({
  name: z.string().min(2, "Vārds ir pārāk īss.").max(80),
  email: z.string().email("Lūdzu, ievadiet derīgu e-pastu."),
  title: z.string().max(80).optional().nullable(),
  password: z.string().min(8, "Parolei jābūt vismaz 8 simbolus garai.").optional().or(z.literal("")),
});

export async function createManager(formData: FormData) {
  const session = await requireUser(["ADMIN"]);

  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    title: formData.get("title") || null,
  });

  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0].message };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false as const, error: "Lietotājs ar šādu e-pastu jau eksistē." };
  }

  const inviteToken = randomBytes(32).toString("hex");
  const inviteTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.user.create({
    data: {
      organizationId: session.organizationId,
      name: parsed.data.name,
      email,
      passwordHash: null,
      role: "MANAGER",
      title: parsed.data.title || null,
      inviteToken,
      inviteTokenExpiresAt,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.shadowy.lv";
  const inviteUrl = `${appUrl}/accept-invite?token=${inviteToken}`;
  try {
    await sendInviteEmail(email, parsed.data.name, "MANAGER", inviteUrl);
  } catch {
    // Email failed - user still created
  }

  revalidatePath("/admin/managers");
  revalidatePath("/admin/dashboard");
  return { ok: true as const };
}

export async function updateManager(managerId: string, formData: FormData) {
  const session = await requireUser(["ADMIN"]);

  const parsed = updateSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    title: formData.get("title") || null,
    password: formData.get("password") || "",
  });

  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0].message };
  }

  const manager = await prisma.user.findFirst({
    where: { id: managerId, organizationId: session.organizationId, role: "MANAGER" },
  });
  if (!manager) return { ok: false as const, error: "Vadītājs nav atrasts." };

  const email = parsed.data.email.toLowerCase().trim();
  const conflict = await prisma.user.findFirst({
    where: { email, organizationId: session.organizationId, NOT: { id: managerId } },
  });
  if (conflict) return { ok: false as const, error: "Šāds e-pasts jau tiek izmantots." };

  const data: Record<string, unknown> = {
    name: parsed.data.name,
    email,
    title: parsed.data.title || null,
  };
  if (parsed.data.password) {
    data.passwordHash = await hashPassword(parsed.data.password);
  }

  await prisma.user.update({ where: { id: managerId }, data });

  revalidatePath("/admin/managers");
  return { ok: true as const };
}

export async function deleteManager(managerId: string) {
  const session = await requireUser(["ADMIN"]);

  const manager = await prisma.user.findFirst({
    where: { id: managerId, organizationId: session.organizationId, role: "MANAGER" },
  });
  if (!manager) return { ok: false as const, error: "Vadītājs nav atrasts." };

  await prisma.user.delete({ where: { id: managerId } });

  revalidatePath("/admin/managers");
  revalidatePath("/admin/dashboard");
  return { ok: true as const };
}
