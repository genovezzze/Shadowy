import "server-only";
import { prisma } from "@/lib/db";
import type { sendWeeklyAdminReport, sendWeeklyManagerReport } from "@/lib/email";
import {
  categoryLabel,
  groupByCategory,
  groupByCategoryWithTitles,
  groupByClient,
  groupByRoleAndEmployee,
  weekCountTrend,
  weekTrend,
} from "@/lib/work-insights";

const DEFAULT_HOURLY_RATE_EUR = 20;

/** Everything the admin weekly report needs except who it is addressed to. */
export type AdminWeeklyReport = Omit<
  Parameters<typeof sendWeeklyAdminReport>[0],
  "to" | "adminName"
>;

/** Everything the manager weekly report needs except who it is addressed to. */
export type ManagerWeeklyReport = Omit<
  Parameters<typeof sendWeeklyManagerReport>[0],
  "to" | "managerName"
>;

/**
 * The reported week is the entries approved in the last 7 days, but the
 * entries page filters on workDate - so the links use the span of work dates
 * actually covered. That way every entry behind a number is inside the range
 * the link opens (it can only ever show more, never fewer).
 */
export function workDateRange(entries: { workDate: Date }[]): { from?: string; to?: string } {
  if (entries.length === 0) return {};
  let min = entries[0].workDate;
  let max = entries[0].workDate;
  for (const e of entries) {
    if (e.workDate < min) min = e.workDate;
    if (e.workDate > max) max = e.workDate;
  }
  return { from: min.toISOString().slice(0, 10), to: max.toISOString().slice(0, 10) };
}

/** App-relative link to the entries page with the given filters applied. */
export function entriesLink(
  base: string,
  range: { from?: string; to?: string },
  filters: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...filters, ...range })) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/**
 * Builds one manager's team week. Shared by the weekly cron and by
 * manual/preview sends, so what a single recipient gets is always the same
 * figures the scheduled email would carry.
 */
export async function buildManagerWeeklyReport(
  managerId: string,
  opts: { now?: Date } = {},
): Promise<ManagerWeeklyReport | null> {
  const now = opts.now ?? new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000);

  const manager = await prisma.user.findUnique({
    where: { id: managerId },
    select: {
      organizationId: true,
      organization: { select: { name: true, defaultHourlyRate: true } },
    },
  });
  if (!manager) return null;
  const { organizationId } = manager;

  const [pendingCount, teamEmployees, weekApproved, prevWeekApproved, weekActiveEmployeeIds, clients] =
    await Promise.all([
      prisma.invisibleWorkEntry.count({
        where: { organizationId, managerId, status: "PENDING" },
      }),
      prisma.user.findMany({
        where: { organizationId, managerId, role: "EMPLOYEE" },
        select: { id: true, name: true },
      }),
      prisma.invisibleWorkEntry.findMany({
        where: { organizationId, managerId, status: "APPROVED", updatedAt: { gte: weekAgo } },
        select: {
          title: true,
          durationMinutes: true,
          category: true,
          workDate: true,
          clientId: true,
          clientName: true,
          client: { select: { name: true } },
          employeeId: true,
          employee: { select: { name: true, workRole: { select: { name: true } } } },
        },
      }),
      prisma.invisibleWorkEntry.findMany({
        where: {
          organizationId,
          managerId,
          status: "APPROVED",
          updatedAt: { gte: twoWeeksAgo, lt: weekAgo },
        },
        select: { durationMinutes: true },
      }),
      prisma.invisibleWorkEntry.findMany({
        where: { organizationId, managerId, deletedAt: null, workDate: { gte: weekAgo } },
        select: { employeeId: true },
        distinct: ["employeeId"],
      }),
      prisma.client.findMany({
        where: { organizationId },
        select: { id: true, name: true, aliases: { select: { normalized: true } } },
      }),
    ]);

  const activeIds = new Set(weekActiveEmployeeIds.map((e) => e.employeeId));
  const inactiveEmployeeNames = teamEmployees.filter((e) => !activeIds.has(e.id)).map((e) => e.name);

  const weekMinutes = weekApproved.reduce((s, e) => s + e.durationMinutes, 0);
  const prevWeekMinutes = prevWeekApproved.reduce((s, e) => s + e.durationMinutes, 0);

  const rateEur = manager.organization.defaultHourlyRate
    ? Number(manager.organization.defaultHourlyRate)
    : DEFAULT_HOURLY_RATE_EUR;
  const costEur = Math.round((weekMinutes / 60) * rateEur);

  const clientEntries = weekApproved.map((e) => ({
    clientId: e.clientId,
    clientName: e.client?.name ?? e.clientName,
    durationMinutes: e.durationMinutes,
  }));
  const employeeEntries = weekApproved.map((e) => ({
    employeeId: e.employeeId,
    employeeName: e.employee.name,
    roleName: e.employee.workRole?.name ?? null,
    durationMinutes: e.durationMinutes,
  }));

  const range = workDateRange(weekApproved);
  const link = (filters: Record<string, string | undefined>) =>
    entriesLink("/manager/entries", range, filters);

  return {
    orgName: manager.organization.name,
    pendingCount,
    weekEntries: weekApproved.length,
    weekMinutes,
    teamSize: teamEmployees.length,
    entriesTrend: weekCountTrend(weekApproved.length, prevWeekApproved.length),
    hoursTrend: weekTrend(weekMinutes, prevWeekMinutes),
    costEur,
    rateEur,
    employeeBreakdown: groupByRoleAndEmployee(employeeEntries).map((g) => ({
      roleName: g.roleName,
      count: g.count,
      minutes: g.minutes,
      href: link({ employee: g.employeeIds.join(",") }),
      members: g.members.map((e) => ({
        name: e.name,
        count: e.count,
        minutes: e.minutes,
        href: link({ employee: e.employeeId }),
      })),
    })),
    categoryBreakdown: groupByCategoryWithTitles(weekApproved).map((c) => ({
      label: categoryLabel(c.category),
      count: c.count,
      minutes: c.minutes,
      topTitles: c.topTitles,
      href: link({ category: c.category }),
    })),
    clientBreakdown: groupByClient(clientEntries, clients).map((c) => ({
      name: c.name,
      minutes: c.minutes,
      href: link({ client: c.filterValue }),
    })),
    inactiveEmployeeNames,
    entriesHref: link({}),
  };
}

