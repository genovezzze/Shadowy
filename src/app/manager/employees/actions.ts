"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { hashPassword, requireUser } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2, "Vārds ir pārāk īss.").max(80),
  email: z.string().email("Lūdzu, ievadiet derīgu e-pastu."),
  password: z.string().min(8, "Parolei jābūt vismaz 8 simbolus garai."),
  title: z.string().max(80).optional().nullable(),
});

export async function createEmployee(formData: FormData) {
  const session = await requireUser(["MANAGER"]);

  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
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

  const passwordHash = await hashPassword(parsed.data.password);

  await prisma.user.create({
    data: {
      organizationId: session.organizationId,
      name: parsed.data.name,
      email,
      passwordHash,
      role: "EMPLOYEE",
      title: parsed.data.title || null,
      managerId: session.userId,
    },
  });

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
  const session = await requireUser(["MANAGER"]);

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
  const conflict = await prisma.user.findFirst({ where: { email, NOT: { id: employeeId } } });
  if (conflict) return { ok: false as const, error: "Šāds e-pasts jau tiek izmantots." };

  const data: Record<string, unknown> = {
    name: parsed.data.name,
    email,
    title: parsed.data.title || null,
  };
  if (parsed.data.password) {
    data.passwordHash = await hashPassword(parsed.data.password);
  }

  await prisma.user.update({ where: { id: employeeId }, data });

  revalidatePath("/manager/employees");
  return { ok: true as const };
}

export async function deleteEmployee(employeeId: string) {
  const session = await requireUser(["MANAGER"]);

  const employee = await prisma.user.findFirst({
    where: { id: employeeId, organizationId: session.organizationId, managerId: session.userId, role: "EMPLOYEE" },
  });
  if (!employee) return { ok: false as const, error: "Darbinieks nav atrasts." };

  await prisma.user.delete({ where: { id: employeeId } });

  revalidatePath("/manager/employees");
  revalidatePath("/manager/dashboard");
  return { ok: true as const };
}
