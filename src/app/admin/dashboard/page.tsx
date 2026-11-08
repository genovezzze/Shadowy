import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ClientEmployeeMatrix } from "@/components/dashboard/client-employee-matrix";
import { ClientOverrunWidget } from "@/components/dashboard/client-overrun-widget";
import { buildClientMatrix } from "@/lib/client-matrix";
import { clientMonthOptions, resolveClientMonth } from "@/lib/client-month";
import { ClientMonthSelector } from "@/components/dashboard/client-month-selector";
import { EntriesBreakdownCard } from "@/components/dashboard/entries-breakdown-card";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { StatusBadge } from "@/components/entries/status-badge";
import { cn, formatDateTimeLV, formatDurationLV } from "@/lib/utils";
import { APPLE_CARD_LABEL, APPLE_FILL, APPLE_SEPARATOR, METRIC_SURFACE, METRIC_TINTS, TILE_BADGE, TINT_FILL, TINT_TILE , QUIET_LABEL} from "@/components/dashboard/apple";
import { StatTile } from "@/components/dashboard/stat-tile";
import { OverviewSections, type OverviewSection } from "@/components/dashboard/overview-sections";
import { buildClientLookup, normalizeClientName } from "@/lib/client-name";
import { EmptyState } from "@/components/ui/empty-state";
import { Activity, AlertTriangle, CalendarDays, Clock, FileText, Gauge, History, TrendingUp, UserCog, Users } from "lucide-react";
import { GettingStarted } from "@/components/dashboard/getting-started";
import { PeriodTabs } from "@/components/dashboard/period-tabs";
import { TopBarSlot } from "@/components/layout/top-bar-slot";
import { CostCalculatorWidget } from "@/components/dashboard/cost-calculator-widget";
import { TeamHeatmap } from "@/components/dashboard/team-heatmap";
import { CategoryList } from "@/components/dashboard/category-list";
import { WorkNatureCard } from "@/components/dashboard/work-nature-card";
import { EntryLeaderboard } from "@/components/dashboard/entry-leaderboard";
import { EmployeeClientMatrix } from "@/components/dashboard/employee-client-matrix";
import { DeltaBadge } from "@/components/dashboard/delta-badge";
import { groupByWorkNature, groupHelpPairs } from "@/lib/work-nature";
import { resolveWorkType } from "@/lib/work-type";
import { categoryLabel, normalizeCategoryKey } from "@/lib/work-insights";

const LV_MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jūn", "Jūl", "Aug", "Sep", "Okt", "Nov", "Dec"];
const HOURLY_RATE_EUR = 20;

function getPeriodStart(period: string): Date | undefined {
  const now = new Date();
  if (period === "7d") return new Date(now.getTime() - 7 * 86400000);
  if (period === "30d") return new Date(now.getTime() - 30 * 86400000);
  if (period === "90d") return new Date(now.getTime() - 90 * 86400000);
  return undefined;
}

