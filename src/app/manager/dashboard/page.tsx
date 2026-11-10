import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PeriodTabs } from "@/components/dashboard/period-tabs";
import { TopBarSlot } from "@/components/layout/top-bar-slot";
import { CostCalculatorWidget } from "@/components/dashboard/cost-calculator-widget";
import { HoursTrendChart } from "@/components/dashboard/hours-trend-chart";
import { TeamHeatmap } from "@/components/dashboard/team-heatmap";
import { CategoryList } from "@/components/dashboard/category-list";
import { WorkNatureCard } from "@/components/dashboard/work-nature-card";
import { groupByWorkNature, groupHelpPairs } from "@/lib/work-nature";
import { resolveWorkType } from "@/lib/work-type";
import { cn, formatDurationLV } from "@/lib/utils";
import { buildClientLookup, normalizeClientName } from "@/lib/client-name";
import { categoryLabel, normalizeCategoryKey } from "@/lib/work-insights";
import { ClientEmployeeMatrix } from "@/components/dashboard/client-employee-matrix";
import { ClientOverrunWidget } from "@/components/dashboard/client-overrun-widget";
import { EntriesBreakdownCard } from "@/components/dashboard/entries-breakdown-card";
import { buildClientMatrix } from "@/lib/client-matrix";
import { clientMonthOptions, resolveClientMonth } from "@/lib/client-month";
import { ClientMonthSelector } from "@/components/dashboard/client-month-selector";
import { EntryLeaderboard } from "@/components/dashboard/entry-leaderboard";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { EmployeeClientMatrix } from "@/components/dashboard/employee-client-matrix";
import { DeltaBadge } from "@/components/dashboard/delta-badge";
import { Activity, AlertTriangle, BarChart3, CalendarDays, Clock, FileText, Gauge, Timer, TrendingUp, Users } from "lucide-react";
import { APPLE_CARD_LABEL, APPLE_FILL, APPLE_SEPARATOR, METRIC_SURFACE, METRIC_TINTS, TILE_BADGE, TINT_FILL, TINT_TILE } from "@/components/dashboard/apple";
import { StatTile } from "@/components/dashboard/stat-tile";
import { OverviewSections, type OverviewSection } from "@/components/dashboard/overview-sections";

const HOURLY_RATE_EUR = 20;

function getPeriodStart(period: string): Date | undefined {
  const now = new Date();
  if (period === "7d") return new Date(now.getTime() - 7 * 86400000);
  if (period === "30d") return new Date(now.getTime() - 30 * 86400000);
  if (period === "90d") return new Date(now.getTime() - 90 * 86400000);
  return undefined;
}

function periodLabel(period: string) {
  if (period === "7d") return "nedēļa";
  if (period === "30d") return "mēnesis";
  if (period === "90d") return "ceturksnis";
  return "viss laiks";
}

