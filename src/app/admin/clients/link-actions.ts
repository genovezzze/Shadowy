"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { normalizeClientName } from "@/lib/client-name";

// Link entries to existing registered clients by name match
export async function linkEntriesToClients(): Promise<{ ok: true; linked: number; skipped: number } | { ok: false; error: string }> {
  const session = await requireUser(["ADMIN"]);

  const [clients, entries] = await Promise.all([
    prisma.client.findMany({
      where: { organizationId: session.organizationId },
      select: { id: true, name: true },
    }),
    prisma.invisibleWorkEntry.findMany({
      where: {
        organizationId: session.organizationId,
        clientId: null,
        clientName: { not: null },
      },
      select: { id: true, clientName: true },
    }),
  ]);

  const clientByName = new Map(clients.map((c) => [normalizeClientName(c.name), c.id]));

  let linked = 0;
  let skipped = 0;

  for (const entry of entries) {
    const key = normalizeClientName(entry.clientName!);
    const clientId = clientByName.get(key);
    if (clientId) {
      await prisma.invisibleWorkEntry.update({
        where: { id: entry.id },
        data: { clientId },
      });
      linked++;
    } else {
      skipped++;
    }
  }

  revalidatePath("/manager/clients");
  revalidatePath("/admin/report");
  revalidatePath("/manager/report");

  return { ok: true, linked, skipped };
}

// Create registered clients from unique clientName values in entries that have no clientId match
export async function importClientsFromEntries(): Promise<{ ok: true; created: number; alreadyExist: number } | { ok: false; error: string }> {
  const session = await requireUser(["ADMIN"]);

  const [existingClients, entries] = await Promise.all([
    prisma.client.findMany({
      where: { organizationId: session.organizationId },
      select: { name: true },
    }),
    prisma.invisibleWorkEntry.findMany({
      where: {
        organizationId: session.organizationId,
        clientId: null,
        clientName: { not: null },
      },
      select: { id: true, clientName: true },
    }),
  ]);

  const existingLower = new Set(existingClients.map((c) => normalizeClientName(c.name)));

  // Collect unique names not already registered
  const toCreate = new Map<string, string>(); // lower → original name
  for (const e of entries) {
    const key = normalizeClientName(e.clientName!);
    if (!existingLower.has(key) && !toCreate.has(key)) {
      toCreate.set(key, e.clientName!.trim());
    }
  }

  let created = 0;
  const alreadyExist = entries.length - toCreate.size;

  // Create missing clients and link entries
  for (const [key, name] of toCreate.entries()) {
    const client = await prisma.client.create({
      data: { name, organizationId: session.organizationId, status: "active" },
    });
    // Link all entries with this clientName to the new client
    await prisma.invisibleWorkEntry.updateMany({
      where: {
        organizationId: session.organizationId,
        clientId: null,
        clientName: { equals: name, mode: "insensitive" },
      },
      data: { clientId: client.id },
    });
    created++;
  }

  // Also link any remaining unlinked entries that now match existing clients
  const allClients = await prisma.client.findMany({
    where: { organizationId: session.organizationId },
    select: { id: true, name: true },
  });
  const clientByName = new Map(allClients.map((c) => [normalizeClientName(c.name), c.id]));
  const remaining = await prisma.invisibleWorkEntry.findMany({
    where: { organizationId: session.organizationId, clientId: null, clientName: { not: null } },
    select: { id: true, clientName: true },
  });
  for (const e of remaining) {
    const clientId = clientByName.get(normalizeClientName(e.clientName!));
    if (clientId) {
      await prisma.invisibleWorkEntry.update({ where: { id: e.id }, data: { clientId } });
    }
  }

  revalidatePath("/manager/clients");
  revalidatePath("/admin/report");
  revalidatePath("/manager/report");

  return { ok: true, created, alreadyExist };
}

