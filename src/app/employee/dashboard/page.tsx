import Link from "next/link";
import Image from "next/image";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { WorkTypeChart } from "@/components/dashboard/work-type-chart";
import { HoursTrendChart } from "@/components/dashboard/hours-trend-chart";
import { FocusHeatmap } from "@/components/dashboard/focus-heatmap";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EntryCard } from "@/components/entries/entry-card";
import { EmptyState } from "@/components/ui/empty-state";
import { CheckCircle2, Clock, RotateCcw, PlusCircle, Timer, Flame, Zap, TrendingUp } from "lucide-react";
import { EmployeeEntryActions } from "@/components/entries/employee-entry-actions";
import { SectionDivider } from "@/components/dashboard/section-divider";
import { ArrowRight } from "lucide-react";
import { resolveWorkType } from "@/lib/work-type";
import { normalizeClientName } from "@/lib/client-name";
import { DailyDigestCard } from "@/components/dashboard/daily-digest-card";
import { categoryLabel } from "@/lib/work-insights";

const LV_MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jūn", "Jūl", "Aug", "Sep", "Okt", "Nov", "Dec"];
const LV_DAYS = ["P", "O", "T", "C", "Pk", "S", "Sv"];

function buildMonthlyData(entries: { createdAt: Date }[]) {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const count = entries.filter(
      (e) => e.createdAt.getFullYear() === year && e.createdAt.getMonth() === month
    ).length;
    return { label: LV_MONTHS[month], value: count };
  });
}