function buildMonthlyData(entries: { createdAt: Date }[]) {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const count = entries.filter(
      (e) => e.createdAt.getFullYear() === year && e.createdAt.getMonth() === month
    ).length;
    return { label: LV_MONTHS[month], value: count };
  });
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: { period?: string; clientMonth?: string };
}) {
  const session = await requireUser(["ADMIN"]);
  const orgId = session.organizationId;
  const period = searchParams?.period ?? "all";
  const periodStart = getPeriodStart(period);
  const periodFilter = periodStart ? { gte: periodStart } : undefined;
  const clientMonth = resolveClientMonth(searchParams?.clientMonth);

  const twelveMonthsAgo = new Date(Date.now() - 365 * 86400000);
  const eightWeeksAgo = new Date(Date.now() - 8 * 7 * 86400000);
  const nowDateA = new Date();
  const currentMonthStartA = new Date(Date.UTC(nowDateA.getUTCFullYear(), nowDateA.getUTCMonth(), 1));

  const [managers, employees, totalEntries, allTimeEntries, pending, recent, allEntries, managerList, approvedEntries, allEmployees, recentHeatmapEntries, orgClients, currentMonthClientEntries, clientMatrixEntries, clientMonthHistory, entryCountsByEmployee, employeeNames, clientAssignmentRows] =
    await Promise.all([
      prisma.user.count({ where: { organizationId: orgId, role: "MANAGER" } }),
      prisma.user.count({ where: { organizationId: orgId, role: "EMPLOYEE" } }),
      prisma.invisibleWorkEntry.count({
        where: { organizationId: orgId, ...(periodFilter ? { createdAt: periodFilter } : {}) },
      }),
      prisma.invisibleWorkEntry.count({
        where: { organizationId: orgId },
      }),
      prisma.invisibleWorkEntry.count({
        where: { organizationId: orgId, status: "PENDING" },
      }),
      prisma.invisibleWorkEntry.findMany({
        where: { organizationId: orgId },
        orderBy: { updatedAt: "desc" },
        take: 6,
        include: { employee: true, manager: true },
      }),
      prisma.invisibleWorkEntry.findMany({
        where: { organizationId: orgId, createdAt: { gte: twelveMonthsAgo } },
        select: { createdAt: true },
      }),
      prisma.user.findMany({
        where: { organizationId: orgId, role: "MANAGER" },
        select: {
          id: true,
          name: true,
          _count: { select: { employees: true } },
        },
        orderBy: { name: "asc" },
      }),
      prisma.invisibleWorkEntry.findMany({
        where: {
          organizationId: orgId,
          status: "APPROVED",
          ...(periodFilter ? { workDate: periodFilter } : {}),
        },
        select: {
          durationMinutes: true,
          isOutsideRole: true,
          helpedColleague: true,
          helpedUser: { select: { name: true } },
          category: true,
          title: true,
          employeeId: true,
          clientId: true,
          clientName: true,
          workDate: true,
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
        where: { organizationId: orgId, role: "EMPLOYEE" },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
        take: 30,
      }),
      prisma.invisibleWorkEntry.findMany({
        where: { organizationId: orgId, deletedAt: null, workDate: { gte: eightWeeksAgo } },
        select: { employeeId: true, workDate: true, durationMinutes: true },
      }),
      prisma.client.findMany({
        where: { organizationId: orgId },
        select: {
          id: true,
          name: true,
          freeMinutesPerMonth: true,
          aliases: { select: { normalized: true } },
        },
      }),
      prisma.invisibleWorkEntry.findMany({
        where: { organizationId: orgId, status: "APPROVED", deletedAt: null, workDate: { gte: currentMonthStartA } },
        select: { clientId: true, clientName: true, durationMinutes: true },
      }),
      prisma.invisibleWorkEntry.findMany({
        where: {
          organizationId: orgId,
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
          employeeId: true,
          employee: { select: { name: true } },
        },
      }),
      prisma.invisibleWorkEntry.findMany({
        where: {
          organizationId: orgId,
          status: "APPROVED",
          deletedAt: null,
          OR: [{ clientId: { not: null } }, { clientName: { not: null } }],
        },
        select: { workDate: true },
      }),
      prisma.invisibleWorkEntry.groupBy({
        by: ["employeeId"],
        where: { organizationId: orgId, deletedAt: null, ...(periodFilter ? { createdAt: periodFilter } : {}) },
        _count: { _all: true },
      }),
      prisma.user.findMany({
        where: { organizationId: orgId, role: "EMPLOYEE" },
        select: { id: true, name: true },
      }),
      prisma.clientEmployee.findMany({
        where: { client: { organizationId: orgId } },
        select: { clientId: true, employeeId: true, client: { select: { name: true } } },
      }),
    ]);
  const clientAssignments = clientAssignmentRows.map((a) => ({
    clientId: a.clientId,
    clientName: a.client.name,
    employeeId: a.employeeId,
  }));

  // Trend vs the previous, equally long window. For a fixed period we reuse its
  // length; for "all time" (no baseline) we fall back to the last 30 days vs the
  // 30 before that, so the arrow always has a clear meaning.
  const deltaDays = period === "7d" ? 7 : period === "90d" ? 90 : 30;
  const deltaLabel = `pret iepr. ${deltaDays} d.`;
  const curWindowStart = new Date(Date.now() - deltaDays * 86400000);
  const prevWindowStart = new Date(Date.now() - 2 * deltaDays * 86400000);
  const [curWindowEntries, prevWindowEntries] = await Promise.all([
    prisma.invisibleWorkEntry.count({
      where: { organizationId: orgId, createdAt: { gte: curWindowStart } },
    }),
    prisma.invisibleWorkEntry.count({
      where: { organizationId: orgId, createdAt: { gte: prevWindowStart, lt: curWindowStart } },
    }),
  ]);

  const availableClientMonths = clientMonthOptions(
    clientMonthHistory.map((entry) => entry.workDate),
    clientMonth.key,
  );

  let extraMinutes = 0;
  const extraByDayA = new Map<string, number>();
  for (const e of approvedEntries) {
    const duties = e.employee.workRole?.duties.map((d: { text: string }) => d.text) ?? [];
    if (resolveWorkType(e.isOutsideRole, e.category, e.title, duties) === "extra") {
      extraMinutes += e.durationMinutes;
      const dayKey = e.workDate.toISOString().slice(0, 10);
      extraByDayA.set(dayKey, (extraByDayA.get(dayKey) ?? 0) + e.durationMinutes);
    }
  }
  const extraDailyBreakdownA = Array.from(extraByDayA.entries()).map(([date, minutes]) => ({ date, minutes }));

  // --- Client x Employee matrix ---
  const { rows: matrixRows, employees: matrixEmployees } = buildClientMatrix(
    clientMatrixEntries.map((e) => ({
      clientId: e.clientId,
      clientName: e.clientName,
      employeeId: e.employeeId,
      employeeName: e.employee.name,
      durationMinutes: e.durationMinutes,
      workDate: e.workDate,
    })),
    orgClients,
    { resetLimitMonthly: clientMonth.isAll },
  );
  const overrunClientsA = matrixRows.filter((r) => r.overrunMinutes > 0);
  const overrunClientCountA = overrunClientsA.length;
  const totalOverrunEurA = overrunClientsA.reduce(
    (s, r) => s + Math.round((r.overrunMinutes / 60) * HOURLY_RATE_EUR),
    0
  );

  // --- Work nature breakdown (cross-cuts categories) ---
  const workNatureRowsA = groupByWorkNature(approvedEntries);
  const helpPairsA = groupHelpPairs(
    approvedEntries.map((e) => ({
      employeeName: e.employee.name ?? "-",
      helpedName: e.helpedUser?.name ?? null,
      durationMinutes: e.durationMinutes,
      helpedColleague: e.helpedColleague,
    }))
  );

  // --- Category breakdown ---
  const categoryCountA = new Map<string, number>();
  for (const e of approvedEntries) {
    const key = normalizeCategoryKey(e.category);
    categoryCountA.set(key, (categoryCountA.get(key) ?? 0) + 1);
  }
  const categoryItemsA = [...categoryCountA.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([cat, count]) => {
      const pct = approvedEntries.length > 0 ? Math.round((count / approvedEntries.length) * 100) : 0;
      const titleMap = new Map<string, number>();
      for (const e of approvedEntries) {
        if (normalizeCategoryKey(e.category) === cat) titleMap.set(e.title, (titleMap.get(e.title) ?? 0) + 1);
      }
      const sorted = [...titleMap.entries()].sort((a, b) => b[1] - a[1]);
      const maxCnt = sorted[0]?.[1] ?? 1;
      return {
        name: categoryLabel(cat),
        count,
        pct,
        isPattern: false,
        titles: sorted.map(([title, cnt]) => ({
          title,
          count: cnt,
          pct: Math.round((cnt / count) * 100),
          barPct: Math.round((cnt / maxCnt) * 100),
        })),
      };
    });

  // --- Client budget forecast ---
  const clientByNormA = buildClientLookup(orgClients);
  const monthClientByIdA = new Map<string, number>();
  for (const e of currentMonthClientEntries) {
    // Free-typed shorthands resolve through the client's aliases, otherwise
    // the hours never reach the forecast for that client.
    const id = e.clientId ?? (e.clientName ? clientByNormA.get(normalizeClientName(e.clientName))?.id : undefined);
    if (!id) continue;
    monthClientByIdA.set(id, (monthClientByIdA.get(id) ?? 0) + e.durationMinutes);
  }
  const daysSoFarA = nowDateA.getUTCDate();
  const daysInMonthA = new Date(Date.UTC(nowDateA.getUTCFullYear(), nowDateA.getUTCMonth() + 1, 0)).getUTCDate();
  const daysRemainingA = daysInMonthA - daysSoFarA;
  type ClientForecastA = { id: string; name: string; daysLeft: number; usedMin: number; freeMin: number; dailyRateH: number };
  const clientForecastsA: ClientForecastA[] = [];
  for (const c of orgClients) {
    if (c.freeMinutesPerMonth === null) continue;
    const usedMin = monthClientByIdA.get(c.id) ?? 0;
    if (usedMin >= c.freeMinutesPerMonth || usedMin === 0 || daysSoFarA === 0) continue;
    const dailyRate = usedMin / daysSoFarA;
    const projectedTotal = usedMin + dailyRate * daysRemainingA;
    if (projectedTotal > c.freeMinutesPerMonth) {
      const minutesLeft = c.freeMinutesPerMonth - usedMin;
      const daysLeft = Math.max(0, Math.floor(minutesLeft / dailyRate));
      const dailyRateH = Math.round((dailyRate / 60) * 10) / 10;
      clientForecastsA.push({ id: c.id, name: c.name, daysLeft, usedMin, freeMin: c.freeMinutesPerMonth, dailyRateH });
    }
  }
  clientForecastsA.sort((a, b) => a.daysLeft - b.daysLeft);

  // --- Team activity analytics ---
  const todayMidnightMs = Date.UTC(nowDateA.getUTCFullYear(), nowDateA.getUTCMonth(), nowDateA.getUTCDate());
  const todayDow = (nowDateA.getUTCDay() + 6) % 7;
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

  const thisWeekActiveIds = new Set(
    recentHeatmapEntries.filter(e => e.workDate.getTime() >= weekSlots[7].startMs).map(e => e.employeeId)
  );
  const fourteenDaysAgoMs = todayMidnightMs - 14 * 86400000;
  const activeInLast14 = new Set(
    recentHeatmapEntries.filter(e => e.workDate.getTime() >= fourteenDaysAgoMs).map(e => e.employeeId)
  );
  const silentEmployees = allEmployees.filter(e => !activeInLast14.has(e.id));

  const empWeekSet = new Map<string, Set<number>>();
  for (const e of recentHeatmapEntries) {
    const wMs = e.workDate.getTime();
    const idx = weekSlots.findIndex(w => wMs >= w.startMs && wMs < w.endMs);
    if (idx === -1) continue;
    if (!empWeekSet.has(e.employeeId)) empWeekSet.set(e.employeeId, new Set());
    empWeekSet.get(e.employeeId)!.add(idx);
  }
  const heatmapRows = allEmployees.map(emp => ({
    id: emp.id,
    name: emp.name,
    weeks: weekSlots.map((_, i) => empWeekSet.get(emp.id)?.has(i) ?? false),
  }));

  const empMinMap = new Map<string, number>();
  for (const e of approvedEntries) empMinMap.set(e.employeeId, (empMinMap.get(e.employeeId) ?? 0) + e.durationMinutes);
  const workloadRows = allEmployees
    .map(emp => ({ id: emp.id, name: emp.name, hours: Math.round(((empMinMap.get(emp.id) ?? 0) / 60) * 10) / 10 }))
    .filter(emp => emp.hours > 0)
    .sort((a, b) => b.hours - a.hours);
  const avgWorkload = workloadRows.length > 0 ? workloadRows.reduce((s, e) => s + e.hours, 0) / workloadRows.length : 0;
  const maxWorkload = workloadRows[0]?.hours ?? 0;

  // Per-manager stats
  const managerStats = await Promise.all(
    managerList.map(async (m) => {
      const [pendingCount, reviewed] = await Promise.all([
        prisma.invisibleWorkEntry.count({
          where: { managerId: m.id, organizationId: orgId, status: "PENDING" },
        }),
        prisma.invisibleWorkEntry.findMany({
          where: {
            managerId: m.id,
            organizationId: orgId,
            status: { in: ["APPROVED", "REJECTED", "RETURNED"] },
            ...(periodFilter ? { updatedAt: periodFilter } : {}),
          },
          select: { createdAt: true, updatedAt: true },
        }),
      ]);

      const avgMs =
        reviewed.length > 0
          ? reviewed.reduce((s, e) => s + (e.updatedAt.getTime() - e.createdAt.getTime()), 0) /
            reviewed.length
          : null;

      return {
        name: m.name,
        teamSize: m._count.employees,
        pending: pendingCount,
        reviewed: reviewed.length,
        avgReviewDays: avgMs !== null ? Math.round((avgMs / 86400000) * 10) / 10 : null,
      };
    })
  );

  // --- Entry leaderboard (who submitted the most entries) ---
  const employeeNameMap = new Map(employeeNames.map((e) => [e.id, e.name]));
  const leaderboardRows = entryCountsByEmployee
    .map((g) => ({
      id: g.employeeId,
      name: employeeNameMap.get(g.employeeId) ?? "Nezināms",
      count: g._count._all,
    }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);

  const monthlyData = buildMonthlyData(allEntries);

  // --- Entries breakdown (today / yesterday / week / month / etc.) ---
  const todayStartA = new Date(Date.UTC(nowDateA.getUTCFullYear(), nowDateA.getUTCMonth(), nowDateA.getUTCDate()));
  const yesterdayStartA = new Date(todayStartA.getTime() - 86400000);
  const sevenDaysAgoA = new Date(todayStartA.getTime() - 7 * 86400000);
  const thirtyDaysAgoA = new Date(todayStartA.getTime() - 30 * 86400000);
  const ninetyDaysAgoA = new Date(todayStartA.getTime() - 90 * 86400000);
  const entriesBreakdown = [
    { label: "Šodien", value: allEntries.filter((e) => e.createdAt >= todayStartA).length },
    { label: "Vakar", value: allEntries.filter((e) => e.createdAt >= yesterdayStartA && e.createdAt < todayStartA).length },
    { label: "Pēdējās 7 dienas", value: allEntries.filter((e) => e.createdAt >= sevenDaysAgoA).length },
    { label: "Pēdējās 30 dienas", value: allEntries.filter((e) => e.createdAt >= thirtyDaysAgoA).length },
    { label: "Pēdējās 90 dienas", value: allEntries.filter((e) => e.createdAt >= ninetyDaysAgoA).length },
    { label: "Kopā (viss laiks)", value: allTimeEntries },
  ];

  const periodCaption =
    period === "7d" ? "Pēdējās 7 dienas" : period === "30d" ? "Pēdējās 30 dienas" : period === "90d" ? "Pēdējās 90 dienas" : "Viss laiks";
  const periodBadge = period === "all" ? "Viss" : period.replace("d", " d.");

  // Blocks inside a section sit in one column with an even gap; components that
  // carry their own outer margin elsewhere get it reset here.
  const stack = "flex flex-col gap-3 [&>*]:!mb-0 [&>*]:!mt-0";
  const tileGrid = "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5";

  // ── Kopsavilkums ──
  const summaryContent = (
    <div className={stack}>
      <div className={tileGrid}>
        <StatTile
          quiet
          tint="neutral"
          icon={<UserCog />}
          title="Vadītāji"
          value={managers}
          description="Izskata darbinieku ierakstus"
        />
        <StatTile
          quiet
          tint="neutral"
          icon={<Users />}
          title="Darbinieki"
          value={employees}
          description="Iesniedz neredzamā darba ierakstus"
        />
        <EntriesBreakdownCard
          quiet
          tint="neutral"
          label={period === "all" ? "Visi ieraksti" : "Ieraksti periodā"}
          value={totalEntries}
          icon={<FileText />}
          breakdown={entriesBreakdown}
          delta={<DeltaBadge current={curWindowEntries} previous={prevWindowEntries} label={deltaLabel} />}
        />
        <StatTile
          quiet
          tint="neutral"
          icon={<Clock />}
          title="Gaida izskatīšanu"
          value={pending}
          description="Vēl nav izskatīti"
        />
        <StatTile
          quiet
          tint="neutral"
          icon={<Activity />}
          title="Aktivitāte šonedēļ"
          value={
            <>
              {thisWeekActiveIds.size}
              <span className="text-[15px] font-normal text-muted-foreground"> / {allEmployees.length}</span>
            </>
          }
          description="Darbinieki ar ierakstu šonedēļ"
        >
          <div className="mt-3 flex flex-wrap gap-1">
            {allEmployees.slice(0, 20).map((e) => (
              <span
                key={e.id}
                title={`${e.name}: ${thisWeekActiveIds.has(e.id) ? "aktīvs" : "nav ierakstu"}`}
                className={cn("h-2 w-2 rounded-full", thisWeekActiveIds.has(e.id) ? TINT_FILL.green : APPLE_FILL)}
              />
            ))}
          </div>
        </StatTile>
      </div>
      <CostCalculatorWidget extraMinutes={extraMinutes} dailyBreakdown={extraDailyBreakdownA} apple />
    </div>
  );

  // ── Klienti ──
  const clientsContent = (
    <div className={stack}>
      <ClientMonthSelector selectedMonth={clientMonth.key} options={availableClientMonths} apple />
      <ClientOverrunWidget
        overrunCount={overrunClientCountA}
        totalClients={matrixRows.length}
        totalOverrunEur={totalOverrunEurA}
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
      {clientForecastsA.length > 0 && (
        <div className={cn(METRIC_SURFACE, "overflow-hidden")}>
          <div className="flex items-center justify-between gap-4 px-5 pb-2 pt-5">
            <div className={cn(APPLE_CARD_LABEL, TINT_TILE.orange, QUIET_LABEL)}>
              <AlertTriangle />
              Budžeta brīdinājumi
            </div>
            <span className={TILE_BADGE}>{clientForecastsA.length} klients/-i</span>
          </div>
          <div>
            {clientForecastsA.map((f, i) => {
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
              Prognoze balstīta uz šī mēneša vidējo tempu ({daysSoFarA} dienas)
            </p>
          </div>
        </div>
      )}
    </div>
  );

  // ── Aktivitāte ──
  const activityContent = (
    <div className={stack}>
      <ActivityChart tint="green" iconTint="neutral" quietLabel title="Organizācijas aktivitāte (pēdējie 12 mēneši)" data={monthlyData} />
      {leaderboardRows.length > 0 && <EntryLeaderboard rows={leaderboardRows} subtitle={periodCaption} apple />}
      <div className={cn(METRIC_SURFACE, "overflow-hidden")}>
        <div className="flex items-center justify-between gap-4 px-5 pb-2 pt-5">
          <div className={cn(APPLE_CARD_LABEL, TINT_TILE.neutral, QUIET_LABEL)}>
            <History />
            Nesenie ieraksti
          </div>
        </div>
        {recent.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="Pagaidām nav aktivitātes"
              description="Kad darbinieki iesniegs neredzamā darba ierakstus, tie parādīsies šeit."
            />
          </div>
        ) : (
          <div className="pb-1">
            {recent.map((e, i) => (
              <div key={e.id} className="pl-5 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]">
                <div className={cn("flex items-center justify-between gap-4 py-3 pr-5", i > 0 && cn("border-t", APPLE_SEPARATOR))}>
                  <div className="min-w-0">
                    <div className="truncate text-[14px] font-medium">{e.title}</div>
                    <div className="mt-0.5 text-[12px] text-muted-foreground">
                      {e.employee.name} · {categoryLabel(e.category)} · {formatDurationLV(e.durationMinutes)} ·{" "}
                      {formatDateTimeLV(e.updatedAt)}
                    </div>
                  </div>
                  <StatusBadge status={e.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ── Komanda ──
  const teamContent = managerStats.length > 0 && (
    <div className={cn(METRIC_SURFACE, "overflow-hidden")}>
      <div className="flex items-center justify-between gap-4 px-5 pb-3 pt-5">
        <div className={cn(APPLE_CARD_LABEL, TINT_TILE.neutral, QUIET_LABEL)}>
          <TrendingUp />
          Vadītāju sniegums
        </div>
        <span className={TILE_BADGE}>{periodBadge}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[14px]">
          <thead>
            <tr className={cn("border-b text-[12px] text-muted-foreground", APPLE_SEPARATOR)}>
              <th className="h-9 px-5 text-left font-normal">Vadītājs</th>
              <th className="h-9 px-4 text-right font-normal">Komanda</th>
              <th className="h-9 px-4 text-right font-normal">Gaida</th>
              <th className="h-9 px-4 text-right font-normal">Izskatīti</th>
              <th className="h-9 px-5 text-right font-normal">Vid. izskatīšana</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.07] dark:divide-white/[0.07]">
            {[...managerStats]
              .sort((a, b) => a.name.localeCompare(b.name, "lv"))
              .map((m, i) => (
                <tr key={i} className="h-11 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]">
                  <td className="px-5 font-medium">{m.name}</td>
                  <td className="px-4 text-right tabular-nums text-muted-foreground">{m.teamSize}</td>
                  <td className={cn("px-4 text-right tabular-nums", m.pending > 0 ? cn("font-semibold", METRIC_TINTS.orange) : "text-muted-foreground/50")}>
                    {m.pending > 0 ? m.pending : "-"}
                  </td>
                  <td className="px-4 text-right tabular-nums text-muted-foreground">{m.reviewed}</td>
                  <td className="px-5 text-right tabular-nums">
                    {m.avgReviewDays !== null ? `${m.avgReviewDays} d.` : <span className="text-muted-foreground/50">-</span>}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── Darbinieki ──
  const employeesContent = allEmployees.length > 0 && (
    <div className={stack}>
      {silentEmployees.length > 0 && (
        <div className={cn(METRIC_SURFACE, "p-5")}>
          <div className="flex items-center justify-between gap-4">
            <div className={cn(APPLE_CARD_LABEL, TINT_TILE.orange, QUIET_LABEL)}>
              <AlertTriangle />
              Nav logojuši 14+ dienas
            </div>
            <span className={TILE_BADGE}>{silentEmployees.length}</span>
          </div>
          <p className="mt-3 text-[14px]">
            {silentEmployees.slice(0, 8).map((e) => e.name).join(", ")}
            {silentEmployees.length > 8 ? ` +${silentEmployees.length - 8}` : ""}
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className={cn(METRIC_SURFACE, "p-5")}>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className={cn(APPLE_CARD_LABEL, TINT_TILE.neutral, QUIET_LABEL)}>
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
              <div className={cn(APPLE_CARD_LABEL, TINT_TILE.neutral, QUIET_LABEL)}>
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

  // ── Kategorijas ──
  const categoriesContent = categoryItemsA.length > 0 && (
    <div className={stack}>
      {workNatureRowsA.length > 0 && (
        <WorkNatureCard rows={workNatureRowsA} totalEntries={approvedEntries.length} helpPairs={helpPairsA} apple />
      )}
      <div className={cn(METRIC_SURFACE, "p-2")}>
        <CategoryList items={categoryItemsA} apple />
      </div>
    </div>
  );

  const sections: OverviewSection[] = [
    {
      key: "summary",
      label: "Kopsavilkums",
      count: 6,
      keywords: "Vadītāji Darbinieki Visi ieraksti Gaida izskatīšanu Aktivitāte šonedēļ Neredzamo izmaksu aprēķins",
      content: summaryContent,
    },
    {
      key: "clients",
      label: "Klienti",
      count: (overrunClientCountA > 0 ? 1 : 0) + (matrixRows.length > 0 ? 2 : 1) + (clientForecastsA.length > 0 ? 1 : 0),
      keywords: "Klientu mēneša limiti pārsniegums Darbinieku klienti Noslodze pa darbiniekiem Budžeta brīdinājumi",
      content: clientsContent,
    },
    {
      key: "activity",
      label: "Aktivitāte",
      count: 2 + (leaderboardRows.length > 0 ? 1 : 0),
      keywords: "Organizācijas aktivitāte Ierakstu aktivitāte Nesenie ieraksti",
      content: activityContent,
    },
    ...(teamContent
      ? [{ key: "team", label: "Komanda", count: 1, keywords: "Vadītāju sniegums izskatīšana", content: teamContent }]
      : []),
    ...(employeesContent
      ? [{
          key: "employees",
          label: "Darbinieki",
          count: 1 + (workloadRows.length > 0 ? 1 : 0) + (silentEmployees.length > 0 ? 1 : 0),
          keywords: "Aktivitātes karte Darba noslodze Nav logojuši",
          content: employeesContent,
        }]
      : []),
    ...(categoriesContent
      ? [{
          key: "categories",
          label: "Kategorijas",
          count: 1 + (workNatureRowsA.length > 0 ? 1 : 0),
          keywords: "Darba raksturs Kas kuram palīdz kategorijas",
          content: categoriesContent,
        }]
      : []),
  ];

  return (
    <>
      <h1 className="sr-only">Organizācijas pārskats</h1>


      {/* The period switcher sits on the right of the shell's top bar. */}
      <TopBarSlot>
        <PeriodTabs current={period} apple />
      </TopBarSlot>

      <GettingStarted
        hasManagers={managers > 0}
        hasEmployees={employees > 0}
        hasEntries={totalEntries > 0}
      />

      <OverviewSections quiet sections={sections} />
    </>
  );
}
