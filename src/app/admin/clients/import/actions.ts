"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const assignmentSchema = z.object({
  clientId: z.string().cuid().nullable(),
  clientName: z.string().optional(),
  employeeIds: z.array(z.string().cuid()),
});

const confirmSchema = z.object({
  assignments: z.array(assignmentSchema).min(1).max(1000),
});

export async function confirmImport(input: {
  assignments: { clientId: string | null; clientName?: string; employeeIds: string[] }[];
}) {
  const session = await requireUser(["ADMIN", "MANAGER"]);
  const parsed = confirmSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Nepareizi dati." };
  }

  const allEmployeeIds = [...new Set(parsed.data.assignments.flatMap((a) => a.employeeIds))];

  const validEmployees = await prisma.user.findMany({
    where: { id: { in: allEmployeeIds }, organizationId: session.organizationId, role: "EMPLOYEE" },
    select: { id: true },
  });
  const validEmployeeIds = new Set(validEmployees.map((e) => e.id));

  // Split: assignments for existing clients vs new clients that need to be created
  const existingAssignments = parsed.data.assignments.filter((a) => a.clientId != null) as {
    clientId: string;
    employeeIds: string[];
  }[];
  const newClientAssignments = parsed.data.assignments.filter(
    (a) => a.clientId == null && a.clientName
  ) as { clientName: string; employeeIds: string[] }[];

  // Verify existing client IDs belong to this org
  const existingClientIds = [...new Set(existingAssignments.map((a) => a.clientId))];
  const validClients =
    existingClientIds.length > 0
      ? await prisma.client.findMany({
          where: { id: { in: existingClientIds }, organizationId: session.organizationId },
          select: { id: true },
        })
      : [];
  const validClientIds = new Set(validClients.map((c) => c.id));

  // Create missing clients (or reuse if already exists by name)
  const createdByName = new Map<string, string>(); // lowercase name → id
  if (newClientAssignments.length > 0) {
    const names = newClientAssignments.map((a) => a.clientName);
    const alreadyExist = await prisma.client.findMany({
      where: { organizationId: session.organizationId, name: { in: names } },
      select: { id: true, name: true },
    });
    for (const c of alreadyExist) createdByName.set(c.name.toLowerCase(), c.id);

    for (const { clientName } of newClientAssignments) {
      const key = clientName.toLowerCase();
      if (!createdByName.has(key)) {
        const created = await prisma.client.create({
          data: { name: clientName, organizationId: session.organizationId, status: "active" },
          select: { id: true },
        });
        createdByName.set(key, created.id);
      }
    }
  }

  // Build assignment rows
  const rows: { clientId: string; employeeId: string }[] = [];

  for (const { clientId, employeeIds } of existingAssignments) {
    if (!validClientIds.has(clientId)) continue;
    for (const empId of employeeIds) {
      if (validEmployeeIds.has(empId)) rows.push({ clientId, employeeId: empId });
    }
  }

  for (const { clientName, employeeIds } of newClientAssignments) {
    const clientId = createdByName.get(clientName.toLowerCase());
    if (!clientId) continue;
    for (const empId of employeeIds) {
      if (validEmployeeIds.has(empId)) rows.push({ clientId, employeeId: empId });
    }
  }

  if (rows.length === 0 && createdByName.size === 0) {
    return { ok: false as const, error: "Nav derīgu sarakstu." };
  }

  if (rows.length > 0) {
    await prisma.clientEmployee.createMany({ data: rows, skipDuplicates: true });
  }

  revalidatePath("/manager/clients");
  revalidatePath("/admin/clients");
  return { ok: true as const, count: rows.length, newClients: createdByName.size };
}
