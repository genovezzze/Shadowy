"use server";

import { z } from "zod";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser, hashPassword } from "@/lib/auth";
import { sendInviteEmail } from "@/lib/email";
import { getSiteUrl } from "@/lib/site-url";

const schema = z.object({
  name: z.string().min(2, "Vārds ir pārāk īss.").max(80),
  email: z.string().email("Lūdzu, ievadiet derīgu e-pastu."),
  title: z.string().max(80).optional().nullable(),
  managerId: z.string().optional().nullable(),
});

export async function createEmployee(formData: FormData) {
  const session = await requireUser(["ADMIN"]);

  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    title: formData.get("title") || null,
    managerId: formData.get("managerId") || null,
  });

  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0].message };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false as const, error: "Lietotājs ar šādu e-pastu jau eksistē." };
  }

  const managerId = parsed.data.managerId || session.userId;

  if (parsed.data.managerId) {
    const manager = await prisma.user.findFirst({
      where: { id: parsed.data.managerId, organizationId: session.organizationId, role: { in: ["MANAGER", "ADMIN"] } },
    });
    if (!manager) {
      return { ok: false as const, error: "Vadītājs nav atrasts." };
    }
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
      managerId,
      inviteToken,
      inviteTokenExpiresAt,
    },
  });

  const appUrl = getSiteUrl();
  const inviteUrl = `${appUrl}/accept-invite?token=${inviteToken}`;
  try {
    await sendInviteEmail(email, parsed.data.name, "EMPLOYEE", inviteUrl);
  } catch {
    // Email failed - user still created, admin can resend manually
  }

  revalidatePath("/admin/employees");
  revalidatePath("/admin/dashboard");
  return { ok: true as const };
}

const updateSchema = z.object({
  name: z.string().min(2, "Vārds ir pārāk īss.").max(80),
  email: z.string().email("Lūdzu, ievadiet derīgu e-pastu."),
  title: z.string().max(80).optional().nullable(),
  managerId: z.string().optional().nullable(),
  password: z.string().min(8, "Parolei jābūt vismaz 8 simbolus garai.").optional().or(z.literal("")),
});

export async function updateEmployee(employeeId: string, formData: FormData) {
  const session = await requireUser(["ADMIN"]);

  const parsed = updateSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    title: formData.get("title") || null,
    managerId: formData.get("managerId") || null,
    password: formData.get("password") || "",
  });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0].message };
  }

  const employee = await prisma.user.findFirst({
    where: { id: employeeId, organizationId: session.organizationId, role: "EMPLOYEE" },
  });
  if (!employee) return { ok: false as const, error: "Darbinieks nav atrasts." };

  const email = parsed.data.email.toLowerCase().trim();
  const conflict = await prisma.user.findFirst({
    where: { email, organizationId: session.organizationId, NOT: { id: employeeId } },
  });
  if (conflict) return { ok: false as const, error: "Šāds e-pasts jau tiek izmantots." };

  if (parsed.data.managerId) {
    const manager = await prisma.user.findFirst({
      where: { id: parsed.data.managerId, organizationId: session.organizationId, role: { in: ["MANAGER", "ADMIN"] } },
    });
    if (!manager) return { ok: false as const, error: "Vadītājs nav atrasts." };
  }

  const data: Record<string, unknown> = {
    name: parsed.data.name,
    email,
    title: parsed.data.title || null,
    managerId: parsed.data.managerId || session.userId,
  };
  if (parsed.data.password) {
    data.passwordHash = await hashPassword(parsed.data.password);
  }

  await prisma.user.update({ where: { id: employeeId }, data });

  revalidatePath("/admin/employees");
  return { ok: true as const };
}

export async function deleteEmployee(employeeId: string) {
  const session = await requireUser(["ADMIN"]);

  const employee = await prisma.user.findFirst({
    where: { id: employeeId, organizationId: session.organizationId, role: "EMPLOYEE" },
  });
  if (!employee) return { ok: false as const, error: "Darbinieks nav atrasts." };

  await prisma.user.delete({ where: { id: employeeId } });

  revalidatePath("/admin/employees");
  revalidatePath("/admin/dashboard");
  return { ok: true as const };
}
