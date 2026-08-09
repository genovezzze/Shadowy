"use server";

import { z } from "zod";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { hashPassword, requireUser } from "@/lib/auth";
import { isReservedSuperAdminEmail, RESERVED_EMAIL_MESSAGE } from "@/lib/superadmin";
import { sendInviteEmail } from "@/lib/email";
import { getSiteUrl } from "@/lib/site-url";

const schema = z.object({
  name: z.string().min(2, "Vārds ir pārāk īss.").max(80),
  email: z.string().email("Lūdzu, ievadiet derīgu e-pastu."),
  title: z.string().max(80).optional().nullable(),
});

export async function createEmployee(formData: FormData) {
  const session = await requireUser(["MANAGER", "ADMIN"]);

  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    title: formData.get("title") || null,
  });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0].message };
  }

  const email = parsed.data.email.toLowerCase().trim();
  if (isReservedSuperAdminEmail(email)) {
    return { ok: false as const, error: RESERVED_EMAIL_MESSAGE };
  }
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
      role: "EMPLOYEE",
      title: parsed.data.title || null,
      managerId: session.userId,
      inviteToken,
      inviteTokenExpiresAt,
    },
  });

  const appUrl = getSiteUrl();
  const inviteUrl = `${appUrl}/accept-invite?token=${inviteToken}`;
  try {
    await sendInviteEmail(email, parsed.data.name, "EMPLOYEE", inviteUrl);
  } catch {
    // Email failed - user still created
  }

  revalidatePath("/manager/employees");
  revalidatePath("/manager/dashboard");
  return { ok: true as const };
}

const updateSchema = z.object({
  name: z.string().min(2, "Vārds ir pārāk īss.").max(80),
  email: z.string().email("Lūdzu, ievadiet derīgu e-pastu."),
  title: z.string().max(80).optional().nullable(),
  password: z.string().min(8, "Parolei jābūt vismaz 8 simbolus garai.").optional().or(z.literal("")),
});

export async function updateEmployee(employeeId: string, formData: FormData) {
  const session = await requireUser(["MANAGER", "ADMIN"]);

  const parsed = updateSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    title: formData.get("title") || null,
    password: formData.get("password") || "",
  });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0].message };
  }

  const employee = await prisma.user.findFirst({
    where: { id: employeeId, organizationId: session.organizationId, managerId: session.userId, role: "EMPLOYEE" },
  });
  if (!employee) return { ok: false as const, error: "Darbinieks nav atrasts." };

  const email = parsed.data.email.toLowerCase().trim();
  if (isReservedSuperAdminEmail(email)) {
    return { ok: false as const, error: RESERVED_EMAIL_MESSAGE };
  }
  const conflict = await prisma.user.findFirst({ where: { email, NOT: { id: employeeId } } });
  if (conflict) return { ok: false as const, error: "Šāds e-pasts jau tiek izmantots." };

  const data: Record<string, unknown> = {
    name: parsed.data.name,
    email,
    title: parsed.data.title || null,
  };
  if (parsed.data.password) {
    data.passwordHash = await hashPassword(parsed.data.password);
    // An administrative password change must also cut off sessions that were
    // issued with the old password.
    data.sessionsValidFrom = new Date();
  }

  await prisma.user.update({ where: { id: employeeId }, data });

  revalidatePath("/manager/employees");
  return { ok: true as const };
}

export async function deleteEmployee(employeeId: string) {
  const session = await requireUser(["MANAGER", "ADMIN"]);

  const employee = await prisma.user.findFirst({
    where: { id: employeeId, organizationId: session.organizationId, managerId: session.userId, role: "EMPLOYEE" },
  });
  if (!employee) return { ok: false as const, error: "Darbinieks nav atrasts." };

  await prisma.user.delete({ where: { id: employeeId } });

  revalidatePath("/manager/employees");
  revalidatePath("/manager/dashboard");
  return { ok: true as const };
}
