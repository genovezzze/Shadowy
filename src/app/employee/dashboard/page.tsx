import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { WorkTypeChart } from "@/components/dashboard/work-type-chart";
import { HoursTrendChart } from "@/components/dashboard/hours-trend-chart";
import { FocusHeatmap } from "@/components/dashboard/focus-heatmap";
import { EntryCard } from "@/components/entries/entry-card";
import { EmptyState } from "@/components/ui/empty-state";
import { BadgeCheck, Building2, CalendarDays, CheckCircle2, Clock, Copy, Flame, RotateCcw, Shuffle, Sparkles, Timer, TrendingUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { APPLE_CARD_LABEL, APPLE_FILL, APPLE_PILL, APPLE_PRIMARY_BUTTON, APPLE_SEPARATOR, METRIC_SURFACE, METRIC_TINTS, TINT_FILL, TINT_TILE , QUIET_LABEL} from "@/components/dashboard/apple";
import { StatTile } from "@/components/dashboard/stat-tile";
import { OverviewSections, type OverviewSection } from "@/components/dashboard/overview-sections";
import { categoriesForUser } from "@/lib/smart-log-server";
import { EmployeeEntryActions } from "@/components/entries/employee-entry-actions";
import { AddTimeButton } from "@/components/entries/add-time-button";
import { EditEntryButton } from "@/components/entries/edit-entry-button";
import { DeleteEntryButton } from "@/components/entries/delete-entry-button";
import { resolveWorkType } from "@/lib/work-type";
import { normalizeClientName } from "@/lib/client-name";
import { DailyDigestCard } from "@/components/dashboard/daily-digest-card";
import { CategoryMatrix, type MatrixAxis } from "@/components/dashboard/category-matrix";
import { categoryLabel, normalizeCategoryKey } from "@/lib/work-insights";

const LV_MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jūn", "Jūl", "Aug", "Sep", "Okt", "Nov", "Dec"];
const LV_DAYS = ["P", "O", "T", "C", "Pk", "S", "Sv"];

function buildMonthlyData(entries: { workDate: Date }[]) {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    // Group by workDate (when the work was done), not createdAt (when it was
    // logged) - a bookkeeper often logs work on a later day, so createdAt would
    // put hours in the wrong month.
    const count = entries.filter(
      (e) => e.workDate.getFullYear() === year && e.workDate.getMonth() === month
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
  const categories = await categoriesForUser(session.userId);

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
      include: { helpedUser: { select: { name: true } } },
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
      select: { workRole: { select: { duties: { select: { text: true } } } }, canSeeAllClients: true },
    }),
  ]);

  const editableClients = await prisma.client.findMany({
    where: {
      organizationId: session.organizationId,
      status: "active",
      ...(userWithRole?.canSeeAllClients
        ? {}
        : { assignments: { some: { employeeId: session.userId } } }),
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const monthlyData = buildMonthlyData(allEntries);

  type EntrySlice = typeof allEntries[number];

  const approvedEntries = allEntries.filter((e: EntrySlice) => e.status === "APPROVED");

  const approvedMinutes = approvedEntries.reduce((s: number, e: EntrySlice) => s + e.durationMinutes, 0);
  const approvedHours = Math.round((approvedMinutes / 60) * 10) / 10;

  // Period stats are based on workDate (when the work happened), not createdAt
  // (when it was entered), so the hours line up with what the employee did.
  const currentMonthMinutes = approvedEntries
    .filter((e: EntrySlice) => e.workDate >= thirtyDaysAgo)
    .reduce((s: number, e: EntrySlice) => s + e.durationMinutes, 0);
  const prevMonthMinutes = approvedEntries
    .filter((e: EntrySlice) => e.workDate >= sixtyDaysAgo && e.workDate < thirtyDaysAgo)
    .reduce((s: number, e: EntrySlice) => s + e.durationMinutes, 0);
  const hoursHint = trendHint(currentMonthMinutes, prevMonthMinutes);

  const currentEntries = allEntries.filter((e: EntrySlice) => e.workDate >= thirtyDaysAgo).length;
  const prevEntries = allEntries.filter(
    (e: EntrySlice) => e.workDate >= sixtyDaysAgo && e.workDate < thirtyDaysAgo
  ).length;
  const entriesHint = trendHint(currentEntries, prevEntries);

  const categoryMap = new Map<string, number>();
  for (const e of approvedEntries) {
    const key = normalizeCategoryKey(e.category);
    categoryMap.set(key, (categoryMap.get(key) ?? 0) + 1);
  }
  const categoryData = Array.from(categoryMap.entries())
    .map(([name, value], i) => ({ name: categoryLabel(name), value, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }))
    .sort((a, b) => b.value - a.value);

  const monthlyHours = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const mins = approvedEntries
      .filter((e: EntrySlice) => e.workDate.getFullYear() === year && e.workDate.getMonth() === month)
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

  // ── Personal matrices: category × client, category × month ──────────────
  const categoryMinutesMap = new Map<string, number>();
  for (const e of approvedEntries) {
    const key = normalizeCategoryKey(e.category);
    categoryMinutesMap.set(key, (categoryMinutesMap.get(key) ?? 0) + e.durationMinutes);
  }
  const categoryAxis: MatrixAxis[] = Array.from(categoryMinutesMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => ({ key, label: categoryLabel(key) }));

  const clientKeyed = new Map<string, { label: string; minutes: number }>();
  for (const e of approvedEntries) {
    let key: string | null = null;
    let label = "";
    if (e.clientId) {
      key = `id:${e.clientId}`;
      label = e.client?.name ?? e.clientName ?? e.clientId;
    } else if (e.clientName) {
      key = `name:${normalizeClientName(e.clientName)}`;
      label = e.clientName;
    }
    if (!key) continue;
    const cur = clientKeyed.get(key) ?? { label, minutes: 0 };
    cur.minutes += e.durationMinutes;
    clientKeyed.set(key, cur);
  }
  const clientAxis: MatrixAxis[] = Array.from(clientKeyed.entries())
    .sort((a, b) => b[1].minutes - a[1].minutes)
    .map(([key, v]) => ({ key, label: v.label }));

  const catClientMinutes: Record<string, Record<string, number>> = {};
  for (const e of approvedEntries) {
    let key: string | null = null;
    if (e.clientId) key = `id:${e.clientId}`;
    else if (e.clientName) key = `name:${normalizeClientName(e.clientName)}`;
    if (!key || !clientAxis.some((c) => c.key === key)) continue;
    const catKey = normalizeCategoryKey(e.category);
    catClientMinutes[catKey] ??= {};
    catClientMinutes[catKey][key] = (catClientMinutes[catKey][key] ?? 0) + e.durationMinutes;
  }

  const monthAxis: MatrixAxis[] = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: LV_MONTHS[d.getMonth()] };
  });
  const catMonthMinutes: Record<string, Record<string, number>> = {};
  for (const e of approvedEntries) {
    const catKey = normalizeCategoryKey(e.category);
    const d = e.workDate;
    const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
    if (!monthAxis.some((m) => m.key === monthKey)) continue;
    catMonthMinutes[catKey] ??= {};
    catMonthMinutes[catKey][monthKey] = (catMonthMinutes[catKey][monthKey] ?? 0) + e.durationMinutes;
  }

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

  // Blocks inside a section sit in one column with an even gap.
  const stack = "flex flex-col gap-3 [&>*]:!mb-0 [&>*]:!mt-0";

  // ── Kopsavilkums ──
  const summaryContent = (
    <div className={stack}>
      <DailyDigestCard {...todayDigest} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile quiet tint="neutral" icon={<Clock />} title="Gaida izskatīšanu" value={pendingCount} />
        <StatTile quiet tint="neutral" icon={<CheckCircle2 />} title="Apstiprināti" value={approvedCount} description={entriesHint} />
        <StatTile quiet tint="neutral" icon={<Timer />} title="Apstiprinātās stundas" value={`${approvedHours}h`} description={hoursHint} />
        <StatTile quiet tint="neutral" icon={<RotateCcw />} title="Atpakaļ / Noraidīti" value={`${returnedCount} / ${rejectedCount}`} />
        <StatTile quiet tint="neutral" icon={<Sparkles />} title="Neredzamais ieguldījums" value={invisibilityScore} description={scoreLabel}>
          <div className={cn("mt-3 h-1.5 overflow-hidden rounded-full", APPLE_FILL)}>
            <div className={cn("h-full rounded-full", TINT_FILL.blue)} style={{ width: `${invisibilityScore}%` }} />
          </div>
        </StatTile>
        <StatTile
          quiet
          tint="neutral"
          icon={<Flame />}
          title="Nedēļu sērija"
          value={streak === 0 ? "-" : String(streak)}
          description={
            streak === 0 ? "Pievieno ierakstu šonedēļ" :
            streak === bestStreak && streak > 1 ? "Personīgais rekords" :
            bestStreak > streak ? `Rekords: ${bestStreak} ned.` :
            `${streak} ned. pēc kārtas`
          }
        />
        <StatTile
          quiet
          tint="neutral"
          icon={<Zap />}
          title="Dziļā darba bloki"
          value={deepWork === 0 ? "-" : String(deepWork)}
          description="Ieraksti ≥ 60 min šomēnesī"
        />
        <StatTile
          quiet
          tint="neutral"
          icon={<TrendingUp />}
          title="Labākais mēnesis"
          value={`${bestMonthHoursAll}h`}
          description={bestMonthHoursAll > 0 ? `Šomēnes: ${thisMonthHours}h (${bestProgress}% no rekorda)` : "Pievieno ierakstus, lai redzētu progresu"}
        >
          {bestMonthHoursAll > 0 && (
            <div className={cn("mt-3 h-1.5 overflow-hidden rounded-full", APPLE_FILL)}>
              <div className={cn("h-full rounded-full", TINT_FILL.green)} style={{ width: `${bestProgress}%` }} />
            </div>
          )}
        </StatTile>
      </div>
    </div>
  );

  // ── Aktivitāte ──
  const activityContent = (
    <div className={stack}>
      <div className="grid gap-3 lg:grid-cols-2">
        <ActivityChart tint="green" iconTint="neutral" quietLabel title="Mana aktivitāte (pēdējie 6 mēneši)" data={monthlyData} />
        <WorkTypeChart title="Apstiprinātie ieraksti pēc kategorijas" data={categoryData} />
      </div>
      {approvedHours > 0 && (
        <HoursTrendChart
          tint="blue"
          iconTint="neutral"
          quietLabel
          title="Apstiprinātās stundas pa mēnešiem"
          data={monthlyHours}
          badge={
            bestMonthChart.value > 0 ? (
              <>Labākais mēnesis: <span className="font-medium text-foreground">{bestMonthChart.label} ({bestMonthChart.value}h)</span></>
            ) : undefined
          }
        />
      )}
    </div>
  );

  // ── Fokuss ──
  const focusContent = (
    <div className="grid gap-3 lg:grid-cols-2">
      <div className={cn(METRIC_SURFACE, "p-5")}>
        <div className={cn(APPLE_CARD_LABEL, TINT_TILE.neutral, QUIET_LABEL)}>
          <Shuffle />
          Kontekstu maiņa
        </div>
        <p className="mb-4 mt-2 text-[13px] text-muted-foreground">
          Krāsa parāda, cik kategorijās tu strādāji vienā dienā. Jo vairāk - jo izkaisītāks fokuss.
        </p>
        <FocusHeatmap days={focusDays} />
      </div>

      <div className="flex flex-col gap-3">
        <div className={cn(METRIC_SURFACE, "flex-1 p-5")}>
          <div className={cn(APPLE_CARD_LABEL, TINT_TILE.neutral, QUIET_LABEL)}>
            <BadgeCheck />
            Darba sadalījums pēc lomas
          </div>
          <p className="mb-4 mt-2 text-[13px] text-muted-foreground">
            Cik daudz no taviem apstiprinātajiem ierakstiem ietilpst tavā oficiālajā lomā.
          </p>
          {approvedEntries.length === 0 ? (
            <p className="text-[14px] text-muted-foreground">Nav datu.</p>
          ) : (
            <div className="space-y-3">
              {[
                { label: "Ietilpst lomā", pct: inRolePct, count: roleCount.in_role, color: TINT_FILL.green },
                { label: "Papildu ieguldījums", pct: extraPct, count: roleCount.extra, color: TINT_FILL.indigo },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <div className="w-36 shrink-0 text-[14px]">{row.label}</div>
                  <div className={cn("h-1.5 flex-1 overflow-hidden rounded-full", APPLE_FILL)}>
                    <div className={cn("h-full rounded-full", row.color)} style={{ width: `${row.pct}%` }} />
                  </div>
                  <div className="w-16 shrink-0 text-right text-[13px] tabular-nums text-muted-foreground">
                    {row.pct}% <span className="opacity-60">({row.count})</span>
                  </div>
                </div>
              ))}
              {duties.length === 0 && (
                <p className="pt-1 text-[13px] text-muted-foreground">
                  Lai redzētu precīzu sadalījumu, lūdz vadītāju piešķirt tev lomu.
                </p>
              )}
            </div>
          )}
        </div>

        <div className={cn(METRIC_SURFACE, "flex-1 p-5")}>
          <div className={cn(APPLE_CARD_LABEL, TINT_TILE.neutral, QUIET_LABEL)}>
            <CalendarDays />
            Aktīvākā nedēļas diena
          </div>
          <p className="mb-4 mt-2 text-[13px] text-muted-foreground">
            {approvedEntries.length > 0
              ? `Visvairāk strādā ${["pirmdienās", "otrdienās", "trešdienās", "ceturtdienās", "piektdienās", "sestdienās", "svētdienās"][peakDow]}.`
              : "Nav datu."}
          </p>
          {approvedEntries.length > 0 && (
            <div className="flex h-16 items-end gap-1.5">
              {dowMinutes.map((mins, i) => {
                const pct = Math.max((mins / maxDow) * 100, mins > 0 ? 4 : 0);
                const isPeak = i === peakDow;
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex w-full items-end" style={{ height: "44px" }}>
                      <div
                        title={`${LV_DAYS[i]}: ${Math.round((mins / 60) * 10) / 10}h`}
                        className={cn("w-full rounded-md transition-colors", isPeak ? TINT_FILL.blue : APPLE_FILL)}
                        style={{ height: `${pct}%` }}
                      />
                    </div>
                    <div className={cn("text-[12px]", isPeak ? "font-semibold text-foreground" : "text-muted-foreground")}>
                      {LV_DAYS[i]}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ── Mani klienti ──
  const clientsContent = clientDist.length > 0 && (
    <div className={cn(METRIC_SURFACE, "p-5")}>
      <div className={cn(APPLE_CARD_LABEL, TINT_TILE.neutral, QUIET_LABEL)}>
        <Building2 />
        Laika sadalījums pa klientiem
      </div>
      <p className="mb-5 mt-2 text-[13px] text-muted-foreground">
        Cik daudz apstiprinātā darba laika devies katram klientam kopumā.
      </p>
      <div className="space-y-3">
        {clientDist.map((c) => {
          const pct = Math.round((c.minutes / maxClientMin) * 100);
          const hours = Math.round((c.minutes / 60) * 10) / 10;
          return (
            <div key={c.name} className="flex items-center gap-3">
              <div className="w-40 shrink-0 truncate text-[14px]" title={c.name}>{c.name}</div>
              <div className={cn("h-1.5 flex-1 overflow-hidden rounded-full", APPLE_FILL)}>
                <div className={cn("h-full rounded-full", TINT_FILL.indigo)} style={{ width: `${pct}%` }} />
              </div>
              <div className="w-14 shrink-0 text-right text-[13px] tabular-nums text-muted-foreground">
                {hours}h
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── Kategorijas dziļumā ──
  const categoriesContent = categoryAxis.length > 0 && (
    <div className={stack}>
      {clientAxis.length > 0 && (
        <CategoryMatrix
          title="Kategorija × Klients"
          description="Kurš klients dod visvairāk katras kategorijas darba tieši tev."
          rows={categoryAxis}
          cols={clientAxis}
          minutes={catClientMinutes}
          unit="klientus"
        />
      )}
      <CategoryMatrix
        title="Kategorija × Mēnesis"
        description="Kā tavs fokuss pa kategorijām mainījies pēdējo 6 mēnešu laikā."
        rows={categoryAxis}
        cols={monthAxis}
        minutes={catMonthMinutes}
        previewCols={12}
        previewRows={99}
      />
    </div>
  );

  // ── Pēdējie ieraksti ──
  const recentContent = (
    <div className={stack}>
      <div className="flex justify-end">
        <Link href="/employee/history" className={cn("text-[14px] font-medium hover:underline", METRIC_TINTS.blue)}>
          Skatīt visu vēsturi
        </Link>
      </div>
      {recent.length === 0 ? (
        <div className={cn(METRIC_SURFACE, "p-8")}>
          <EmptyState
            title="Vēl nav iesniegtu ierakstu"
            description="Iesāciet ar pirmo darba ierakstu - tas aizņems mazāk nekā minūti."
            action={
              <Link href="/employee/new-entry" className={APPLE_PRIMARY_BUTTON}>
                Iesniegt pirmo ierakstu
              </Link>
            }
          />
        </div>
      ) : (
        recent.map((e: any) => (
          <EntryCard
            apple
            key={e.id}
            title={e.title}
            category={e.category}
            description={e.description}
            clientName={e.clientName ?? e.client?.name ?? undefined}
            workDate={e.workDate}
            createdAt={e.createdAt}
            durationMinutes={e.durationMinutes}
            status={e.status}
            managerComment={e.managerComment}
            helpedColleague={e.helpedColleague}
            helpedName={e.helpedUser?.name}
            footer={
              <div className="flex flex-wrap items-center gap-2">
                {e.status === "PENDING" || e.status === "RETURNED" ? (
                  <EmployeeEntryActions
                    entryId={e.id}
                    title={e.title}
                    category={e.category}
                    description={e.description}
                    workDate={e.workDate.toISOString().slice(0, 10)}
                    durationMinutes={e.durationMinutes}
                    clients={editableClients}
                    clientId={e.clientId}
                    clientName={e.clientName}
                    categories={categories}
                  />
                ) : e.status === "APPROVED" ? (
                  <>
                    <AddTimeButton entryId={e.id} />
                    <EditEntryButton
                      entryId={e.id}
                      title={e.title}
                      category={e.category}
                      description={e.description}
                      workDate={e.workDate.toISOString().slice(0, 10)}
                      durationMinutes={e.durationMinutes}
                      clients={editableClients}
                      clientId={e.clientId}
                      clientName={e.clientName}
                      categories={categories}
                    />
                    <DeleteEntryButton entryId={e.id} />
                  </>
                ) : null}
                <Link href={`/employee/new-entry?copyFrom=${e.id}`} className={APPLE_PILL}>
                  <Copy className="h-3.5 w-3.5" />
                  Kopēt
                </Link>
              </div>
            }
          />
        ))
      )}
    </div>
  );

  const sections: OverviewSection[] = [
    {
      key: "summary",
      label: "Kopsavilkums",
      count: 9,
      keywords: "Šodien Gaida izskatīšanu Apstiprināti stundas Atpakaļ Noraidīti Neredzamais ieguldījums Nedēļu sērija Dziļā darba bloki Labākais mēnesis",
      content: summaryContent,
    },
    {
      key: "activity",
      label: "Aktivitāte",
      count: 2 + (approvedHours > 0 ? 1 : 0),
      keywords: "Mana aktivitāte kategorijas stundas pa mēnešiem",
      content: activityContent,
    },
    {
      key: "focus",
      label: "Fokuss",
      count: 3,
      keywords: "Kontekstu maiņa Darba sadalījums pēc lomas Aktīvākā nedēļas diena",
      content: focusContent,
    },
    ...(clientsContent
      ? [{ key: "clients", label: "Klienti", count: 1, keywords: "Laika sadalījums pa klientiem", content: clientsContent }]
      : []),
    ...(categoriesContent
      ? [{
          key: "categories",
          label: "Kategorijas",
          count: clientAxis.length > 0 ? 2 : 1,
          keywords: "Kategorija Klients Mēnesis",
          content: categoriesContent,
        }]
      : []),
    {
      key: "entries",
      label: "Ieraksti",
      count: recent.length,
      keywords: "Pēdējie ieraksti vēsture",
      content: recentContent,
    },
  ];

  return (
    <>
      <h1 className="sr-only">Mans darba pārskats</h1>


      <OverviewSections quiet sections={sections} />
    </>
  );
}