// ISO week key "YYYY-WNN"
function weekKey(date: Date): string {
  const d = new Date(date);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - day);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const wn = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getFullYear()}-W${wn.toString().padStart(2, "0")}`;
}

type ApprovedEntry = {
  title: string;
  category: string;
  clientName: string | null;
  clientId: string | null;
  durationMinutes: number;
  workDate: Date;
  createdAt: Date;
  updatedAt: Date;
  isOutsideRole: boolean | null;
  employee: {
    id: string;
    name: string;
    workRole: { duties: { text: string }[] } | null;
  };
};

function isExtraEntry(e: ApprovedEntry): boolean {
  const duties = e.employee.workRole?.duties.map((d) => d.text) ?? [];
  return resolveWorkType(e.isOutsideRole, e.category, e.title, duties) === "extra";
}

function buildWeeklyTrendData(
  entries: ApprovedEntry[],
  period: string
): { label: string; value: number }[] {
  const now = Date.now();
  const LV_MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jūn", "Jūl", "Aug", "Sep", "Okt", "Nov", "Dec"];

  if (period === "7d") {
    const slots = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      slots.set(d.toISOString().slice(0, 10), 0);
    }
    for (const e of entries) {
      if (!isExtraEntry(e)) continue;
      const key = e.workDate.toISOString().slice(0, 10);
      if (slots.has(key)) slots.set(key, (slots.get(key) ?? 0) + e.durationMinutes);
    }
    return Array.from(slots.entries()).map(([k, v]) => ({
      label: k.slice(5).replace("-", "/"),
      value: Math.round((v / 60) * 10) / 10,
    }));
  }

  if (period === "all") {
    const slots = new Map<string, number>();
    const nowDate = new Date(now);
    for (let i = 11; i >= 0; i--) {
      const d = new Date(nowDate.getFullYear(), nowDate.getMonth() - i, 1);
      slots.set(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, 0);
    }
    for (const e of entries) {
      if (!isExtraEntry(e)) continue;
      const d = e.workDate;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (slots.has(key)) slots.set(key, (slots.get(key) ?? 0) + e.durationMinutes);
    }
    return Array.from(slots.entries()).map(([k, v]) => ({
      label: LV_MONTHS[parseInt(k.slice(5), 10) - 1],
      value: Math.round((v / 60) * 10) / 10,
    }));
  }

  // Weekly for 30d / 90d
  const weeksToShow = period === "30d" ? 5 : 13;
  const slots = new Map<number, { label: string; minutes: number }>();
  for (let i = weeksToShow - 1; i >= 0; i--) {
    const d = new Date(now - i * 7 * 86400000);
    d.setHours(0, 0, 0, 0);
    const dow = d.getDay() || 7;
    d.setDate(d.getDate() - dow + 1); // Monday
    const wn = Math.floor(d.getTime() / (7 * 86400000));
    const label = d.toLocaleDateString("lv-LV", { month: "short", day: "numeric" });
    if (!slots.has(wn)) slots.set(wn, { label, minutes: 0 });
  }
  for (const e of entries) {
    if (!isExtraEntry(e)) continue;
    const d = new Date(e.workDate);
    d.setHours(0, 0, 0, 0);
    const dow = d.getDay() || 7;
    d.setDate(d.getDate() - dow + 1);
    const wn = Math.floor(d.getTime() / (7 * 86400000));
    const slot = slots.get(wn);
    if (slot) slots.set(wn, { ...slot, minutes: slot.minutes + e.durationMinutes });
  }
  return Array.from(slots.values()).map(({ label, minutes }) => ({
    label,
    value: Math.round((minutes / 60) * 10) / 10,
  }));
}

function buildEmployeeBreakdown(entries: ApprovedEntry[]) {
  const map = new Map<string, { name: string; extraMin: number; totalMin: number }>();
  for (const e of entries) {
    const { id, name } = e.employee;
    if (!map.has(id)) map.set(id, { name, extraMin: 0, totalMin: 0 });
    const slot = map.get(id)!;
    slot.totalMin += e.durationMinutes;
    if (isExtraEntry(e)) slot.extraMin += e.durationMinutes;
  }
  return Array.from(map.entries())
    .map(([id, { name, extraMin, totalMin }]) => ({
      id,
      name,
      extraH: Math.round((extraMin / 60) * 10) / 10,
      totalH: Math.round((totalMin / 60) * 10) / 10,
    }))
    .filter((e) => e.extraH > 0)
    .sort((a, b) => b.extraH - a.extraH)
    .slice(0, 8);
}

function findInterruptionPattern(entries: ApprovedEntry[]): string | null {
  if (entries.length < 5) return null;
  const weekCats = new Map<string, Map<string, number>>();
  for (const e of entries) {
    const wk = weekKey(e.workDate);
    if (!weekCats.has(wk)) weekCats.set(wk, new Map());
    const m = weekCats.get(wk)!;
    m.set(e.category, (m.get(e.category) ?? 0) + 1);
  }
  const sortedWeeks = Array.from(weekCats.keys()).sort().slice(-4);
  if (sortedWeeks.length < 3) return null;
  const tops = sortedWeeks.map((wk) => {
    const catMap = weekCats.get(wk)!;
    return [...catMap.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
  }).filter(Boolean);
  const freq = new Map<string, number>();
  for (const cat of tops) freq.set(cat, (freq.get(cat) ?? 0) + 1);
  for (const [cat, count] of freq) {
    if (count >= 3) return cat;
  }
  return null;
}

function computeAvgApprovalDays(entries: ApprovedEntry[]): number | null {
  if (entries.length === 0) return null;
  const totalMs = entries.reduce(
    (s, e) => s + (e.updatedAt.getTime() - e.createdAt.getTime()),
    0
  );
  return Math.round((totalMs / entries.length / 86400000) * 10) / 10;
}

const LV_MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jūn", "Jūl", "Aug", "Sep", "Okt", "Nov", "Dec"];

// Entries created per calendar month over the last 12 months, same shape as
// the admin's organization activity chart.
function buildMonthlyData(entries: { createdAt: Date }[]) {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const count = entries.filter(
      (e) => e.createdAt.getFullYear() === year && e.createdAt.getMonth() === month
    ).length;
    return { label: LV_MONTH_LABELS[month], value: count };
  });
}

export default async function ManagerDashboard({
  searchParams,
}: {
  searchParams: { period?: string; clientMonth?: string };
}) {
  const session = await requireUser(["MANAGER", "ADMIN"]);
  const orgId = session.organizationId;
  const managerId = session.userId;
  const period = searchParams?.period ?? "30d";
  const periodStart = getPeriodStart(period);
  const periodFilter = periodStart ? { gte: periodStart } : undefined;
  const clientMonth = resolveClientMonth(searchParams?.clientMonth);

  const eightWeeksAgo = new Date(Date.now() - 8 * 7 * 86400000);
  const twelveMonthsAgo = new Date(Date.now() - 365 * 86400000);

  const nowDate = new Date();
  const currentMonthStart = new Date(Date.UTC(nowDate.getUTCFullYear(), nowDate.getUTCMonth(), 1));

  const [teamCount, clients, approved, teamMembers, recentHeatmapEntries, currentMonthEntries, totalTeamEntries, allTimeTeamEntries, teamEntriesLastYear, clientMatrixEntries, clientMonthHistory, entryCountsByEmployee, clientAssignmentRows] = await Promise.all([
    prisma.user.count({ where: { organizationId: orgId, managerId } }),
    prisma.client.findMany({
      where: { organizationId: orgId },
      orderBy: { name: "asc" },
      include: { aliases: { select: { normalized: true } } },
    }),
    prisma.invisibleWorkEntry.findMany({
      where: {
        organizationId: orgId,
        managerId,
        status: "APPROVED",
        deletedAt: null,
        ...(periodFilter ? { workDate: periodFilter } : {}),
      },
      select: {
        title: true,
        category: true,
        clientName: true,
        clientId: true,
        durationMinutes: true,
        workDate: true,
        createdAt: true,
        updatedAt: true,
        isOutsideRole: true,
        helpedColleague: true,
        helpedUser: { select: { name: true } },
        employee: {
          select: {
            id: true,
            name: true,
            workRole: { select: { duties: { select: { text: true } } } },
          },
        },
      },
    }),
    prisma.user.findMany({
      where: { organizationId: orgId, managerId, role: "EMPLOYEE" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.invisibleWorkEntry.findMany({
      where: { organizationId: orgId, managerId, deletedAt: null, workDate: { gte: eightWeeksAgo } },
      select: { employeeId: true, workDate: true, durationMinutes: true },
    }),
    prisma.invisibleWorkEntry.findMany({
      where: { organizationId: orgId, managerId, status: "APPROVED", deletedAt: null, workDate: { gte: currentMonthStart } },
      select: { clientId: true, clientName: true, durationMinutes: true },
    }),
    prisma.invisibleWorkEntry.count({
      where: { organizationId: orgId, managerId, deletedAt: null, ...(periodFilter ? { workDate: periodFilter } : {}) },
    }),
    prisma.invisibleWorkEntry.count({
      where: { organizationId: orgId, managerId, deletedAt: null },
    }),
    prisma.invisibleWorkEntry.findMany({
      where: { organizationId: orgId, managerId, deletedAt: null, createdAt: { gte: twelveMonthsAgo } },
      select: { createdAt: true },
    }),
    prisma.invisibleWorkEntry.findMany({
      where: {
        organizationId: orgId,
        managerId,
        status: "APPROVED",
        deletedAt: null,
        ...(clientMonth.isAll ? {} : { workDate: { gte: clientMonth.start!, lt: clientMonth.end! } }),
        OR: [{ clientId: { not: null } }, { clientName: { not: null } }],
      },
      select: {
        clientId: true,
        clientName: true,
        durationMinutes: true,
        workDate: true,
        employee: { select: { id: true, name: true } },
      },
    }),
    prisma.invisibleWorkEntry.findMany({
      where: {
        organizationId: orgId,
        managerId,
        status: "APPROVED",
        deletedAt: null,
        OR: [{ clientId: { not: null } }, { clientName: { not: null } }],
      },
      select: { workDate: true },
    }),
    prisma.invisibleWorkEntry.groupBy({
      by: ["employeeId"],
      where: { organizationId: orgId, managerId, deletedAt: null, ...(periodFilter ? { workDate: periodFilter } : {}) },
      _count: { _all: true },
    }),
    prisma.clientEmployee.findMany({
      where: { client: { organizationId: orgId }, employee: { managerId } },
      select: { clientId: true, employeeId: true, client: { select: { name: true } } },
    }),
  ]);
  const clientAssignments = clientAssignmentRows.map((a) => ({
    clientId: a.clientId,
    clientName: a.client.name,
    employeeId: a.employeeId,
  }));

  const availableClientMonths = clientMonthOptions(
    clientMonthHistory.map((entry) => entry.workDate),
    clientMonth.key,
  );

  // --- Core aggregation ---
  const clientMinById = new Map<string, number>();   // clientId → minutes
  const clientMinByName = new Map<string, number>(); // clientName.lower → minutes
  const categoryCount = new Map<string, number>();
  let totalMinutes = 0;
  let extraMinutes = 0;
  const extraByDay = new Map<string, number>();

  for (const e of approved) {
    totalMinutes += e.durationMinutes;
    if (e.clientId) {
      clientMinById.set(e.clientId, (clientMinById.get(e.clientId) ?? 0) + e.durationMinutes);
    } else if (e.clientName) {
      const key = normalizeClientName(e.clientName);
      clientMinByName.set(key, (clientMinByName.get(key) ?? 0) + e.durationMinutes);
    }
    const categoryKey = normalizeCategoryKey(e.category);
    categoryCount.set(categoryKey, (categoryCount.get(categoryKey) ?? 0) + 1);
    if (isExtraEntry(e)) {
      extraMinutes += e.durationMinutes;
      const dayKey = e.workDate.toISOString().slice(0, 10);
      extraByDay.set(dayKey, (extraByDay.get(dayKey) ?? 0) + e.durationMinutes);
    }
  }
  const extraDailyBreakdown = Array.from(extraByDay.entries()).map(([date, minutes]) => ({ date, minutes }));

  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  // Trend vs the previous, equally long window. For a fixed period we reuse its
  // length; for "all time" (no baseline) we fall back to the last 30 days vs the
  // 30 before that, so the arrow always has a clear meaning.
  const deltaDays = period === "7d" ? 7 : period === "90d" ? 90 : 30;
  const deltaLabel = `pret iepr. ${deltaDays} d.`;
  const curWindowStart = new Date(Date.now() - deltaDays * 86400000);
  const prevWindowStart = new Date(Date.now() - 2 * deltaDays * 86400000);
  const [curHoursAgg, prevHoursAgg] = await Promise.all([
    prisma.invisibleWorkEntry.aggregate({
      _sum: { durationMinutes: true },
      where: { organizationId: orgId, managerId, status: "APPROVED", deletedAt: null, workDate: { gte: curWindowStart } },
    }),
    prisma.invisibleWorkEntry.aggregate({
      _sum: { durationMinutes: true },
      where: { organizationId: orgId, managerId, status: "APPROVED", deletedAt: null, workDate: { gte: prevWindowStart, lt: curWindowStart } },
    }),
  ]);
  const curWindowHours = Math.round(((curHoursAgg._sum.durationMinutes ?? 0) / 60) * 10) / 10;
  const prevWindowHours = Math.round(((prevHoursAgg._sum.durationMinutes ?? 0) / 60) * 10) / 10;
  const extraHours = Math.round((extraMinutes / 60) * 10) / 10;

  // --- Entries breakdown (today / yesterday / week / month / etc.) ---
  const todayStart = new Date(Date.UTC(nowDate.getUTCFullYear(), nowDate.getUTCMonth(), nowDate.getUTCDate()));
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  const sevenDaysAgo = new Date(todayStart.getTime() - 7 * 86400000);
  const thirtyDaysAgo = new Date(todayStart.getTime() - 30 * 86400000);
  const ninetyDaysAgo = new Date(todayStart.getTime() - 90 * 86400000);
  const teamEntriesBreakdown = [
    { label: "Šodien", value: teamEntriesLastYear.filter((e) => e.createdAt >= todayStart).length },
    { label: "Vakar", value: teamEntriesLastYear.filter((e) => e.createdAt >= yesterdayStart && e.createdAt < todayStart).length },
    { label: "Pēdējās 7 dienas", value: teamEntriesLastYear.filter((e) => e.createdAt >= sevenDaysAgo).length },
    { label: "Pēdējās 30 dienas", value: teamEntriesLastYear.filter((e) => e.createdAt >= thirtyDaysAgo).length },
    { label: "Pēdējās 90 dienas", value: teamEntriesLastYear.filter((e) => e.createdAt >= ninetyDaysAgo).length },
    { label: "Kopā (viss laiks)", value: allTimeTeamEntries },
  ];

  // --- Team activity analytics ---
  const todayMidnightMs = Date.UTC(nowDate.getUTCFullYear(), nowDate.getUTCMonth(), nowDate.getUTCDate());
  const todayDow = (nowDate.getUTCDay() + 6) % 7;
  const thisWeekMonMs = todayMidnightMs - todayDow * 86400000;

  const weekSlots = Array.from({ length: 8 }, (_, i) => {
    const startMs = thisWeekMonMs - (7 - i) * 7 * 86400000;
    const d = new Date(startMs);
    return {
      startMs,
      endMs: startMs + 7 * 86400000,
      label: `${String(d.getUTCDate()).padStart(2, "0")}.${String(d.getUTCMonth() + 1).padStart(2, "0")}`,
    };
  });

  // Adoption rate: active this week
  const thisWeekActiveIds = new Set(
    recentHeatmapEntries
      .filter(e => e.workDate.getTime() >= weekSlots[7].startMs)
      .map(e => e.employeeId)
  );

  // Silent employees: no entries in last 14 days
  const fourteenDaysAgoMs = todayMidnightMs - 14 * 86400000;
  const activeInLast14 = new Set(
    recentHeatmapEntries.filter(e => e.workDate.getTime() >= fourteenDaysAgoMs).map(e => e.employeeId)
  );
  const silentMembers = teamMembers.filter(m => !activeInLast14.has(m.id));

  // Heatmap: per-employee per-week presence
  const empWeekSet = new Map<string, Set<number>>();
  for (const e of recentHeatmapEntries) {
    const wMs = e.workDate.getTime();
    const idx = weekSlots.findIndex(w => wMs >= w.startMs && wMs < w.endMs);
    if (idx === -1) continue;
    if (!empWeekSet.has(e.employeeId)) empWeekSet.set(e.employeeId, new Set());
    empWeekSet.get(e.employeeId)!.add(idx);
  }
  const heatmapRows = teamMembers.map(m => ({
    id: m.id,
    name: m.name,
    weeks: weekSlots.map((_, i) => empWeekSet.get(m.id)?.has(i) ?? false),
  }));

  // Workload balance: total hours per employee in selected period
  const empMinMap = new Map<string, number>();
  for (const e of approved) empMinMap.set(e.employee.id, (empMinMap.get(e.employee.id) ?? 0) + e.durationMinutes);
  const workloadRows = teamMembers
    .map(m => ({ id: m.id, name: m.name, hours: Math.round(((empMinMap.get(m.id) ?? 0) / 60) * 10) / 10 }))
    .filter(m => m.hours > 0)
    .sort((a, b) => b.hours - a.hours);
  const avgWorkload = workloadRows.length > 0 ? workloadRows.reduce((s, m) => s + m.hours, 0) / workloadRows.length : 0;
  const maxWorkload = workloadRows[0]?.hours ?? 0;

  // --- Analytics ---
  const weeklyTrendData = buildWeeklyTrendData(approved, period);
  const employeeBreakdown = buildEmployeeBreakdown(approved);
  const patternCategory = findInterruptionPattern(approved);
  const avgApprovalDays = computeAvgApprovalDays(approved);
  const maxEmpExtraH = employeeBreakdown[0]?.extraH ?? 1;

  // --- Client x Employee matrix ---
  const { rows: matrixRows, employees: matrixEmployees } = buildClientMatrix(
    clientMatrixEntries.map((e) => ({
      clientId: e.clientId,
      clientName: e.clientName,
      employeeId: e.employee.id,
      employeeName: e.employee.name,
      durationMinutes: e.durationMinutes,
      workDate: e.workDate,
    })),
    clients,
    { resetLimitMonthly: clientMonth.isAll },
  );
  const overrunClients = matrixRows.filter((r) => r.overrunMinutes > 0);
  const overrunClientCount = overrunClients.length;
  const totalOverrunEur = overrunClients.reduce(
    (s, r) => s + Math.round((r.overrunMinutes / 60) * HOURLY_RATE_EUR),
    0
  );

  // --- Client budget forecast ---
  const clientByNorm = buildClientLookup(clients);
  const monthClientById = new Map<string, number>();
  for (const e of currentMonthEntries) {
    // Free-typed shorthands resolve through the client's aliases, otherwise
    // the hours never reach the forecast for that client.
    const id = e.clientId ?? (e.clientName ? clientByNorm.get(normalizeClientName(e.clientName))?.id : undefined);
    if (!id) continue;
    monthClientById.set(id, (monthClientById.get(id) ?? 0) + e.durationMinutes);
  }
  const daysSoFar = nowDate.getUTCDate();
  const daysInMonth = new Date(Date.UTC(nowDate.getUTCFullYear(), nowDate.getUTCMonth() + 1, 0)).getUTCDate();
  const daysRemaining = daysInMonth - daysSoFar;
  type ClientForecast = { id: string; name: string; daysLeft: number; usedMin: number; freeMin: number; dailyRateH: number };
  const clientForecasts: ClientForecast[] = [];
  for (const c of clients) {
    if (c.freeMinutesPerMonth === null) continue;
    const usedMin = monthClientById.get(c.id) ?? 0;
    if (usedMin >= c.freeMinutesPerMonth || usedMin === 0 || daysSoFar === 0) continue;
    const dailyRate = usedMin / daysSoFar;
    const projectedTotal = usedMin + dailyRate * daysRemaining;
    if (projectedTotal > c.freeMinutesPerMonth) {
      const minutesLeft = c.freeMinutesPerMonth - usedMin;
      const daysLeft = Math.max(0, Math.floor(minutesLeft / dailyRate));
      const dailyRateH = Math.round((dailyRate / 60) * 10) / 10;
      clientForecasts.push({ id: c.id, name: c.name, daysLeft, usedMin, freeMin: c.freeMinutesPerMonth, dailyRateH });
    }
  }
  clientForecasts.sort((a, b) => a.daysLeft - b.daysLeft);

  // --- Entry leaderboard (who submitted the most entries) ---
  const teamNameMap = new Map(teamMembers.map((m) => [m.id, m.name]));
  const leaderboardRows = entryCountsByEmployee
    .map((g) => ({
      id: g.employeeId,
      name: teamNameMap.get(g.employeeId) ?? "Nezināms",
      count: g._count._all,
    }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);

  const workNatureRows = groupByWorkNature(approved);
  const helpPairs = groupHelpPairs(
    approved.map((e) => ({
      employeeName: e.employee.name ?? "-",
      helpedName: e.helpedUser?.name ?? null,
      durationMinutes: e.durationMinutes,
      helpedColleague: e.helpedColleague,
    }))
  );

  const topCategories = Array.from(categoryCount.entries())
    .sort((a, b) => b[1] - a[1]);

  const categoryItems = topCategories.map(([cat, count]) => {
    const pct = approved.length > 0 ? Math.round((count / approved.length) * 100) : 0;
    const titleMap = new Map<string, number>();
    for (const e of approved) {
      if (normalizeCategoryKey(e.category) === cat) titleMap.set(e.title, (titleMap.get(e.title) ?? 0) + 1);
    }
    const sorted = [...titleMap.entries()].sort((a, b) => b[1] - a[1]);
    const maxCnt = sorted[0]?.[1] ?? 1;
    return {
      name: categoryLabel(cat),
      count,
      pct,
      isPattern: cat === patternCategory,
      titles: sorted.map(([title, cnt]) => ({
        title,
        count: cnt,
        pct: Math.round((cnt / count) * 100),
        barPct: Math.round((cnt / maxCnt) * 100),
      })),
    };
  });

  const periodCaption = periodLabel(period);
  const periodBadge = period === "all" ? "Viss" : period.replace("d", " d.");

  // Blocks inside a section sit in one column with an even gap; components that
  // carry their own outer margin elsewhere get it reset here.
  const stack = "flex flex-col gap-3 [&>*]:!mb-0 [&>*]:!mt-0";

  // ── Kopsavilkums ──
  const summaryContent = (
    <div className={stack}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatTile tint="neutral" icon={<Users />} title="Darbinieki" value={teamCount} description="Komandā" />
        <StatTile
          tint="neutral"
          icon={<Clock />}
          title="Kopā stundas"
          value={`${totalHours}h`}
          description={<DeltaBadge current={curWindowHours} previous={prevWindowHours} label={deltaLabel} />}
        />
        <StatTile tint="neutral" icon={<TrendingUp />} title="Papildu darbs" value={`${extraHours}h`} description="Nereģistrēts budžetā" />
        <StatTile
          tint="neutral"
          icon={<Timer />}
          title="Izskatīšana"
          value={avgApprovalDays !== null ? `${avgApprovalDays}d` : "-"}
          description="Vidējais laiks līdz lēmumam"
        />
        <EntriesBreakdownCard
          tint="neutral"
          label="Visi ieraksti"
          value={totalTeamEntries}
          icon={<FileText />}
          breakdown={teamEntriesBreakdown}
        />
      </div>
      <CostCalculatorWidget extraMinutes={extraMinutes} dailyBreakdown={extraDailyBreakdown} apple />
    </div>
  );

  // ── Klienti ──
  const clientsContent = (
    <div className={stack}>
      <ClientMonthSelector selectedMonth={clientMonth.key} options={availableClientMonths} apple />
      <ClientOverrunWidget
        overrunCount={overrunClientCount}
        totalClients={matrixRows.length}
        totalOverrunEur={totalOverrunEur}
        monthLabel={clientMonth.label}
        detailEventName="client-employee-matrix:open"
        apple
      />
      {matrixRows.length === 0 ? (
        <div className={cn(METRIC_SURFACE, "p-5 text-center text-[13px] text-muted-foreground")}>
          {clientMonth.label}: nav apstiprinātu ierakstu ar klientu
        </div>
      ) : (
        <>
          <EmployeeClientMatrix
            rows={matrixRows}
            employees={matrixEmployees}
            monthLabel={clientMonth.label}
            assignments={clientAssignments}
            apple
          />
          <div id="client-employee-matrix" className="scroll-mt-20">
            <ClientEmployeeMatrix
              rows={matrixRows}
              employees={matrixEmployees}
              hourlyRateEur={HOURLY_RATE_EUR}
              monthLabel={clientMonth.label}
              detailEventName="client-employee-matrix:open"
              selectedMonth={clientMonth.key}
              monthOptions={availableClientMonths}
              apple
            />
          </div>
        </>
      )}
      {clientForecasts.length > 0 && (
        <div className={cn(METRIC_SURFACE, "overflow-hidden")}>
          <div className="flex items-center justify-between gap-4 px-5 pb-2 pt-5">
            <div className={cn(APPLE_CARD_LABEL, TINT_TILE.orange)}>
              <AlertTriangle />
              Budžeta brīdinājumi
            </div>
            <span className={TILE_BADGE}>{clientForecasts.length} klients/-i</span>
          </div>
          <div>
            {clientForecasts.map((f, i) => {
              const usedPct = Math.min(100, Math.round((f.usedMin / f.freeMin) * 100));
              const urgent = f.daysLeft === 0;
              return (
                <div key={f.id} className="pl-5">
                  <div className={cn("flex items-center gap-4 py-3 pr-5", i > 0 && cn("border-t", APPLE_SEPARATOR))}>
                    <div className="w-40 min-w-0 shrink-0">
                      <div className="truncate text-[14px] font-medium">{f.name}</div>
                      <div className="mt-0.5 text-[12px] text-muted-foreground">
                        {formatDurationLV(f.usedMin)} / {formatDurationLV(f.freeMin)} · {f.dailyRateH}h/d.
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={cn("h-1.5 overflow-hidden rounded-full", APPLE_FILL)}>
                        <div
                          className={cn("h-full rounded-full", urgent ? TINT_FILL.red : TINT_FILL.orange)}
                          style={{ width: `${usedPct}%` }}
                        />
                      </div>
                      <div className="mt-1 text-[12px] text-muted-foreground">{usedPct}% no mēneša limita</div>
                    </div>
                    <div className={cn("w-16 shrink-0 text-right text-[14px] font-semibold tabular-nums", urgent ? METRIC_TINTS.red : METRIC_TINTS.orange)}>
                      {urgent ? "Šodien" : `~${Math.max(1, f.daysLeft)} d.`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className={cn("border-t px-5 py-3", APPLE_SEPARATOR)}>
            <p className="text-[12px] text-muted-foreground">
              Prognoze balstīta uz šī mēneša vidējo tempu ({daysSoFar} dienas)
            </p>
          </div>
        </div>
      )}
    </div>
  );

  // ── Komanda ──
  const teamContent = teamMembers.length > 0 && (
    <div className={stack}>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className={cn(METRIC_SURFACE, "flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between")}>
          <div>
            <div className={cn(APPLE_CARD_LABEL, TINT_TILE.neutral)}>
              <Activity />
              Aktivitāte šonedēļ
            </div>
            <div className="mt-2 text-[14px] text-muted-foreground">
              <span className="font-display text-[22px] font-medium tabular-nums text-foreground">{thisWeekActiveIds.size}</span>
              {" "}/ {teamMembers.length} darbinieki
            </div>
          </div>
          <div className="flex max-w-[220px] flex-wrap items-center gap-1.5">
            {teamMembers.map((m) => (
              <div
                key={m.id}
                title={`${m.name}: ${thisWeekActiveIds.has(m.id) ? "aktīvs" : "nav ierakstu"}`}
                className={cn("h-2.5 w-2.5 rounded-full", thisWeekActiveIds.has(m.id) ? TINT_FILL.green : APPLE_FILL)}
              />
            ))}
          </div>
        </div>
        {silentMembers.length > 0 && (
          <div className={cn(METRIC_SURFACE, "p-5")}>
            <div className="flex items-center justify-between gap-4">
              <div className={cn(APPLE_CARD_LABEL, TINT_TILE.orange)}>
                <AlertTriangle />
                Nav logojuši 14+ dienas
              </div>
              <span className={TILE_BADGE}>{silentMembers.length}</span>
            </div>
            <p className="mt-3 text-[14px]">{silentMembers.map((m) => m.name).join(", ")}</p>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className={cn(METRIC_SURFACE, "p-5")}>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className={cn(APPLE_CARD_LABEL, TINT_TILE.neutral)}>
              <CalendarDays />
              Aktivitātes karte
            </div>
            <span className={TILE_BADGE}>8 nedēļas</span>
          </div>
          <TeamHeatmap rows={heatmapRows} weekLabels={weekSlots.map((w) => w.label)} apple />
        </div>

        {workloadRows.length > 0 && (
          <div className={cn(METRIC_SURFACE, "p-5")}>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className={cn(APPLE_CARD_LABEL, TINT_TILE.neutral)}>
                <Gauge />
                Darba noslodze
              </div>
              <span className={TILE_BADGE}>{periodBadge}</span>
            </div>
            <div className="space-y-3">
              {workloadRows.map((emp) => {
                const pct = maxWorkload > 0 ? Math.round((emp.hours / maxWorkload) * 100) : 0;
                const overloaded = avgWorkload > 0 && emp.hours > avgWorkload * 2 && workloadRows.length > 1;
                return (
                  <div key={emp.id} className="flex items-center gap-3">
                    <div className="w-28 shrink-0 truncate text-[14px]">{emp.name}</div>
                    <div className={cn("h-1.5 flex-1 overflow-hidden rounded-full", APPLE_FILL)}>
                      <div
                        className={cn("h-full rounded-full", overloaded ? TINT_FILL.orange : TINT_FILL.blue)}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className={cn("w-14 shrink-0 text-right text-[13px] tabular-nums", overloaded ? cn("font-semibold", METRIC_TINTS.orange) : "text-muted-foreground")}>
                      {emp.hours}h
                    </div>
                  </div>
                );
              })}
              {workloadRows.length > 1 && (
                <div className={cn("flex items-center justify-between border-t pt-3 text-[12px] text-muted-foreground", APPLE_SEPARATOR)}>
                  <span>Vidēji: {Math.round(avgWorkload * 10) / 10}h</span>
                  {maxWorkload > avgWorkload * 2 && (
                    <span className={cn("flex items-center gap-1", METRIC_TINTS.orange)}>
                      <AlertTriangle className="h-3.5 w-3.5" /> Nevienmērīga slodze
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ── Analītika ──
  const analyticsContent = approved.length > 0 && (
    <div className={stack}>
      {patternCategory && (
        <div className={cn(METRIC_SURFACE, "p-5")}>
          <div className={cn(APPLE_CARD_LABEL, TINT_TILE.orange)}>
            <AlertTriangle />
            Sistemātisks traucējums
          </div>
          <p className="mt-2 text-[14px] text-muted-foreground">
            Kategorija{" "}
            <span className="font-medium text-foreground">&ldquo;{patternCategory}&rdquo;</span>{" "}
            ir biežākā pēdējās 4 nedēļās - iespējama strukturāla problēma, ne gadījuma rakstura.
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {employeeBreakdown.length > 0 && (
          <div className={cn(METRIC_SURFACE, "p-5")}>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className={cn(APPLE_CARD_LABEL, TINT_TILE.neutral)}>
                <BarChart3 />
                Papildu darbs pa darbiniekiem
              </div>
              <span className={TILE_BADGE}>{periodBadge}</span>
            </div>
            <div className="space-y-3">
              {employeeBreakdown.map((emp) => {
                const pct = Math.round((emp.extraH / maxEmpExtraH) * 100);
                return (
                  <div key={emp.id} className="flex items-center gap-3">
                    <div className="w-28 shrink-0 truncate text-[14px]">{emp.name}</div>
                    <div className={cn("h-1.5 flex-1 overflow-hidden rounded-full", APPLE_FILL)}>
                      <div className={cn("h-full rounded-full", TINT_FILL.blue)} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="w-14 shrink-0 text-right text-[13px] tabular-nums text-muted-foreground">{emp.extraH}h</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <HoursTrendChart tint="blue" iconTint="neutral" quietLabel title="Papildu darba tendence" data={weeklyTrendData} badge={periodCaption} />
      </div>
    </div>
  );

  // ── Kategorijas ──
  const categoriesContent = categoryItems.length > 0 && (
    <div className={stack}>
      {workNatureRows.length > 0 && (
        <WorkNatureCard rows={workNatureRows} totalEntries={approved.length} helpPairs={helpPairs} apple />
      )}
      <div className={cn(METRIC_SURFACE, "p-2")}>
        <CategoryList items={categoryItems} patternCategory={patternCategory} apple />
      </div>
    </div>
  );

  const sections: OverviewSection[] = [
    {
      key: "summary",
      label: "Kopsavilkums",
      count: 6,
      keywords: "Darbinieki Kopā stundas Papildu darbs Izskatīšana Visi ieraksti Neredzamo izmaksu aprēķins",
      content: summaryContent,
    },
    {
      key: "clients",
      label: "Klienti",
      count: (overrunClientCount > 0 ? 1 : 0) + (matrixRows.length > 0 ? 2 : 1) + (clientForecasts.length > 0 ? 1 : 0),
      keywords: "Klientu mēneša limiti pārsniegums Darbinieku klienti Noslodze pa darbiniekiem Budžeta brīdinājumi",
      content: clientsContent,
    },
    ...(teamContent
      ? [{
          key: "team",
          label: "Komanda",
          count: 2 + (workloadRows.length > 0 ? 1 : 0) + (silentMembers.length > 0 ? 1 : 0),
          keywords: "Aktivitāte šonedēļ Aktivitātes karte Darba noslodze Nav logojuši",
          content: teamContent,
        }]
      : []),
    ...(analyticsContent
      ? [{
          key: "analytics",
          label: "Analītika",
          count: 1 + (employeeBreakdown.length > 0 ? 1 : 0) + (patternCategory ? 1 : 0),
          keywords: "Papildu darbs pa darbiniekiem tendence Sistemātisks traucējums",
          content: analyticsContent,
        }]
      : []),
    {
      key: "activity",
      label: "Aktivitāte",
      count: 1 + (leaderboardRows.length > 0 ? 1 : 0),
      keywords: "Komandas aktivitāte Ierakstu aktivitāte",
      content: (
        <div className={stack}>
          <ActivityChart tint="green" iconTint="neutral" quietLabel title="Komandas aktivitāte (pēdējie 12 mēneši)" data={buildMonthlyData(teamEntriesLastYear)} />
          {leaderboardRows.length > 0 && <EntryLeaderboard rows={leaderboardRows} subtitle={periodCaption} apple />}
        </div>
      ),
    },
    ...(categoriesContent
      ? [{
          key: "categories",
          label: "Kategorijas",
          count: 1 + (workNatureRows.length > 0 ? 1 : 0),
          keywords: "Darba raksturs Kas kuram palīdz kategorijas",
          content: categoriesContent,
        }]
      : []),
  ];

  return (
    <>
      <h1 className="sr-only">Komandas pārskats</h1>

      {/* The period switcher sits on the right of the shell's top bar. */}
      <TopBarSlot>
        <PeriodTabs current={period} apple />
      </TopBarSlot>

      <OverviewSections quiet sections={sections} />
    </>
  );
}
