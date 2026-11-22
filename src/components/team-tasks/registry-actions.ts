"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { isTeamTasksEnabled, reconcilePeriod } from "@/lib/team-tasks-server";
import { columnKey, periodOf, REPORT_TEMPLATES, rigaToday, type ReportTemplateId } from "@/lib/team-tasks";

type Result = { ok: true } | { ok: false; error: string };

/**
 * Two sheets share these actions:
 * - "firm": the firm-wide columns, set up by a manager or admin;
 * - "mine": an employee's own columns for the clients linked to them.
 */
export type RegistryScope = "firm" | "mine";

const DENIED = { ok: false as const, error: "Nav piekļuves." };

async function registryContext(scope: RegistryScope) {
  const session = scope === "firm" ? await requireUser(["MANAGER", "ADMIN"]) : await requireUser();
  if (!(await isTeamTasksEnabled(session.organizationId))) return null;
  return {
    session,
    orgId: session.organizationId,
    /** Owner of the columns this sheet edits: null for the firm sheet. */
    owner: scope === "firm" ? null : session.userId,
    scope,
  };
}

type Ctx = NonNullable<Awaited<ReturnType<typeof registryContext>>>;

/** Registry edits apply to the running month straight away. */
async function afterRegistryChange(orgId: string) {
  await reconcilePeriod(orgId, periodOf(rigaToday()));
  revalidatePath("/manager/uzdevumi");
  revalidatePath("/manager/uzdevumi/registrs");
  revalidatePath("/employee/uzdevumi");
  revalidatePath("/employee/uzdevumi/tabula");
}

async function userInOrg(orgId: string, userId: string | null): Promise<boolean> {
  if (!userId) return true;
  const user = await prisma.user.findFirst({ where: { id: userId, organizationId: orgId }, select: { id: true } });
  return !!user;
}

/** A column this sheet may edit. */
async function ownColumn(ctx: Ctx, reportTypeId: string) {
  return prisma.reportType.findFirst({
    where: { id: reportTypeId, organizationId: ctx.orgId, ownerUserId: ctx.owner },
    select: { id: true },
  });
}

/** A client this sheet may edit: any in the firm, or one linked to the employee. */
async function ownClient(ctx: Ctx, clientId: string) {
  return prisma.client.findFirst({
    where: {
      id: clientId,
      organizationId: ctx.orgId,
      ...(ctx.owner ? { assignments: { some: { employeeId: ctx.owner } } } : {}),
    },
    select: { id: true },
  });
}

/** Clients a freshly added column starts as "needed" for. */
async function sheetClientIds(ctx: Ctx): Promise<string[]> {
  const clients = await prisma.client.findMany({
    where: {
      organizationId: ctx.orgId,
      status: "active",
      assignments: ctx.owner ? { some: { employeeId: ctx.owner } } : { some: {} },
    },
    select: { id: true },
  });
  return clients.map((c) => c.id);
}

async function nextSortOrder(ctx: Ctx): Promise<number> {
  const last = await prisma.reportType.findFirst({
    where: { organizationId: ctx.orgId, ownerUserId: ctx.owner },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  return (last?.sortOrder ?? 0) + 1;
}

async function nameTaken(ctx: Ctx, name: string, exceptId?: string) {
  const columns = await prisma.reportType.findMany({
    where: { organizationId: ctx.orgId, ownerUserId: ctx.owner, ...(exceptId ? { id: { not: exceptId } } : {}) },
    select: { name: true },
  });
  return columns.some((c) => columnKey(c.name) === columnKey(name));
}

// ── Columns ────────────────────────────────────────────────────────────────

const reportTypeSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(40),
  dueDay: z.number().int().min(1).max(31),
  active: z.boolean(),
});

export async function saveReportType(scope: RegistryScope, input: z.input<typeof reportTypeSchema>): Promise<Result> {
  const ctx = await registryContext(scope);
  if (!ctx) return DENIED;
  const parsed = reportTypeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Pārbaudiet nosaukumu un termiņa dienu (1-31)." };
  const { id, name, dueDay, active } = parsed.data;

  if (await nameTaken(ctx, name, id)) return { ok: false, error: `Kolonna “${name}” jau ir.` };

  if (id) {
    const updated = await prisma.reportType.updateMany({
      where: { id, organizationId: ctx.orgId, ownerUserId: ctx.owner },
      data: { name, dueDay, active },
    });
    if (updated.count === 0) return { ok: false, error: "Kolonna nav atrasta." };
  } else {
    const created = await prisma.reportType.create({
      data: { organizationId: ctx.orgId, ownerUserId: ctx.owner, name, dueDay, active, sortOrder: await nextSortOrder(ctx) },
      select: { id: true },
    });
    // A new column starts white for every client of the sheet; grey out where it doesn't apply.
    const clientIds = await sheetClientIds(ctx);
    await prisma.clientReport.createMany({
      data: clientIds.map((clientId) => ({ organizationId: ctx.orgId, clientId, reportTypeId: created.id })),
      skipDuplicates: true,
    });
  }
  await afterRegistryChange(ctx.orgId);
  return { ok: true };
}

