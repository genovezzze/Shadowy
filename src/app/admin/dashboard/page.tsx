import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/entries/status-badge";
import { formatDateTimeLV, formatDurationLV } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { AlertTriangle, FileText, UserCog, Users, Clock, Timer, TrendingUp } from "lucide-react";
import { GettingStarted } from "@/components/dashboard/getting-started";
import { PeriodTabs } from "@/components/dashboard/period-tabs";
import { SectionDivider } from "@/components/dashboard/section-divider";
import { CostCalculatorWidget } from "@/components/dashboard/cost-calculator-widget";
import { TeamHeatmap } from "@/components/dashboard/team-heatmap";
import { CategoryList } from "@/components/dashboard/category-list";
import { resolveWorkType } from "@/lib/work-type";

const LV_MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jūn", "Jūl", "Aug", "Sep", "Okt", "Nov", "Dec"];

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
  searchParams: { period?: string };
}) {
  const session = await requireUser(["ADMIN"]);
  const orgId = session.organizationId;
  const period = searchParams?.period ?? "all";
  const periodStart = getPeriodStart(period);
  const periodFilter = periodStart ? { gte: periodStart } : undefined;

  const twelveMonthsAgo = new Date(Date.now() - 365 * 86400000);
  const eightWeeksAgo = new Date(Date.now() - 8 * 7 * 86400000);
  const nowDateA = new Date();
  const currentMonthStartA = new Date(Date.UTC(nowDateA.getUTCFullYear(), nowDateA.getUTCMonth(), 1));

  const [managers, employees, totalEntries, pending, recent, allEntries, managerList, approvedEntries, allEmployees, recentHeatmapEntries, orgClients, currentMonthClientEntries] =
    await Promise.all([
      prisma.user.count({ where: { organizationId: orgId, role: "MANAGER" } }),
      prisma.user.count({ where: { organizationId: orgId, role: "EMPLOYEE" } }),
      prisma.invisibleWorkEntry.count({
        where: { organizationId: orgId, ...(periodFilter ? { createdAt: periodFilter } : {}) },
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
          category: true,
          title: true,
          employeeId: true,
          employee: {
            select: {
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
        select: { id: true, name: true, freeMinutesPerMonth: true },
      }),
      prisma.invisibleWorkEntry.findMany({
        where: { organizationId: orgId, status: "APPROVED", deletedAt: null, workDate: { gte: currentMonthStartA } },
        select: { clientId: true, clientName: true, durationMinutes: true },
      }),
    ]);

  let extraMinutes = 0;
  for (const e of approvedEntries) {
    const duties = e.employee.workRole?.duties.map((d: { text: string }) => d.text) ?? [];
    if (resolveWorkType(e.isOutsideRole, e.category, e.title, duties) === "extra") {
      extraMinutes += e.durationMinutes;
    }
  }

  // --- Category breakdown ---
  const categoryCountA = new Map<string, number>();
  for (const e of approvedEntries) {
    categoryCountA.set(e.category, (categoryCountA.get(e.category) ?? 0) + 1);
  }
  const categoryItemsA = [...categoryCountA.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([cat, count]) => {
      const pct = approvedEntries.length > 0 ? Math.round((count / approvedEntries.length) * 100) : 0;
      const titleMap = new Map<string, number>();
      for (const e of approvedEntries) {
        if (e.category === cat) titleMap.set(e.title, (titleMap.get(e.title) ?? 0) + 1);
      }
      const sorted = [...titleMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
      const maxCnt = sorted[0]?.[1] ?? 1;
      return {
        name: cat,
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
  const monthClientByIdA = new Map<string, number>();
  const monthClientByNameA = new Map<string, number>();
  for (const e of currentMonthClientEntries) {
    if (e.clientId) {
      monthClientByIdA.set(e.clientId, (monthClientByIdA.get(e.clientId) ?? 0) + e.durationMinutes);
    } else if (e.clientName) {
      const key = e.clientName.replace(/''/g, '"').toLowerCase();
      monthClientByNameA.set(key, (monthClientByNameA.get(key) ?? 0) + e.durationMinutes);
    }
  }
  const daysSoFarA = nowDateA.getUTCDate();
  const daysInMonthA = new Date(Date.UTC(nowDateA.getUTCFullYear(), nowDateA.getUTCMonth() + 1, 0)).getUTCDate();
  const daysRemainingA = daysInMonthA - daysSoFarA;
  type ClientForecastA = { id: string; name: string; daysLeft: number; usedMin: number; freeMin: number; dailyRateH: number };
  const clientForecastsA: ClientForecastA[] = [];
  for (const c of orgClients) {
    if (c.freeMinutesPerMonth === null) continue;
    const usedMin =
      (monthClientByIdA.get(c.id) ?? 0) +
      (monthClientByNameA.get(c.name.replace(/''/g, '"').toLowerCase()) ?? 0);
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

  const monthlyData = buildMonthlyData(allEntries);

  const glassInner = "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent dark:block hidden";

  return (
    <>
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-foreground/50 dark:text-white/40">
            Pārskats
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Organizācijas pārskats
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Galvenie rādītāji par jūsu organizāciju.
          </p>
        </div>
        <PeriodTabs current={period} />
      </div>

      <GettingStarted
        hasManagers={managers > 0}
        hasEmployees={employees > 0}
        hasEntries={totalEntries > 0}
      />

      {/* ── KPI grid ── */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard formal label="Vadītāji" value={managers} icon={<UserCog className="h-5 w-5" />} />
        <KpiCard formal label="Darbinieki" value={employees} icon={<Users className="h-5 w-5" />} />
        <KpiCard
          formal
          label={period === "all" ? "Visi ieraksti" : "Ieraksti periodā"}
          value={totalEntries}
          icon={<FileText className="h-5 w-5" />}
        />
        <KpiCard
          formal
          label="Gaida izskatīšanu"
          value={pending}
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      <CostCalculatorWidget extraMinutes={extraMinutes} />

      {/* ── Section divider ── */}
      <SectionDivider label="Aktivitāte" />

      {/* ── Activity chart ── */}
      <div className="mb-8">
        <ActivityChart
          title="Organizācijas aktivitāte (pēdējie 12 mēneši)"
          data={monthlyData}
        />
      </div>

      {/* ── Manager performance ── */}
      {managerStats.length > 0 && (
        <>
          <SectionDivider label="Komanda" />
          <Card className="relative mb-8 overflow-hidden p-0">
            <div className={glassInner} />
            <div className="px-6 py-4 flex items-center justify-between border-b border-border dark:border-white/[0.07]">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Vadītāju sniegums
              </div>
              {period !== "all" && (
                <span className="text-xs text-muted-foreground">
                  {period === "7d" ? "Pēdējās 7 dienas" : period === "30d" ? "Pēdējās 30 dienas" : "Pēdējās 90 dienas"}
                </span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 dark:border-white/[0.06] dark:bg-white/[0.02]">
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Vadītājs</th>
                    <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Komanda</th>
                    <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Gaida</th>
                    <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Izskatīti</th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 flex items-center justify-end gap-1">
                      <Timer className="h-3 w-3" /> Vid. izskatīšana
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-white/[0.04]">
                  {managerStats
                    .sort((a, b) => (a.avgReviewDays ?? 999) - (b.avgReviewDays ?? 999))
                    .map((m, i) => (
                      <tr key={i} className="group hover:bg-muted/40 dark:hover:bg-white/[0.03] transition-colors">
                        <td className="px-6 py-3.5 font-medium">{m.name}</td>
                        <td className="px-4 py-3.5 text-center tabular-nums text-muted-foreground">{m.teamSize}</td>
                        <td className="px-4 py-3.5 text-center">
                          {m.pending > 0 ? (
                            <span className="inline-flex items-center rounded-full bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20 px-2.5 py-0.5 text-xs font-semibold">
                              {m.pending}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/50">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center tabular-nums text-muted-foreground">{m.reviewed}</td>
                        <td className="px-6 py-3.5 text-right tabular-nums">
                          {m.avgReviewDays !== null ? (
                            <span className={
                              m.avgReviewDays <= 1
                                ? "font-semibold text-emerald-400"
                                : m.avgReviewDays <= 3
                                ? "text-foreground"
                                : "font-semibold text-amber-400"
                            }>
                              {m.avgReviewDays} d.
                            </span>
                          ) : (
                            <span className="text-muted-foreground/50">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* ── Darbinieki analytics ── */}
      {allEmployees.length > 0 && (
        <>
          <SectionDivider label="Darbinieki" />
          <div className="mb-8 space-y-4">
            {/* Adoption rate */}
            <div className={`flex items-center justify-between gap-4 rounded-xl border px-5 py-3.5 ${
              thisWeekActiveIds.size === allEmployees.length
                ? "border-emerald-500/30 bg-emerald-500/5"
                : thisWeekActiveIds.size === 0
                ? "border-amber-500/30 bg-amber-500/5"
                : "border-border bg-card"
            }`}>
              <div className="text-sm">
                <span className="font-medium">Aktivitāte šonedēļ — </span>
                <span className="font-semibold text-foreground">{thisWeekActiveIds.size}</span>
                <span className="text-muted-foreground"> / {allEmployees.length} darbinieki</span>
              </div>
              <div className="flex flex-wrap items-center gap-1 shrink-0 max-w-[200px]">
                {allEmployees.slice(0, 20).map(e => (
                  <div
                    key={e.id}
                    title={`${e.name}: ${thisWeekActiveIds.has(e.id) ? "aktīvs" : "nav ierakstu"}`}
                    className={`h-2.5 w-2.5 rounded-full ${thisWeekActiveIds.has(e.id) ? "bg-emerald-500" : "bg-muted-foreground/30"}`}
                  />
                ))}
              </div>
            </div>

            {/* Silent employees */}
            {silentEmployees.length > 0 && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.04] px-5 py-3.5">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
                <p className="text-sm">
                  <span className="font-medium">Nav logojuši 14+ dienas: </span>
                  <span className="text-muted-foreground">{silentEmployees.slice(0, 8).map(e => e.name).join(", ")}{silentEmployees.length > 8 ? ` +${silentEmployees.length - 8}` : ""}</span>
                </p>
              </div>
            )}

            {/* Heatmap + Workload */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card className="p-5">
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Aktivitātes karte (8 nedēļas)
                </div>
                <TeamHeatmap rows={heatmapRows} weekLabels={weekSlots.map(w => w.label)} />
              </Card>

              {workloadRows.length > 0 && (
                <Card className="p-5">
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                    Darba noslodze ({period === "all" ? "viss laiks" : period === "7d" ? "7 dienas" : period === "30d" ? "30 dienas" : "90 dienas"})
                  </div>
                  <div className="space-y-2.5">
                    {workloadRows.map(emp => {
                      const pct = maxWorkload > 0 ? Math.round((emp.hours / maxWorkload) * 100) : 0;
                      const overloaded = avgWorkload > 0 && emp.hours > avgWorkload * 2 && workloadRows.length > 1;
                      return (
                        <div key={emp.id} className="flex items-center gap-3">
                          <div className="w-28 shrink-0 truncate text-xs">{emp.name}</div>
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${overloaded ? "bg-amber-500/70" : "bg-foreground/60"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className={`w-10 shrink-0 text-right text-xs tabular-nums ${overloaded ? "text-amber-500 font-semibold" : "text-muted-foreground"}`}>
                            {emp.hours}h
                          </div>
                        </div>
                      );
                    })}
                    {workloadRows.length > 1 && (
                      <div className="pt-1.5 border-t border-border text-xs text-muted-foreground flex items-center justify-between">
                        <span>Vidēji: {Math.round(avgWorkload * 10) / 10}h</span>
                        {maxWorkload > avgWorkload * 2 && (
                          <span className="text-amber-500 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Nevienmērīga slodze
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Category breakdown ── */}
      {categoryItemsA.length > 0 && (
        <>
          <SectionDivider label="Kategorijas" />
          <Card className="mb-8 p-4">
            <CategoryList items={categoryItemsA} />
          </Card>
        </>
      )}

      {/* ── Client budget forecasts ── */}
      {clientForecastsA.length > 0 && (
        <>
          <SectionDivider label="Klientu budžets" />
          <Card className="mb-8 overflow-hidden p-0">
            <div className="flex items-center gap-2 border-b border-border/60 px-5 py-3">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Budžeta brīdinājumi
              </span>
              <span className="ml-auto text-xs text-muted-foreground">{clientForecastsA.length} klients/-i</span>
            </div>
            <div className="divide-y divide-border/30">
              {clientForecastsA.map((f) => {
                const usedPct = Math.min(100, Math.round((f.usedMin / f.freeMin) * 100));
                const urgent = f.daysLeft === 0;
                const soon = f.daysLeft <= 2;
                return (
                  <div key={f.id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="w-40 shrink-0 min-w-0">
                      <div className="truncate text-sm font-medium">{f.name}</div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        {formatDurationLV(f.usedMin)} / {formatDurationLV(f.freeMin)} · {f.dailyRateH}h/d.
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${urgent ? "bg-rose-500/70" : soon ? "bg-amber-500/70" : "bg-amber-400/50"}`}
                          style={{ width: `${usedPct}%` }}
                        />
                      </div>
                      <div className="mt-1 text-[10px] text-muted-foreground">{usedPct}% no mēneša limita</div>
                    </div>
                    <div className={`shrink-0 text-right text-xs font-semibold tabular-nums ${urgent ? "text-rose-400" : "text-amber-500"}`}>
                      {urgent ? "Šodien" : `~${Math.max(1, f.daysLeft)} d.`}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-border/40 bg-muted/10 px-5 py-2.5">
              <p className="text-[11px] text-muted-foreground">
                Prognoze balstīta uz šī mēneša vidējo tempu ({daysSoFarA} dienas).
              </p>
            </div>
          </Card>
        </>
      )}

      {/* ── Recent activity ── */}
      <SectionDivider label="Nesenie ieraksti" />
      <Card className="relative overflow-hidden p-0">
        <div className={glassInner} />
        <div className="px-6 py-4 border-b border-border dark:border-white/[0.07]">
          <div className="text-sm font-semibold">Nesenā aktivitāte</div>
        </div>
        {recent.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="Pagaidām nav aktivitātes"
              description="Kad darbinieki iesniegs neredzamā darba ierakstus, tie parādīsies šeit."
            />
          </div>
        ) : (
          <div className="divide-y divide-border dark:divide-white/[0.04]">
            {recent.map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-muted/40 dark:hover:bg-white/[0.02]">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{e.title}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {e.employee.name} · {e.category} · {formatDurationLV(e.durationMinutes)} ·{" "}
                    {formatDateTimeLV(e.updatedAt)}
                  </div>
                </div>
                <StatusBadge status={e.status} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