const CATEGORY_COLORS = ["#10b981", "#6366f1", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

function trendHint(current: number, prev: number): string | undefined {
  if (prev === 0 && current === 0) return undefined;
  if (prev === 0) return "Pirmais periods";
  const pct = Math.round(((current - prev) / prev) * 100);
  if (pct === 0) return "Vienādi ar iepriekšējo mēnesi";
  return `${pct > 0 ? "↑" : "↓"} ${Math.abs(pct)}% vs iepriekšējo mēnesi`;
}

function isoWeekKey(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  const day = d.getUTCDay() || 7;
  const thursday = new Date(d.getTime() + (4 - day) * 86400000);
  const yearStart = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((thursday.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${thursday.getUTCFullYear()}-W${week}`;
}

function weekStartMs(dateStr: string): number {
  const d = new Date(`${dateStr}T12:00:00Z`);
  const dow = (d.getUTCDay() + 6) % 7;
  return d.getTime() - dow * 86400000;
}

export default async function EmployeeDashboard() {
  const session = await requireUser(["EMPLOYEE"]);

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 86400000);

  const baseWhere = { employeeId: session.userId, deletedAt: null };

  const [pendingCount, approvedCount, returnedCount, rejectedCount, recent, allEntries, userWithRole] = await Promise.all([
    prisma.invisibleWorkEntry.count({ where: { ...baseWhere, status: "PENDING" } }),
    prisma.invisibleWorkEntry.count({ where: { ...baseWhere, status: "APPROVED" } }),
    prisma.invisibleWorkEntry.count({ where: { ...baseWhere, status: "RETURNED" } }),
    prisma.invisibleWorkEntry.count({ where: { ...baseWhere, status: "REJECTED" } }),
    prisma.invisibleWorkEntry.findMany({
      where: baseWhere,
      orderBy: { updatedAt: "desc" },
      take: 4,
    }),
    prisma.invisibleWorkEntry.findMany({
      where: baseWhere,
      select: {
        id: true,
        createdAt: true,
        workDate: true,
        status: true,
        category: true,
        title: true,
        durationMinutes: true,
        isOutsideRole: true,
        clientId: true,
        clientName: true,
        client: { select: { name: true } },
      },
    }),
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { workRole: { select: { duties: { select: { text: true } } } } },
    }),
  ]);

  const monthlyData = buildMonthlyData(allEntries);

  type EntrySlice = typeof allEntries[number];

  const approvedEntries = allEntries.filter((e: EntrySlice) => e.status === "APPROVED");

  const approvedMinutes = approvedEntries.reduce((s: number, e: EntrySlice) => s + e.durationMinutes, 0);
  const approvedHours = Math.round((approvedMinutes / 60) * 10) / 10;

  const currentMonthMinutes = approvedEntries
    .filter((e: EntrySlice) => e.createdAt >= thirtyDaysAgo)
    .reduce((s: number, e: EntrySlice) => s + e.durationMinutes, 0);
  const prevMonthMinutes = approvedEntries
    .filter((e: EntrySlice) => e.createdAt >= sixtyDaysAgo && e.createdAt < thirtyDaysAgo)
    .reduce((s: number, e: EntrySlice) => s + e.durationMinutes, 0);
  const hoursHint = trendHint(currentMonthMinutes, prevMonthMinutes);

  const currentEntries = allEntries.filter((e: EntrySlice) => e.createdAt >= thirtyDaysAgo).length;
  const prevEntries = allEntries.filter(
    (e: EntrySlice) => e.createdAt >= sixtyDaysAgo && e.createdAt < thirtyDaysAgo
  ).length;
  const entriesHint = trendHint(currentEntries, prevEntries);

  const categoryMap = new Map<string, number>();
  for (const e of approvedEntries) {
    categoryMap.set(e.category, (categoryMap.get(e.category) ?? 0) + 1);
  }
  const categoryData = Array.from(categoryMap.entries())
    .map(([name, value], i) => ({ name: categoryLabel(name), value, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }))
    .sort((a, b) => b.value - a.value);

  const monthlyHours = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const mins = approvedEntries
      .filter((e: EntrySlice) => e.createdAt.getFullYear() === year && e.createdAt.getMonth() === month)
      .reduce((s: number, e: EntrySlice) => s + e.durationMinutes, 0);
    return { label: LV_MONTHS[month], value: Math.round((mins / 60) * 10) / 10 };
  });
  const bestMonthChart = monthlyHours.reduce((best, m) => (m.value > best.value ? m : best), monthlyHours[0]);

  // ── Streak (current) ──────────────────────────────────────────────────────
  const weeksSet = new Set(allEntries.map((e: EntrySlice) => isoWeekKey(e.workDate.toISOString().slice(0, 10))));
  let streak = 0;
  let streakMs = now.getTime();
  while (weeksSet.has(isoWeekKey(new Date(streakMs).toISOString().slice(0, 10)))) {
    streak++;
    streakMs -= 7 * 86400000;
  }

  // ── Best streak ever (personal record) ───────────────────────────────────
  const sortedWeekStarts = [...new Set(
    allEntries.map((e: EntrySlice) => weekStartMs(e.workDate.toISOString().slice(0, 10)))
  )].sort((a, b) => a - b);
  let bestStreak = sortedWeekStarts.length > 0 ? 1 : 0;
  let runLen = bestStreak;
  for (let i = 1; i < sortedWeekStarts.length; i++) {
    if (sortedWeekStarts[i] - sortedWeekStarts[i - 1] === 7 * 86400000) {
      runLen++;
      if (runLen > bestStreak) bestStreak = runLen;
    } else {
      runLen = 1;
    }
  }

  // ── Focus heatmap ─────────────────────────────────────────────────────────
  const nowDayUTC = now.getUTCDay();
  const daysSinceMon = (nowDayUTC + 6) % 7;
  const heatmapStartMs = now.getTime() - (daysSinceMon + 21) * 86400000;

  const dayCategories = new Map<string, Set<string>>();
  for (const e of approvedEntries) {
    const key = e.workDate.toISOString().slice(0, 10);
    if (!dayCategories.has(key)) dayCategories.set(key, new Set());
    dayCategories.get(key)!.add(e.category);
  }
  const focusDays = Array.from({ length: 28 }, (_, i) => {
    const key = new Date(heatmapStartMs + i * 86400000).toISOString().slice(0, 10);
    return { date: key, categories: dayCategories.get(key)?.size ?? 0, isFuture: key > todayStr };
  });

  // ── Role alignment ────────────────────────────────────────────────────────
  const duties = userWithRole?.workRole?.duties.map((d: { text: string }) => d.text) ?? [];
  const roleCount = { in_role: 0, extra: 0, no_role: 0 };
  for (const e of approvedEntries) {
    const wt = resolveWorkType(e.isOutsideRole, e.category, e.title, duties);
    roleCount[wt]++;
  }
  const totalRole = approvedEntries.length || 1;
  const inRolePct = Math.round((roleCount.in_role / totalRole) * 100);
  const extraPct = Math.round((roleCount.extra / totalRole) * 100);

  // ── Deep work this month ──────────────────────────────────────────────────
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const deepWork = approvedEntries.filter(
    (e: EntrySlice) => e.workDate >= monthStart && e.durationMinutes >= 60
  ).length;

  // ── Best month progress ───────────────────────────────────────────────────
  const monthlyMinMap = new Map<string, number>();
  for (const e of approvedEntries) {
    const d = e.workDate;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    monthlyMinMap.set(key, (monthlyMinMap.get(key) ?? 0) + e.durationMinutes);
  }
  const bestMonthMinutes = Array.from(monthlyMinMap.values()).reduce((max, v) => Math.max(max, v), 0);
  const bestMonthHoursAll = Math.round((bestMonthMinutes / 60) * 10) / 10;
  const thisMonthKey = `${now.getFullYear()}-${now.getMonth()}`;
  const thisMonthHours = Math.round(((monthlyMinMap.get(thisMonthKey) ?? 0) / 60) * 10) / 10;
  const bestProgress = bestMonthHoursAll > 0 ? Math.min(100, Math.round((thisMonthHours / bestMonthHoursAll) * 100)) : 0;

  // ── Invisibility score (0–100) ────────────────────────────────────────────
  const recentApproved = approvedEntries.filter((e: EntrySlice) => e.createdAt >= thirtyDaysAgo).length;
  const regularityScore = Math.min(streak / 5, 1) * 40;
  const volumeScore = Math.min(recentApproved / 10, 1) * 40;
  const depthScore = Math.min(deepWork / 3, 1) * 20;
  const invisibilityScore = Math.round(regularityScore + volumeScore + depthScore);
  const scoreLabel =
    invisibilityScore >= 81 ? "Izcils" :
    invisibilityScore >= 66 ? "Ļoti labs" :
    invisibilityScore >= 46 ? "Labs progress" :
    invisibilityScore >= 21 ? "Attīstās" :
    "Sāc veidot paradumu";
  const scoreStroke =
    invisibilityScore >= 76 ? "stroke-emerald-500" :
    invisibilityScore >= 46 ? "stroke-indigo-400" :
    "stroke-amber-400";
  const circ = 99.9;
  const scoreDash = (invisibilityScore / 100) * circ;

  // ── Day-of-week pattern ───────────────────────────────────────────────────
  const dowMinutes = Array(7).fill(0) as number[];
  for (const e of approvedEntries) {
    const dow = (e.workDate.getUTCDay() + 6) % 7; // Mon=0 … Sun=6
    dowMinutes[dow] += e.durationMinutes;
  }
  const maxDow = Math.max(1, ...dowMinutes);
  const peakDow = dowMinutes.indexOf(Math.max(...dowMinutes));

  // ── Client distribution ───────────────────────────────────────────────────
  const clientMinById = new Map<string, { name: string; minutes: number }>();
  const clientMinByName = new Map<string, { name: string; minutes: number }>();
  for (const e of approvedEntries) {
    if (e.clientId) {
      const existing = clientMinById.get(e.clientId);
      const name = existing?.name ?? (e.client?.name ?? e.clientName ?? e.clientId);
      clientMinById.set(e.clientId, { name, minutes: (existing?.minutes ?? 0) + e.durationMinutes });
    } else if (e.clientName) {
      const key = normalizeClientName(e.clientName);
      const existing = clientMinByName.get(key);
      clientMinByName.set(key, { name: existing?.name ?? e.clientName, minutes: (existing?.minutes ?? 0) + e.durationMinutes });
    }
  }
  const clientDist = [
    ...Array.from(clientMinById.values()),
    ...Array.from(clientMinByName.values()),
  ].sort((a, b) => b.minutes - a.minutes).slice(0, 5);
  const maxClientMin = clientDist[0]?.minutes ?? 1;

  // ── Today digest ──────────────────────────────────────────────────────────
  const todayEntries = allEntries.filter((e: EntrySlice) => e.workDate.toISOString().slice(0, 10) === todayStr);
  const todayDigest = {
    totalCount: todayEntries.length,
    totalMinutes: todayEntries.reduce((s: number, e: EntrySlice) => s + e.durationMinutes, 0),
    outsideRoleMinutes: todayEntries
      .filter((e: EntrySlice) => e.isOutsideRole)
      .reduce((s: number, e: EntrySlice) => s + e.durationMinutes, 0),
    entries: todayEntries.map((e: EntrySlice) => ({
      id: e.id,
      title: e.title,
      category: e.category,
      durationMinutes: e.durationMinutes,
    })),
  };

  return (
    <>
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-foreground/50 dark:text-white/40">
            Pārskats
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Mans darba pārskats</h1>
          <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">
            Šeit jūs varat iesniegt neredzamo darbu un sekot līdzi savu ierakstu statusam.
          </p>
        </div>
        <Button asChild>
          <Link href="/employee/new-entry">
            <PlusCircle className="h-4 w-4" />
            Jauns ieraksts
          </Link>
        </Button>
      </div>

      <Card className="mb-8 overflow-hidden">
        <CardContent className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/30 dark:border-white/[0.1] dark:bg-white/[0.035]">
              <Image src="/shadowy.svg" alt="" width={25} height={25} className="invert dark:invert-0" />
            </div>
            <div>
              <h2 className="font-semibold">Shadowy AI ieraksts</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                Apraksti vai ierunā, kas šodien aizņēma papildu laiku, un pārskati Shadowy AI izveidotos melnrakstus.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="relative shrink-0">
            <Link href="/employee/smart-log">
              Atvērt Shadowy AI
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <DailyDigestCard {...todayDigest} />

      {/* ── Status KPIs ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
        <KpiCard formal label="Gaida izskatīšanu" value={pendingCount} icon={<Clock className="h-5 w-5" />} />
        <KpiCard formal label="Apstiprināti" value={approvedCount} hint={entriesHint} icon={<CheckCircle2 className="h-5 w-5" />} />
        <KpiCard formal label="Apstiprinātās stundas" value={`${approvedHours}h`} hint={hoursHint} icon={<Timer className="h-5 w-5" />} />
        <KpiCard formal label="Atpakaļ / Noraidīti" value={`${returnedCount} / ${rejectedCount}`} icon={<RotateCcw className="h-5 w-5" />} />
      </div>

      {/* ── Personal analytics KPIs ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Invisibility score */}
        <div className="glass rounded-xl border border-border bg-card p-5 text-card-foreground dark:border-white/[0.08] dark:bg-gradient-to-b dark:from-white/[0.05] dark:via-white/[0.03] dark:to-white/[0.01] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_40px_-16px_rgba(0,0,0,0.6)]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm text-muted-foreground">Neredzamais ieguldījums</div>
              <div className="mt-1.5 text-3xl font-bold tracking-tight tabular-nums">{invisibilityScore}</div>
              <div className="mt-1 text-xs text-muted-foreground">{scoreLabel}</div>
            </div>
            <svg viewBox="0 0 36 36" className="h-14 w-14 shrink-0 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="2.8" stroke="currentColor" className="text-muted/30" />
              <circle
                cx="18" cy="18" r="15.9" fill="none" strokeWidth="2.8" stroke="currentColor"
                strokeDasharray={`${scoreDash} ${circ - scoreDash}`}
                strokeLinecap="round"
                className={scoreStroke}
              />
            </svg>
          </div>
        </div>

        {/* Streak + best */}
        <KpiCard
          formal
          label="Nedēļu sērija"
          value={streak === 0 ? "—" : String(streak)}
          hint={
            streak === 0 ? "Pievieno ierakstu šonedēļ" :
            streak === bestStreak && streak > 1 ? "Personīgais rekords!" :
            bestStreak > streak ? `Rekords: ${bestStreak} ned.` :
            `${streak} ned. pēc kārtas`
          }
          icon={<Flame className="h-5 w-5" />}
        />

        {/* Deep work */}
        <KpiCard
          formal
          label="Dziļā darba bloki"
          value={deepWork === 0 ? "—" : String(deepWork)}
          hint="Ieraksti ≥ 60 min šomēnesī"
          icon={<Zap className="h-5 w-5" />}
        />

        {/* Best month progress */}
        <div className="glass rounded-xl border border-border bg-card p-5 text-card-foreground dark:border-white/[0.08] dark:bg-gradient-to-b dark:from-white/[0.05] dark:via-white/[0.03] dark:to-white/[0.01] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_40px_-16px_rgba(0,0,0,0.6)]">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground [&>svg]:h-4 [&>svg]:w-4 dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-white/70">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="text-sm text-muted-foreground">Labākais mēnesis</div>
          <div className="mt-1.5 text-3xl font-bold tracking-tight tabular-nums">{thisMonthHours}h</div>
          {bestMonthHoursAll > 0 ? (
            <>
              <div className="mt-2.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500/80" style={{ width: `${bestProgress}%` }} />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{bestProgress}% no rekorda ({bestMonthHoursAll}h)</div>
            </>
          ) : (
            <div className="mt-1.5 text-xs text-muted-foreground">Pievieno ierakstus, lai redzētu progresu</div>
          )}
        </div>
      </div>

      <SectionDivider label="Aktivitāte" />

      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        <ActivityChart title="Mana aktivitāte (pēdējie 6 mēneši)" data={monthlyData} />
        <WorkTypeChart title="Apstiprinātie ieraksti pēc kategorijas" data={categoryData} />
      </div>

      {approvedHours > 0 && (
        <div className="mb-8">
          <HoursTrendChart
            title="Apstiprinātās stundas pa mēnešiem"
            data={monthlyHours}
            badge={
              bestMonthChart.value > 0 ? (
                <>Labākais mēnesis: <span className="font-medium text-foreground">{bestMonthChart.label} ({bestMonthChart.value}h)</span></>
              ) : undefined
            }
          />
        </div>
      )}

      {/* ── Focus analysis ── */}
      <SectionDivider label="Fokusa analīze" />

      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        <Card>
          <CardContent className="p-5">
            <div className="text-sm font-semibold mb-1">Kontekstu maiņa</div>
            <p className="text-xs text-muted-foreground mb-4">
              Krāsa parāda, cik kategorijās tu strādāji vienā dienā. Jo vairāk — jo izkaisītāks fokuss.
            </p>
            <FocusHeatmap days={focusDays} />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="flex-1">
            <CardContent className="p-5">
              <div className="text-sm font-semibold mb-1">Darba sadalījums pēc lomas</div>
              <p className="text-xs text-muted-foreground mb-4">
                Cik daudz no taviem apstiprinātajiem ierakstiem ietilpst tavā officiālajā lomā.
              </p>
              {approvedEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nav datu.</p>
              ) : (
                <div className="space-y-3">
                  {[
                    { label: "Ietilpst lomā", pct: inRolePct, count: roleCount.in_role, color: "bg-emerald-500" },
                    { label: "Papildu ieguldījums", pct: extraPct, count: roleCount.extra, color: "bg-indigo-500" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-3">
                      <div className="w-36 shrink-0 text-sm">{row.label}</div>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${row.color}`} style={{ width: `${row.pct}%` }} />
                      </div>
                      <div className="w-14 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                        {row.pct}% <span className="opacity-60">({row.count})</span>
                      </div>
                    </div>
                  ))}
                  {duties.length === 0 && (
                    <p className="text-xs text-muted-foreground pt-1">
                      Lai redzētu precīzu sadalījumu, lūdz vadītāju piešķirt tev lomu.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardContent className="p-5">
              <div className="text-sm font-semibold mb-1">Aktīvākā nedēļas diena</div>
              <p className="text-xs text-muted-foreground mb-4">
                {approvedEntries.length > 0
                  ? `Visvairāk strādā ${["pirmdienās", "otrdienās", "trešdienās", "ceturtdienās", "piektdienās", "sestdienās", "svētdienās"][peakDow]}.`
                  : "Nav datu."}
              </p>
              {approvedEntries.length > 0 && (
                <div className="flex items-end gap-1.5 h-16">
                  {dowMinutes.map((mins, i) => {
                    const pct = Math.max((mins / maxDow) * 100, mins > 0 ? 4 : 0);
                    const isPeak = i === peakDow;
                    return (
                      <div key={i} className="flex flex-1 flex-col items-center gap-1">
                        <div className="w-full flex items-end" style={{ height: "44px" }}>
                          <div
                            title={`${LV_DAYS[i]}: ${Math.round((mins / 60) * 10) / 10}h`}
                            className={`w-full rounded-t transition-colors ${isPeak ? "bg-emerald-500/80" : "bg-muted-foreground/25"}`}
                            style={{ height: `${pct}%` }}
                          />
                        </div>
                        <div className={`text-[10px] ${isPeak ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                          {LV_DAYS[i]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Client distribution ── */}
      {clientDist.length > 0 && (
        <>
          <SectionDivider label="Mani klienti" />
          <Card className="mb-8">
            <CardContent className="p-5">
              <div className="text-sm font-semibold mb-1">Laika sadalījums pa klientiem</div>
              <p className="text-xs text-muted-foreground mb-5">
                Cik daudz apstiprinātā darba laika devies katram klientam kopumā.
              </p>
              <div className="space-y-3">
                {clientDist.map((c) => {
                  const pct = Math.round((c.minutes / maxClientMin) * 100);
                  const hours = Math.round((c.minutes / 60) * 10) / 10;
                  return (
                    <div key={c.name} className="flex items-center gap-3">
                      <div className="w-36 shrink-0 text-sm truncate" title={c.name}>{c.name}</div>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-indigo-500/70" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="w-14 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                        {hours}h
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <SectionDivider label="Pēdējie ieraksti" />

      <div className="mb-4 flex items-center justify-end">
        <Link href="/employee/history" className="text-sm font-medium underline-offset-4 hover:underline">
          Skatīt visu vēsturi →
        </Link>
      </div>

      {recent.length === 0 ? (
        <EmptyState
          title="Vēl nav iesniegtu ierakstu"
          description="Iesāciet ar pirmo neredzamā darba ierakstu - tas aizņems mazāk nekā minūti."
          action={
            <Button asChild>
              <Link href="/employee/new-entry">Iesniegt pirmo ierakstu</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {recent.map((e: any) => (
            <EntryCard
              key={e.id}
              title={e.title}
              category={e.category}
              description={e.description}
              clientName={e.clientName}
              workDate={e.workDate}
              durationMinutes={e.durationMinutes}
              status={e.status}
              managerComment={e.managerComment}
              footer={
                e.status === "PENDING" || e.status === "RETURNED" ? (
                  <EmployeeEntryActions
                    entryId={e.id}
                    title={e.title}
                    category={e.category}
                    description={e.description}
                    workDate={e.workDate.toISOString().slice(0, 10)}
                    durationMinutes={e.durationMinutes}
                  />
                ) : null
              }
            />
          ))}
        </div>
      )}
    </>
  );
}