/** "Gatavā veidne": add the template's columns (VID deadlines) that are not there yet. */
export async function applyReportTemplate(
  scope: RegistryScope,
  templateId: ReportTemplateId = "basic",
): Promise<Result & { added?: number }> {
  const ctx = await registryContext(scope);
  if (!ctx) return DENIED;
  const template = REPORT_TEMPLATES[templateId];
  if (!template) return { ok: false, error: "Veidne nav atrasta." };

  const existing = await prisma.reportType.findMany({
    where: { organizationId: ctx.orgId, ownerUserId: ctx.owner },
    select: { name: true },
  });
  const have = new Set(existing.map((c) => columnKey(c.name)));
  const missing = template.columns.filter((c) => !have.has(columnKey(c.name)));

  let order = await nextSortOrder(ctx);
  const created: { id: string; frequency: string }[] = [];
  for (const column of missing) {
    const rt = await prisma.reportType.create({
      data: { organizationId: ctx.orgId, ownerUserId: ctx.owner, name: column.name, dueDay: column.dueDay, sortOrder: order++ },
      select: { id: true },
    });
    created.push({ id: rt.id, frequency: column.frequency ?? "monthly" });
  }

  const clientIds = await sheetClientIds(ctx);
  if (created.length > 0 && clientIds.length > 0) {
    await prisma.clientReport.createMany({
      data: clientIds.flatMap((clientId) =>
        created.map((c) => ({ organizationId: ctx.orgId, clientId, reportTypeId: c.id, frequency: c.frequency })),
      ),
      skipDuplicates: true,
    });
  }
  await afterRegistryChange(ctx.orgId);
  return { ok: true, added: created.length };
}

export async function moveReportType(scope: RegistryScope, id: string, direction: "up" | "down"): Promise<Result> {
  const ctx = await registryContext(scope);
  if (!ctx) return DENIED;
  const types = await prisma.reportType.findMany({
    where: { organizationId: ctx.orgId, ownerUserId: ctx.owner },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true },
  });
  const index = types.findIndex((t) => t.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= types.length) return { ok: true };
  [types[index], types[target]] = [types[target], types[index]];

  await prisma.$transaction(
    types.map((t, i) =>
      prisma.reportType.updateMany({
        where: { id: t.id, organizationId: ctx.orgId, ownerUserId: ctx.owner },
        data: { sortOrder: i + 1 },
      }),
    ),
  );
  revalidatePath("/manager/uzdevumi");
  revalidatePath("/manager/uzdevumi/registrs");
  revalidatePath("/employee/uzdevumi");
  revalidatePath("/employee/uzdevumi/tabula");
  return { ok: true };
}

// ── Cells ──────────────────────────────────────────────────────────────────

/** White cell (needed) <-> grey cell (not needed). */
export async function setClientReport(
  scope: RegistryScope,
  clientId: string,
  reportTypeId: string,
  needed: boolean,
): Promise<Result> {
  const ctx = await registryContext(scope);
  if (!ctx) return DENIED;
  if (!(await ownClient(ctx, clientId)) || !(await ownColumn(ctx, reportTypeId))) {
    return { ok: false, error: "Klients vai kolonna nav atrasta." };
  }

  if (needed) {
    await prisma.clientReport.upsert({
      where: { clientId_reportTypeId: { clientId, reportTypeId } },
      create: { organizationId: ctx.orgId, clientId, reportTypeId },
      update: {},
    });
  } else {
    await prisma.clientReport.deleteMany({ where: { organizationId: ctx.orgId, clientId, reportTypeId } });
  }
  await afterRegistryChange(ctx.orgId);
  return { ok: true };
}

/** Firm sheet only: the client's main responsible person. */
export async function setClientResponsible(clientId: string, userId: string | null): Promise<Result> {
  const ctx = await registryContext("firm");
  if (!ctx) return DENIED;
  if (!(await ownClient(ctx, clientId))) return { ok: false, error: "Klients nav atrasts." };
  if (!(await userInOrg(ctx.orgId, userId))) return { ok: false, error: "Darbinieks nav atrasts." };

  await prisma.client.update({ where: { id: clientId }, data: { responsibleUserId: userId } });
  await afterRegistryChange(ctx.orgId);
  return { ok: true };
}

const reportSettingsSchema = z.object({
  responsibleUserId: z.string().nullable(),
  frequency: z.enum(["monthly", "quarterly"]),
  dueDay: z.number().int().min(1).max(31).nullable(),
});

/** Per-report exceptions: another person (firm sheet), quarterly, another deadline day. */
export async function updateClientReport(
  scope: RegistryScope,
  clientId: string,
  reportTypeId: string,
  input: z.input<typeof reportSettingsSchema>,
): Promise<Result> {
  const ctx = await registryContext(scope);
  if (!ctx) return DENIED;
  const parsed = reportSettingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Pārbaudiet ievadītos datus." };
  if (!(await ownClient(ctx, clientId)) || !(await ownColumn(ctx, reportTypeId))) {
    return { ok: false, error: "Atskaite nav atrasta." };
  }
  // A personal column always belongs to its owner; only the firm sheet names people.
  const responsibleUserId = ctx.owner ? null : parsed.data.responsibleUserId;
  if (!(await userInOrg(ctx.orgId, responsibleUserId))) return { ok: false, error: "Darbinieks nav atrasts." };

  const updated = await prisma.clientReport.updateMany({
    where: { organizationId: ctx.orgId, clientId, reportTypeId },
    data: { ...parsed.data, responsibleUserId },
  });
  if (updated.count === 0) return { ok: false, error: "Atskaite nav atrasta." };
  await afterRegistryChange(ctx.orgId);
  return { ok: true };
}
