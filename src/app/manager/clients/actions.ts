"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { normalizeClientName } from "@/lib/client-name";

const clientSchema = z.object({
  name: z.string().trim().min(1).max(120),
  freeMinutesPerMonth: z.number().int().min(0).nullable(),
});

async function linkHistoricalEntries(
  organizationId: string,
  clientId: string,
  clientName: string,
) {
  const [unlinkedEntries, aliases] = await Promise.all([
    prisma.invisibleWorkEntry.findMany({
      where: {
        organizationId,
        clientId: null,
        clientName: { not: null },
        deletedAt: null,
      },
      select: { id: true, clientName: true },
    }),
    prisma.clientAlias.findMany({
      where: { organizationId, clientId },
      select: { normalized: true },
    }),
  ]);
  const acceptedNames = new Set([
    normalizeClientName(clientName),
    ...aliases.map((alias) => alias.normalized),
  ]);
  const matchingIds = unlinkedEntries
    .filter((entry) => acceptedNames.has(normalizeClientName(entry.clientName ?? "")))
    .map((entry) => entry.id);

  if (matchingIds.length === 0) return;

  await prisma.invisibleWorkEntry.updateMany({
    where: {
      id: { in: matchingIds },
      organizationId,
      clientId: null,
    },
    data: { clientId },
  });
}

type NameConflict =
  | { kind: "client"; clientName: string }
  | { kind: "alias"; aliasName: string; clientName: string };

/**
 * A name is unavailable both when another client already uses it and when it is
 * registered as some client's alternative spelling — entries matching it would
 * otherwise have two possible owners.
 */
async function findNameConflict(
  organizationId: string,
  normalized: string,
  excludeClientId?: string,
): Promise<NameConflict | null> {
  const [clients, alias] = await Promise.all([
    prisma.client.findMany({
      where: { organizationId, ...(excludeClientId ? { id: { not: excludeClientId } } : {}) },
      select: { name: true },
    }),
    prisma.clientAlias.findFirst({
      where: {
        organizationId,
        normalized,
        ...(excludeClientId ? { clientId: { not: excludeClientId } } : {}),
      },
      select: { name: true, client: { select: { name: true } } },
    }),
  ]);

  const clash = clients.find((client) => normalizeClientName(client.name) === normalized);
  if (clash) return { kind: "client", clientName: clash.name };
  if (alias) return { kind: "alias", aliasName: alias.name, clientName: alias.client.name };
  return null;
}

/** Say which record holds the name and what to do about it, not just "taken". */
function conflictMessage(conflict: NameConflict) {
  if (conflict.kind === "client") {
    return `Šo nosaukumu jau lieto klients “${conflict.clientName}”.`;
  }
  return `Šis nosaukums ir reģistrēts kā klienta “${conflict.clientName}” nosaukuma variants (“${conflict.aliasName}”). Noņemiet šo variantu klienta kartē, lai izveidotu atsevišķu klientu.`;
}

export async function upsertClient(input: {
  id?: string;
  name: string;
  freeMinutesPerMonth: number | null;
}) {
  const session = await requireUser(["MANAGER", "ADMIN"]);
  const parsed = clientSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Pārbaudi ievadītos datus." };

  const { name, freeMinutesPerMonth } = parsed.data;

  const normalizedName = normalizeClientName(name);
  if (!normalizedName) return { ok: false as const, error: "Nosaukums nav derīgs." };

  if (input.id) {
    const exists = await prisma.client.findFirst({
      where: { id: input.id, organizationId: session.organizationId },
    });
    if (!exists) return { ok: false as const, error: "Klients nav atrasts." };

    // Renaming was not checked at all, so a client could be renamed onto
    // another client's name or alias and silently make matching ambiguous.
    const conflict = await findNameConflict(session.organizationId, normalizedName, input.id);
    if (conflict) return { ok: false as const, error: conflictMessage(conflict) };

    const client = await prisma.client.update({
      where: { id: input.id },
      data: { name, freeMinutesPerMonth },
    });
    await linkHistoricalEntries(session.organizationId, client.id, client.name);
  } else {
    const conflict = await findNameConflict(session.organizationId, normalizedName);
    if (conflict) return { ok: false as const, error: conflictMessage(conflict) };

    const client = await prisma.client.create({
      data: { organizationId: session.organizationId, name, freeMinutesPerMonth },
    });
    await linkHistoricalEntries(session.organizationId, client.id, client.name);
  }

  revalidatePath("/manager/clients");
  revalidatePath("/manager/dashboard");
  revalidatePath("/manager/report");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/report");
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
