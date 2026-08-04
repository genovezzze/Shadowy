"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { normalizeClientName } from "@/lib/client-name";

const aliasSchema = z.object({
  clientId: z.string().min(1),
  name: z.string().trim().min(1).max(120),
});

/**
 * Registers an alternative spelling ("alias") for a client and re-links any
 * existing unlinked entries whose clientName resolves to the same normalized
 * key. Once linked (clientId set), every report/dashboard that aggregates by
 * clientId counts them under this client - collapsing the duplicate row.
 */
export async function addClientAlias(input: { clientId: string; name: string }) {
  const session = await requireUser(["MANAGER", "ADMIN"]);
  const parsed = aliasSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Pārbaudi ievadītos datus." };

  const { clientId, name } = parsed.data;
  const normalized = normalizeClientName(name);
  if (!normalized) return { ok: false as const, error: "Nosaukums nav derīgs." };

  const client = await prisma.client.findFirst({
    where: { id: clientId, organizationId: session.organizationId },
    select: { id: true, name: true },
  });
  if (!client) return { ok: false as const, error: "Klients nav atrasts." };

  // Alias equal to the client's own name is redundant.
  if (normalizeClientName(client.name) === normalized) {
    return { ok: false as const, error: "Šis jau ir klienta nosaukums." };
  }

  // Collision with another registered client's name would be ambiguous.
  const orgClients = await prisma.client.findMany({
    where: { organizationId: session.organizationId },
    select: { id: true, name: true },
  });
  const clash = orgClients.find(
    (c) => c.id !== clientId && normalizeClientName(c.name) === normalized
  );
  if (clash) {
    return {
      ok: false as const,
      error: `Šo nosaukumu jau lieto klients “${clash.name}”.`,
    };
  }

  try {
    await prisma.clientAlias.create({
      data: { organizationId: session.organizationId, clientId, name, normalized },
    });
  } catch {
    // Unique [organizationId, normalized] - alias already registered.
    return { ok: false as const, error: "Šāds nosaukuma variants jau ir reģistrēts." };
  }

  // Re-link existing unlinked entries matching this alias (normalization is in
  // JS, so filter candidates in memory before the bulk update).
  const unlinked = await prisma.invisibleWorkEntry.findMany({
    where: {
      organizationId: session.organizationId,
      clientId: null,
      clientName: { not: null },
    },
    select: { id: true, clientName: true },
  });
  const ids = unlinked
    .filter((e) => normalizeClientName(e.clientName!) === normalized)
    .map((e) => e.id);
  let linked = 0;
  if (ids.length > 0) {
    const res = await prisma.invisibleWorkEntry.updateMany({
      where: { id: { in: ids } },
      data: { clientId },
    });
    linked = res.count;
  }

  revalidatePath("/manager/clients");
  revalidatePath(`/manager/clients/${clientId}`);
  revalidatePath("/admin/report");
  revalidatePath("/manager/report");
  revalidatePath("/manager/dashboard");
  revalidatePath("/admin/dashboard");
  return { ok: true as const, linked };
}

export async function deleteClientAlias(aliasId: string) {
  const session = await requireUser(["MANAGER", "ADMIN"]);

  const alias = await prisma.clientAlias.findFirst({
    where: { id: aliasId, organizationId: session.organizationId },
    select: { id: true, clientId: true },
  });
  if (!alias) return { ok: false as const, error: "Nosaukuma variants nav atrasts." };

  await prisma.clientAlias.delete({ where: { id: alias.id } });

  revalidatePath("/manager/clients");
  revalidatePath(`/manager/clients/${alias.clientId}`);
  return { ok: true as const };
}
