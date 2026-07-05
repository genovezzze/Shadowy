"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function createRole(formData: FormData) {
  const session = await requireUser(["MANAGER", "ADMIN"]);
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  if (!name || name.length < 2) return { ok: false as const, error: "Nosaukums ir pārāk īss." };

  await prisma.workRole.create({
    data: {
      organizationId: session.organizationId,
      managerId: session.userId,
      name,
      description,
    },
  });

  revalidatePath("/manager/roles");
  return { ok: true as const };
}

export async function updateRole(roleId: string, formData: FormData) {
  const session = await requireUser(["MANAGER", "ADMIN"]);
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  if (!name || name.length < 2) return { ok: false as const, error: "Nosaukums ir pārāk īss." };

  const role = await prisma.workRole.findFirst({
    where: { id: roleId, managerId: session.userId },
  });
  if (!role) return { ok: false as const, error: "Loma nav atrasta." };

  await prisma.workRole.update({ where: { id: roleId }, data: { name, description } });
  revalidatePath("/manager/roles");
  return { ok: true as const };
}

export async function deleteRole(roleId: string) {
  const session = await requireUser(["MANAGER", "ADMIN"]);
  const role = await prisma.workRole.findFirst({
    where: { id: roleId, managerId: session.userId },
  });
  if (!role) return { ok: false as const, error: "Loma nav atrasta." };

  await prisma.workRole.delete({ where: { id: roleId } });
  revalidatePath("/manager/roles");
  return { ok: true as const };
}

export async function addDuty(roleId: string, text: string) {
  const session = await requireUser(["MANAGER", "ADMIN"]);
  const t = text.trim();
  if (!t || t.length < 2) return { ok: false as const, error: "Pienākums ir pārāk īss." };

  const role = await prisma.workRole.findFirst({
    where: { id: roleId, managerId: session.userId },
  });
  if (!role) return { ok: false as const, error: "Loma nav atrasta." };

  await prisma.workRoleDuty.create({ data: { workRoleId: roleId, text: t } });
  revalidatePath("/manager/roles");
  return { ok: true as const };
}

export async function deleteDuty(dutyId: string) {
  const session = await requireUser(["MANAGER", "ADMIN"]);
  const duty = await prisma.workRoleDuty.findFirst({
    where: { id: dutyId, workRole: { managerId: session.userId } },
  });
  if (!duty) return { ok: false as const, error: "Pienākums nav atrasts." };

  await prisma.workRoleDuty.delete({ where: { id: dutyId } });
  revalidatePath("/manager/roles");
  return { ok: true as const };
}

export async function assignRole(employeeId: string, roleId: string | null) {
  const session = await requireUser(["MANAGER", "ADMIN"]);

  const employee = await prisma.user.findFirst({
    where: { id: employeeId, managerId: session.userId, role: "EMPLOYEE" },
  });
  if (!employee) return { ok: false as const, error: "Darbinieks nav atrasts." };

  if (roleId) {
    const role = await prisma.workRole.findFirst({
      where: { id: roleId, managerId: session.userId },
    });
    if (!role) return { ok: false as const, error: "Loma nav atrasta." };
  }

  await prisma.user.update({
    where: { id: employeeId },
    data: { workRoleId: roleId },
  });

  revalidatePath("/manager/roles");
  revalidatePath("/manager/employees");
  return { ok: true as const };
}
