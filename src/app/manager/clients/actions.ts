"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const clientSchema = z.object({
  name: z.string().trim().min(1).max(120),
  freeMinutesPerMonth: z.number().int().min(0).nullable(),
});

export async function upsertClient(input: {
  id?: string;
  name: string;
  freeMinutesPerMonth: number | null;
}) {
  const session = await requireUser(["MANAGER", "ADMIN"]);
  const parsed = clientSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Pārbaudi ievadītos datus." };

  const { name, freeMinutesPerMonth } = parsed.data;

  if (input.id) {
    const exists = await prisma.client.findFirst({
      where: { id: input.id, organizationId: session.organizationId },
    });
    if (!exists) return { ok: false as const, error: "Klients nav atrasts." };

    await prisma.client.update({
      where: { id: input.id },
      data: { name, freeMinutesPerMonth },
    });
  } else {
    const duplicate = await prisma.client.findFirst({
      where: { organizationId: session.organizationId, name },
    });
    if (duplicate) return { ok: false as const, error: "Klients ar šādu nosaukumu jau pastāv." };

    await prisma.client.create({
      data: { organizationId: session.organizationId, name, freeMinutesPerMonth },
    });
  }

  revalidatePath("/manager/clients");
  revalidatePath("/manager/dashboard");
  return { ok: true as const };
}

export async function toggleClientStatus(id: string) {
  const session = await requireUser(["MANAGER", "ADMIN"]);
  const client = await prisma.client.findFirst({
    where: { id, organizationId: session.organizationId },
  });
  if (!client) return { ok: false as const, error: "Klients nav atrasts." };

  await prisma.client.update({
    where: { id },
    data: { status: client.status === "active" ? "inactive" : "active" },
  });

  revalidatePath("/manager/clients");
  return { ok: true as const };
}

export async function setClientEmployees(clientId: string, employeeIds: string[]) {
  const session = await requireUser(["MANAGER", "ADMIN"]);

  const client = await prisma.client.findFirst({
    where: { id: clientId, organizationId: session.organizationId },
  });
  if (!client) return { ok: false as const, error: "Klients nav atrasts." };

  // Verify all employees belong to this org
  const employees = await prisma.user.findMany({
    where: { id: { in: employeeIds }, organizationId: session.organizationId, role: "EMPLOYEE" },
    select: { id: true },
  });
  const validIds = new Set(employees.map((e) => e.id));
  const safeIds = employeeIds.filter((id) => validIds.has(id));

  await prisma.$transaction([
    prisma.clientEmployee.deleteMany({ where: { clientId } }),
    ...(safeIds.length > 0
      ? [prisma.clientEmployee.createMany({
          data: safeIds.map((employeeId) => ({ clientId, employeeId })),
        })]
      : []),
  ]);

  revalidatePath("/manager/clients");
  revalidatePath("/admin/clients");
  return { ok: true as const };
}

export async function deleteClient(id: string) {
  const session = await requireUser(["MANAGER", "ADMIN"]);
  const exists = await prisma.client.findFirst({
    where: { id, organizationId: session.organizationId },
  });
  if (!exists) return { ok: false as const, error: "Klients nav atrasts." };

  await prisma.client.delete({ where: { id } });
  revalidatePath("/manager/clients");
  revalidatePath("/manager/dashboard");
  return { ok: true as const };
}
