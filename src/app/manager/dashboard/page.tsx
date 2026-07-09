import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PeriodTabs } from "@/components/dashboard/period-tabs";
import { SectionDivider } from "@/components/dashboard/section-divider";
import { CostCalculatorWidget } from "@/components/dashboard/cost-calculator-widget";
import { HoursTrendChart } from "@/components/dashboard/hours-trend-chart";
import { TeamHeatmap } from "@/components/dashboard/team-heatmap";
import { CategoryList } from "@/components/dashboard/category-list";
import { resolveWorkType } from "@/lib/work-type";
import { formatDurationLV } from "@/lib/utils";
import { normalizeClientName } from "@/lib/client-name";
import {
  AlertTriangle,
  Building2,
  Clock,
  FileText,
  Plus,
  Timer,
  TrendingUp,
  Users,
} from "lucide-react";

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

export default async function ManagerDashboard({
  searchParams,
}: {
  searchParams: { period?: string };
}) {
  const session = await requireUser(["MANAGER", "ADMIN"]);
  const orgId = session.organizationId;
  const managerId = session.userId;
  const period = searchParams?.period ?? "30d";
  const periodStart = getPeriodStart(period);
  const periodFilter = periodStart ? { gte: periodStart } : undefined;

  const eightWeeksAgo = new Date(Date.now() - 8 * 7 * 86400000);

  const nowDate = new Date();
  const currentMonthStart = new Date(Date.UTC(nowDate.getUTCFullYear(), nowDate.getUTCMonth(), 1));

  const [teamCount, clients, approved, pending, pendingCount, teamMembers, recentHeatmapEntries, currentMonthEntries] = await Promise.all([
    prisma.user.count({ where: { organizationId: orgId, managerId } }),
    prisma.client.findMany({
      where: { organizationId: orgId },
      orderBy: { name: "asc" },
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
        employee: {
          select: {
            id: true,
            name: true,
            workRole: { select: { duties: { select: { text: true } } } },
          },
        },
      },
    }),
    prisma.invisibleWorkEntry.findMany({
      where: { organizationId: orgId, managerId, status: "PENDING", deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { employee: { select: { name: true } } },
    }),
    prisma.invisibleWorkEntry.count({
      where: { organizationId: orgId, managerId, status: "PENDING", deletedAt: null },
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
  ]);

  // --- Core aggregation ---
  const clientMinById = new Map<string, number>();   // clientId → minutes
  const clientMinByName = new Map<string, number>(); // clientName.lower → minutes
  const categoryCount = new Map<string, number>();
  let totalMinutes = 0;
  let extraMinutes = 0;

  for (const e of approved) {
    totalMinutes += e.durationMinutes;
    if (e.clientId) {
      clientMinById.set(e.clientId, (clientMinById.get(e.clientId) ?? 0) + e.durationMinutes);
    } else if (e.clientName) {
      const key = normalizeClientName(e.clientName);
      clientMinByName.set(key, (clientMinByName.get(key) ?? 0) + e.durationMinutes);
    }
    categoryCount.set(e.category, (categoryCount.get(e.category) ?? 0) + 1);
    if (isExtraEntry(e)) extraMinutes += e.durationMinutes;
  }

  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
  const extraHours = Math.round((extraMinutes / 60) * 10) / 10;

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

  // --- Client rows ---
  const clientRows = clients.map((c) => {
    const used = (clientMinById.get(c.id) ?? 0) + (clientMinByName.get(normalizeClientName(c.name)) ?? 0);
    const overrun =
      c.freeMinutesPerMonth !== null ? Math.max(0, used - c.freeMinutesPerMonth) : 0;
    return {
      id: c.id,
      name: c.name,
      usedMinutes: used,
      freeMinutes: c.freeMinutesPerMonth,
      overrunMinutes: overrun,
      overrunEur: Math.round((overrun / 60) * HOURLY_RATE_EUR),
    };
  }).sort((a, b) => b.usedMinutes - a.usedMinutes);

  // --- Client budget forecast ---
  const monthClientById = new Map<string, number>();
  const monthClientByName = new Map<string, number>();
  for (const e of currentMonthEntries) {
    if (e.clientId) {
      monthClientById.set(e.clientId, (monthClientById.get(e.clientId) ?? 0) + e.durationMinutes);
    } else if (e.clientName) {
      const key = normalizeClientName(e.clientName);
      monthClientByName.set(key, (monthClientByName.get(key) ?? 0) + e.durationMinutes);
    }
  }
  const daysSoFar = nowDate.getUTCDate();
  const daysInMonth = new Date(Date.UTC(nowDate.getUTCFullYear(), nowDate.getUTCMonth() + 1, 0)).getUTCDate();
  const daysRemaining = daysInMonth - daysSoFar;
  type ClientForecast = { id: string; name: string; daysLeft: number; usedMin: number; freeMin: number; dailyRateH: number };
  const clientForecasts: ClientForecast[] = [];
  for (const c of clients) {
    if (c.freeMinutesPerMonth === null) continue;
    const usedMin =
      (monthClientById.get(c.id) ?? 0) +
      (monthClientByName.get(normalizeClientName(c.name)) ?? 0);
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

  const registeredClientNames = new Set(clients.map((c) => normalizeClientName(c.name)));
  const untrackedNames = [...new Set(
    approved
      .filter((e) => e.clientName && !e.clientId && !registeredClientNames.has(normalizeClientName(e.clientName)))
      .map((e) => e.clientName as string)
  )];

  const topCategories = Array.from(categoryCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const categoryItems = topCategories.map(([cat, count]) => {
    const pct = approved.length > 0 ? Math.round((count / approved.length) * 100) : 0;
    const titleMap = new Map<string, number>();
    for (const e of approved) {
      if (e.category === cat) titleMap.set(e.title, (titleMap.get(e.title) ?? 0) + 1);
    }
    const sorted = [...titleMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
    const maxCnt = sorted[0]?.[1] ?? 1;
    return {
      name: cat,
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

  const noClientCount = approved.filter((e) => !e.clientName).length;

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-foreground/50">
            Kopsavilkums
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Komandas pārskats</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Neredzamais darbs · {periodLabel(period)}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <PeriodTabs current={period} />
          <Button asChild variant="outline" size="sm">
            <Link href="/manager/report">
              <TrendingUp className="h-4 w-4" /> Pilna atskaite
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 mb-8">
        {[
          { label: "Darbinieki", value: teamCount, icon: Users, sub: "komandā" },
          { label: "Kopā stundas", value: `${totalHours}h`, icon: Clock, sub: "ierakstītas" },
          { label: "Papildu darbs", value: `${extraHours}h`, icon: FileText, sub: "nereģistrēts" },
          { label: "Gaida", value: pendingCount, icon: AlertTriangle, sub: "apstiprinājumu" },
          {
            label: "Izskatīšana",
            value: avgApprovalDays !== null ? `${avgApprovalDays}d` : "—",
            icon: Timer,
            sub: "vid. laiks",
          },
        ].map((k, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <k.icon className="h-4 w-4" />
              <span className="text-xs">{k.label}</span>
            </div>
            <div className="text-2xl font-bold tabular-nums">{k.value}</div>
            <div className="text-xs text-muted-foreground">{k.sub}</div>
          </Card>
        ))}
      </div>

      <CostCalculatorWidget extraMinutes={extraMinutes} />

      {/* ── Komanda ── */}
      {teamMembers.length > 0 && (
        <>
          <SectionDivider label="Komanda" />
          <div className="mb-6 space-y-4">
            {/* Adoption rate */}
            <div className={`flex items-center justify-between gap-4 rounded-xl border px-5 py-3.5 ${
              thisWeekActiveIds.size === teamMembers.length
                ? "border-emerald-500/30 bg-emerald-500/5"
                : thisWeekActiveIds.size === 0
                ? "border-amber-500/30 bg-amber-500/5"
                : "border-border bg-card"
            }`}>
              <div className="text-sm">
                <span className="font-medium">Aktivitāte šonedēļ — </span>
                <span className="font-semibold text-foreground">{thisWeekActiveIds.size}</span>
                <span className="text-muted-foreground"> / {teamMembers.length} darbinieki</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {teamMembers.map(m => (
                  <div
                    key={m.id}
                    title={`${m.name}: ${thisWeekActiveIds.has(m.id) ? "aktīvs" : "nav ierakstu"}`}
                    className={`h-2.5 w-2.5 rounded-full ${thisWeekActiveIds.has(m.id) ? "bg-emerald-500" : "bg-muted-foreground/30"}`}
                  />
                ))}
              </div>
            </div>

            {/* Silent employees */}
            {silentMembers.length > 0 && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.04] px-5 py-3.5">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
                <p className="text-sm">
                  <span className="font-medium">Nav logojuši 14+ dienas: </span>
                  <span className="text-muted-foreground">{silentMembers.map(m => m.name).join(", ")}</span>
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
                    Darba noslodze ({periodLabel(period)})
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

      {/* Analytics */}
      {approved.length > 0 && (
        <>
          <SectionDivider label="Analītika" />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mb-6">
            {/* Employee breakdown */}
            {employeeBreakdown.length > 0 && (
              <Card className="p-5">
                <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Papildu darbs pa darbiniekiem
                </div>
                <div className="space-y-2.5">
                  {employeeBreakdown.map((emp) => {
                    const pct = Math.round((emp.extraH / maxEmpExtraH) * 100);
                    return (
                      <div key={emp.id} className="flex items-center gap-3">
                        <div className="w-28 shrink-0 truncate text-xs">{emp.name}</div>
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-foreground/60 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                          {emp.extraH}h
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Hours trend */}
            <HoursTrendChart
              title="Papildu darba tendence"
              data={weeklyTrendData}
              badge={periodLabel(period)}
            />
          </div>

          {/* Interruption pattern alert */}
          {patternCategory && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/[0.04] p-4">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
              <div>
                <div className="text-sm font-semibold">Sistemātisks traucējums</div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Kategorija{" "}
                  <span className="font-medium text-foreground">&ldquo;{patternCategory}&rdquo;</span>{" "}
                  ir biežākā pēdējās 4 nedēļās — iespējama strukturāla problēma, ne gadījuma rakstura.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Client table */}
      <SectionDivider label="Klienti" />
      <div className="mb-8">
        {clientForecasts.length > 0 && (
          <Card className="mb-3 overflow-hidden p-0">
            <div className="flex items-center gap-2 border-b border-border/60 px-5 py-3">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Budžeta brīdinājumi
              </span>
              <span className="ml-auto text-xs text-muted-foreground">{clientForecasts.length} klients/-i</span>
            </div>
            <div className="divide-y divide-border/30">
              {clientForecasts.map((f) => {
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
                Prognoze balstīta uz šī mēneša vidējo tempu ({daysSoFar} dienas).
              </p>
            </div>
          </Card>
        )}
        {clientRows.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
              <Building2 className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Nav pievienotu klientu. Pievienojiet klientus, lai redzētu laika sadalījumu un pārsniegumu.
              </p>
              <Button asChild size="sm" variant="outline">
                <Link href="/manager/clients">
                  <Plus className="h-4 w-4" /> Pievienot klientus
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Klients</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Ierakstīts</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Bezmaksas limits</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Pārsniegums</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">~EUR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {clientRows.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3 font-medium">
                        <Link href={`/manager/clients/${c.id}`} className="hover:underline hover:text-foreground transition-colors">
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {c.usedMinutes > 0 ? formatDurationLV(c.usedMinutes) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                        {c.freeMinutes !== null ? formatDurationLV(c.freeMinutes) : "∞"}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {c.overrunMinutes > 0 ? (
                          <span className="font-semibold text-amber-500">
                            +{formatDurationLV(c.overrunMinutes)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {c.overrunEur > 0 ? (
                          <span className="font-semibold text-amber-500">€{c.overrunEur}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {clientRows.some((c) => c.overrunEur > 0) && (
                  <tfoot>
                    <tr className="border-t border-border bg-muted/20">
                      <td colSpan={3} className="px-5 py-2.5 text-xs text-muted-foreground">
                        Kopā pārsniegums (€{HOURLY_RATE_EUR}/h likme)
                      </td>
                      <td className="px-4 py-2.5 text-right text-sm font-semibold tabular-nums text-amber-500">
                        +{formatDurationLV(clientRows.reduce((s, c) => s + c.overrunMinutes, 0))}
                      </td>
                      <td className="px-4 py-2.5 text-right text-sm font-semibold tabular-nums text-amber-500">
                        €{clientRows.reduce((s, c) => s + c.overrunEur, 0)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
            {(untrackedNames.length > 0 || noClientCount > 0) && (
              <div className="border-t border-border px-5 py-3 flex items-start gap-2 bg-amber-500/5">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  {noClientCount > 0 && (
                    <span>{noClientCount} ieraksts bez klienta. </span>
                  )}
                  {untrackedNames.length > 0 && (
                    <span>
                      Klienti bez ierakstīta limita:{" "}
                      <Link href="/manager/clients" className="underline hover:text-foreground">
                        {untrackedNames.slice(0, 3).join(", ")}
                        {untrackedNames.length > 3 ? ` +${untrackedNames.length - 3}` : ""}
                      </Link>
                    </span>
                  )}
                </div>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Top categories */}
      {categoryItems.length > 0 && (
        <>
          <SectionDivider label="Kategorijas" />
          <Card className="mb-8 p-4">
            <CategoryList items={categoryItems} patternCategory={patternCategory} />
          </Card>
        </>
      )}

      {/* Pending manual entries */}
      {pendingCount > 0 && (
        <>
          <SectionDivider label="Gaida manuālu apstiprinājumu" />
          <div className="mb-8 space-y-3">
            {pending.map((e) => (
              <Card key={e.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">
                        {e.employee.name} · {e.category}
                        {e.clientName ? ` · ${e.clientName}` : ""}
                      </div>
                      <div className="mt-0.5 text-sm font-medium truncate">{e.title}</div>
                    </div>
                    <div className="text-xs tabular-nums text-muted-foreground shrink-0">
                      {e.durationMinutes} min
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/manager/entries">
                Skatīt visus {pendingCount} gaida ierakstus →
              </Link>
            </Button>
          </div>
        </>
      )}
    </>
  );
}
