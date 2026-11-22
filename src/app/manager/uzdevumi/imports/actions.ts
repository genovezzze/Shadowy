"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { isTeamTasksEnabled, reconcilePeriod } from "@/lib/team-tasks-server";
import { periodOf, rigaToday } from "@/lib/team-tasks";
import { normalizeClientName } from "@/lib/client-name";

const importSchema = z.object({
  columns: z.array(z.string().trim().min(1).max(40)).min(1).max(60),
  rows: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(120),
        clientId: z.string().nullable(),
        needed: z.array(z.boolean()),
      }),
    )
    .min(1)
    .max(1000),
  responsibleUserId: z.string().nullable(),
});

export type RegistryImportInput = z.input<typeof importSchema>;

/**
 * Save an imported sheet into the registry. For every imported client the
 * sheet is the truth for the columns it contains: white = needed, grey = not.
 * Columns the sheet doesn't have are left as they were.
 */
export async function confirmRegistryImport(
  input: RegistryImportInput,
): Promise<{ ok: true; clients: number; created: number; columns: number } | { ok: false; error: string }> {
  const session = await requireUser(["MANAGER", "ADMIN"]);
  const orgId = session.organizationId;
  if (!(await isTeamTasksEnabled(orgId))) return { ok: false, error: "Modulis nav ieslēgts." };

  const parsed = importSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Nepareizi dati." };
  const { columns, rows, responsibleUserId } = parsed.data;
  if (rows.some((r) => r.needed.length !== columns.length)) return { ok: false, error: "Nepareizi dati." };

  if (responsibleUserId) {
    const user = await prisma.user.findFirst({ where: { id: responsibleUserId, organizationId: orgId }, select: { id: true } });
    if (!user) return { ok: false, error: "Darbinieks nav atrasts." };
  }

  // 1. Columns: reuse by name (case-insensitive), create the rest at the end.
  const existingTypes = await prisma.reportType.findMany({
    where: { organizationId: orgId, ownerUserId: null },
    select: { id: true, name: true, sortOrder: true },
  });
  let nextOrder = existingTypes.reduce((max, t) => Math.max(max, t.sortOrder), 0);
  const typeIds: string[] = [];
  let createdColumns = 0;
  for (const name of columns) {
    const found = existingTypes.find((t) => t.name.toLowerCase() === name.toLowerCase());
    if (found) {
      typeIds.push(found.id);
      continue;
    }
    const created = await prisma.reportType.create({
      data: { organizationId: orgId, name, sortOrder: ++nextOrder },
      select: { id: true, name: true, sortOrder: true },
    });
    existingTypes.push(created);
    typeIds.push(created.id);
    createdColumns++;
  }

  // 2. Clients: a chosen id must belong to this org; otherwise match by name or
  //    alias; otherwise create.
  const [clients, aliases] = await Promise.all([
    prisma.client.findMany({ where: { organizationId: orgId }, select: { id: true, name: true } }),
    prisma.clientAlias.findMany({ where: { organizationId: orgId }, select: { normalized: true, clientId: true } }),
  ]);
  const validIds = new Set(clients.map((c) => c.id));
  const idByKey = new Map<string, string>();
  for (const c of clients) idByKey.set(normalizeClientName(c.name), c.id);
  for (const a of aliases) if (!idByKey.has(a.normalized)) idByKey.set(a.normalized, a.clientId);

  let createdClients = 0;
  const clientIds: string[] = [];
  for (const row of rows) {
    let id = row.clientId && validIds.has(row.clientId) ? row.clientId : idByKey.get(normalizeClientName(row.name));
    if (!id) {
      const created = await prisma.client.create({
        data: { organizationId: orgId, name: row.name, status: "active" },
        select: { id: true },
      });
      id = created.id;
      idByKey.set(normalizeClientName(row.name), id);
      validIds.add(id);
      createdClients++;
    }
    clientIds.push(id);
  }

  // 3. Cells.
  const toCreate: { organizationId: string; clientId: string; reportTypeId: string }[] = [];
  const toDelete: { clientId: string; reportTypeId: string }[] = [];
  rows.forEach((row, r) => {
    row.needed.forEach((needed, c) => {
      const cell = { clientId: clientIds[r], reportTypeId: typeIds[c] };
      if (needed) toCreate.push({ organizationId: orgId, ...cell });
      else toDelete.push(cell);
    });
  });

  await prisma.$transaction([
    prisma.clientReport.createMany({ data: toCreate, skipDuplicates: true }),
    ...(toDelete.length > 0
      ? [prisma.clientReport.deleteMany({ where: { organizationId: orgId, OR: toDelete } })]
      : []),
    ...(responsibleUserId
      ? [
          prisma.client.updateMany({
            where: { organizationId: orgId, id: { in: clientIds } },
            data: { responsibleUserId },
          }),
        ]
      : []),
  ]);

  await reconcilePeriod(orgId, periodOf(rigaToday()));
  revalidatePath("/manager/uzdevumi");
  revalidatePath("/manager/uzdevumi/registrs");
  revalidatePath("/employee/uzdevumi");
  revalidatePath("/manager/clients");

  return { ok: true, clients: new Set(clientIds).size, created: createdClients, columns: createdColumns };
}