/**
 * Builds one organisation's week for the admin report. Shared by the weekly
 * cron and by manual/preview sends, so what a single recipient gets is always
 * the same figures the scheduled email would carry.
 */
export async function buildAdminWeeklyReport(
  organizationId: string,
  opts: { now?: Date } = {},
): Promise<AdminWeeklyReport | null> {
  const now = opts.now ?? new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000);

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { name: true, defaultHourlyRate: true },
  });
  if (!org) return null;

  const [pendingByManager, employees, weekApproved, prevWeekApproved, weekActiveEmployeeIds, clients] =
    await Promise.all([
      prisma.invisibleWorkEntry.groupBy({
        by: ["managerId"],
        where: { organizationId, status: "PENDING", deletedAt: null },
        _count: { _all: true },
      }),
      prisma.user.findMany({
        where: { organizationId, role: "EMPLOYEE" },
        select: { id: true, name: true },
      }),
      prisma.invisibleWorkEntry.findMany({
        where: {
          organizationId,
          status: "APPROVED",
          deletedAt: null,
          updatedAt: { gte: weekAgo },
        },
        select: {
          title: true,
          durationMinutes: true,
          category: true,
          workDate: true,
          clientId: true,
          clientName: true,
          client: { select: { name: true } },
          employeeId: true,
          employee: { select: { name: true, workRole: { select: { name: true } } } },
          managerId: true,
          manager: { select: { name: true } },
        },
      }),
      prisma.invisibleWorkEntry.findMany({
        where: {
          organizationId,
          status: "APPROVED",
          deletedAt: null,
          updatedAt: { gte: twoWeeksAgo, lt: weekAgo },
        },
        select: { durationMinutes: true },
      }),
      prisma.invisibleWorkEntry.findMany({
        where: { organizationId, deletedAt: null, workDate: { gte: weekAgo } },
        select: { employeeId: true },
        distinct: ["employeeId"],
      }),
      // Needed so free-typed shorthands fold into the client they alias
      // instead of showing up as a second line in the breakdown.
      prisma.client.findMany({
        where: { organizationId },
        select: { id: true, name: true, aliases: { select: { normalized: true } } },
      }),
    ]);

  const pendingByManagerId = new Map(
    pendingByManager.map((row) => [row.managerId ?? "", row._count._all]),
  );
  const pendingCount = pendingByManager.reduce((sum, row) => sum + row._count._all, 0);

  const activeIds = new Set(weekActiveEmployeeIds.map((e) => e.employeeId));
  const inactiveEmployeeNames = employees.filter((e) => !activeIds.has(e.id)).map((e) => e.name);

  const weekMinutes = weekApproved.reduce((s, e) => s + e.durationMinutes, 0);
  const prevWeekMinutes = prevWeekApproved.reduce((s, e) => s + e.durationMinutes, 0);

  const rateEur = org.defaultHourlyRate ? Number(org.defaultHourlyRate) : DEFAULT_HOURLY_RATE_EUR;
  const costEur = Math.round((weekMinutes / 60) * rateEur);

  const managerTotals = new Map<string, { name: string; count: number; minutes: number }>();
  for (const entry of weekApproved) {
    const key = entry.managerId ?? "";
    const current = managerTotals.get(key)
      ?? { name: entry.manager?.name ?? "Nav piešķirts vadītājs", count: 0, minutes: 0 };
    current.count += 1;
    current.minutes += entry.durationMinutes;
    managerTotals.set(key, current);
  }
  // Managers with nothing approved this week still matter when entries are
  // piling up unreviewed, so they are added from the pending side.
  for (const [managerId, pending] of pendingByManagerId) {
    if (pending > 0 && !managerTotals.has(managerId)) {
      managerTotals.set(managerId, { name: "", count: 0, minutes: 0 });
    }
  }
  const managerIdsWithoutName = [...managerTotals.entries()]
    .filter(([, value]) => !value.name)
    .map(([id]) => id)
    .filter(Boolean);
  if (managerIdsWithoutName.length > 0) {
    const names = await prisma.user.findMany({
      where: { id: { in: managerIdsWithoutName } },
      select: { id: true, name: true },
    });
    for (const manager of names) {
      const row = managerTotals.get(manager.id);
      if (row) row.name = manager.name;
    }
  }

  const range = workDateRange(weekApproved);
  const link = (filters: Record<string, string | undefined>) =>
    entriesLink("/admin/entries", range, filters);

  // The entries page has no "manager" filter, so a manager row links to the
  // people from that team who logged something this week.
  const employeeIdsByManager = new Map<string, Set<string>>();
  for (const entry of weekApproved) {
    const key = entry.managerId ?? "";
    const ids = employeeIdsByManager.get(key) ?? new Set<string>();
    ids.add(entry.employeeId);
    employeeIdsByManager.set(key, ids);
  }

  const managerBreakdown = [...managerTotals.entries()]
    .map(([managerId, value]) => {
      const employeeIds = [...(employeeIdsByManager.get(managerId) ?? [])];
      return {
        name: value.name || "Nav piešķirts vadītājs",
        count: value.count,
        minutes: value.minutes,
        pending: pendingByManagerId.get(managerId) ?? 0,
        href: employeeIds.length > 0 ? link({ employee: employeeIds.join(",") }) : undefined,
      };
    })
    .sort((a, b) => b.minutes - a.minutes || b.pending - a.pending);

  const clientEntries = weekApproved.map((e) => ({
    clientId: e.clientId,
    clientName: e.client?.name ?? e.clientName,
    durationMinutes: e.durationMinutes,
  }));
  const employeeEntries = weekApproved.map((e) => ({
    employeeId: e.employeeId,
    employeeName: e.employee.name,
    roleName: e.employee.workRole?.name ?? null,
    durationMinutes: e.durationMinutes,
  }));

  return {
    orgName: org.name,
    pendingCount,
    weekEntries: weekApproved.length,
    weekMinutes,
    employeeCount: employees.length,
    activeEmployeeCount: employees.filter((e) => activeIds.has(e.id)).length,
    entriesTrend: weekCountTrend(weekApproved.length, prevWeekApproved.length),
    hoursTrend: weekTrend(weekMinutes, prevWeekMinutes),
    costEur,
    rateEur,
    managerBreakdown,
    employeeBreakdown: groupByRoleAndEmployee(employeeEntries).map((g) => ({
      roleName: g.roleName,
      count: g.count,
      minutes: g.minutes,
      href: link({ employee: g.employeeIds.join(",") }),
      members: g.members.map((e) => ({
        name: e.name,
        count: e.count,
        minutes: e.minutes,
        href: link({ employee: e.employeeId }),
      })),
    })),
    categoryBreakdown: groupByCategory(weekApproved).map((c) => ({
      label: categoryLabel(c.category),
      count: c.count,
      minutes: c.minutes,
      href: link({ category: c.category }),
    })),
    clientBreakdown: groupByClient(clientEntries, clients).map((c) => ({
      name: c.name,
      minutes: c.minutes,
      href: link({ client: c.filterValue }),
    })),
    inactiveEmployeeNames,
    entriesHref: link({}),
  };
}
