import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { WorkTypeChart } from "@/components/dashboard/work-type-chart";
import { HoursChart } from "@/components/dashboard/hours-chart";
import { EntryCard } from "@/components/entries/entry-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { Clock, Users, CheckCircle2, FileText, Timer, TrendingUp, AlertTriangle } from "lucide-react";
import { classifyWorkType } from "@/lib/work-type";
import { PeriodTabs } from "@/components/dashboard/period-tabs";
import { SectionDivider } from "@/components/dashboard/section-divider";

function getPeriodStart(period: string): Date | undefined {
  const now = new Date();
  if (period === "7d") return new Date(now.getTime() - 7 * 86400000);
  if (period === "30d") return new Date(now.getTime() - 30 * 86400000);
  if (period === "90d") return new Date(now.getTime() - 90 * 86400000);
  return undefined;
}

function buildWeeklyData(entries: { createdAt: Date }[]) {
  const now = new Date();
  return Array.from({ length: 8 }, (_, i) => {
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() - i * 7);
    weekEnd.setHours(23, 59, 59, 999);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);
    const count = entries.filter(
      (e) => e.createdAt >= weekStart && e.createdAt <= weekEnd
    ).length;
    const d = weekStart.getDate().toString().padStart(2, "0");
    const m = (weekStart.getMonth() + 1).toString().padStart(2, "0");
    return { label: `${d}.${m}`, value: count };
  }).reverse();
}

export default async function ManagerDashboard({
  searchParams,
}: {
  searchParams: { period?: string };
}) {
  const session = await requireUser(["MANAGER"]);
  const orgId = session.organizationId;
  const managerId = session.userId;
  const period = searchParams?.period ?? "all";
  const periodStart = getPeriodStart(period);
  const periodFilter = periodStart ? { gte: periodStart } : undefined;

  const eightWeeksAgo = new Date(Date.now() - 8 * 7 * 24 * 60 * 60 * 1000);

  const [team, totalEntries, pending, approved, recentPending, weeklyRaw, approvedDetailed, reviewedEntries] =
    await Promise.all([
      prisma.user.count({ where: { organizationId: orgId, managerId } }),
      prisma.invisibleWorkEntry.count({
        where: { organizationId: orgId, managerId, ...(periodFilter ? { createdAt: periodFilter } : {}) },
      }),
      prisma.invisibleWorkEntry.count({
        where: { organizationId: orgId, managerId, status: "PENDING" },
      }),
      prisma.invisibleWorkEntry.count({
        where: { organizationId: orgId, managerId, status: "APPROVED", ...(periodFilter ? { createdAt: periodFilter } : {}) },
      }),
      prisma.invisibleWorkEntry.findMany({
        where: { organizationId: orgId, managerId, status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { employee: true },
      }),
      prisma.invisibleWorkEntry.findMany({
        where: { organizationId: orgId, managerId, createdAt: { gte: eightWeeksAgo } },
        select: { createdAt: true },
      }),
      prisma.invisibleWorkEntry.findMany({
        where: {
          organizationId: orgId, managerId, status: "APPROVED",
          ...(periodFilter ? { createdAt: periodFilter } : {}),
        },
        select: {
          category: true,
          title: true,
          durationMinutes: true,
          employee: {
            select: {
              id: true,
              name: true,
              workRole: { select: { duties: { select: { text: true } } } },
            },
          },
        },
      }),
      // All reviewed entries (not filtered by period) for overall avg review time
      prisma.invisibleWorkEntry.findMany({
        where: { organizationId: orgId, managerId, status: { in: ["APPROVED", "REJECTED", "RETURNED"] } },
        select: { createdAt: true, updatedAt: true },
      }),
    ]);

  // Avg review time in days
  const avgReviewMs =
    reviewedEntries.length > 0
      ? reviewedEntries.reduce((s, e) => s + (e.updatedAt.getTime() - e.createdAt.getTime()), 0) /
        reviewedEntries.length
      : null;
  const avgReviewDays = avgReviewMs !== null ? Math.round((avgReviewMs / 86400000) * 10) / 10 : null;
  const reviewHint =
    avgReviewDays === null ? undefined :
    avgReviewDays <= 1 ? "Lieliski!" :
    avgReviewDays <= 3 ? "Labs temps" : "Vērts uzlabot";

  const weeklyData = buildWeeklyData(weeklyRaw);

  const workTypeCount = { in_role: 0, extra: 0, no_role: 0 };
  const employeeMap = new Map<string, { name: string; minutes: number; entries: number }>();
  const categoryCount = new Map<string, number>();

  for (const e of approvedDetailed) {
    const duties = e.employee.workRole?.duties.map((d: { text: string }) => d.text) ?? [];
    const wt = classifyWorkType(e.category, e.title, duties);
    workTypeCount[wt]++;

    const emp = employeeMap.get(e.employee.id);
    if (emp) {
      emp.minutes += e.durationMinutes;
      emp.entries++;
    } else {
      employeeMap.set(e.employee.id, { name: e.employee.name, minutes: e.durationMinutes, entries: 1 });
    }

    categoryCount.set(e.category, (categoryCount.get(e.category) ?? 0) + 1);
  }

  const workTypeData = [
    { name: "Ietilpst lomā", value: workTypeCount.in_role, color: "#10b981" },
    { name: "Papildu ieguldījums", value: workTypeCount.extra, color: "#6366f1" },
    { name: "Bez lomas", value: workTypeCount.no_role, color: "#6b7280" },
  ];

  const teamData = Array.from(employeeMap.values())
    .map(({ name, minutes, entries }) => ({ name, entries, hours: Math.round((minutes / 60) * 10) / 10 }))
    .sort((a, b) => b.hours - a.hours);

  const teamAvgHours =
    teamData.length > 0 ? teamData.reduce((s, e) => s + e.hours, 0) / teamData.length : 0;

  const hoursData = teamData.slice(0, 8).map(({ name, hours }) => ({
    name: name.split(" ")[0],
    hours,
  }));

  const topCategories = Array.from(categoryCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const totalApproved = approvedDetailed.length;

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
            Komandas pārskats
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">
            Šeit redzat savas komandas neredzamā darba pārskatu. Lūdzu, izskatiet ierakstus, kas gaida apstiprinājumu.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <PeriodTabs current={period} className="w-full sm:w-auto" />
          <Button asChild className="w-full whitespace-nowrap sm:w-auto">
            <Link href="/manager/entries">Skatīt visus ierakstus</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        <KpiCard formal label="Komandā darbinieku" value={team} icon={<Users className="h-5 w-5" />} />
        <KpiCard
          formal
          label="Gaida apstiprinājumu"
          value={pending}
          icon={<Clock className="h-5 w-5" />}
        />
        <KpiCard
          formal
          label="Apstiprināti"
          value={approved}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <KpiCard formal label="Ieraksti kopā" value={totalEntries} icon={<FileText className="h-5 w-5" />} />
        <KpiCard
          formal
          label="Vid. izskatīšanas laiks"
          value={avgReviewDays !== null ? `${avgReviewDays} d.` : "-"}
          hint={reviewHint}
          icon={<Timer className="h-5 w-5" />}
        />
      </div>

      <SectionDivider label="Aktivitāte" />

      <div className="mb-8">
        <ActivityChart title="Aktivitāte (pēdējās 8 nedēļas)" data={weeklyData} />
      </div>

      <SectionDivider label="Analītika" />

      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        <WorkTypeChart title="Darba veids (apstiprinātie ieraksti)" data={workTypeData} />
        <HoursChart title="Apstiprinātās stundas pa darbiniekiem" data={hoursData} />
      </div>

      {/* Team performance */}
      {teamData.length > 0 && (
        <>
          <SectionDivider label="Komanda" />
          <Card className="relative mb-8 overflow-hidden p-0">
            <div className={glassInner} />
            <div className="px-6 py-4 flex items-center justify-between border-b border-border dark:border-white/[0.07]">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Komandas sniegums
              </div>
              {period !== "all" && (
                <span className="text-xs text-muted-foreground">
                  {period === "7d" ? "Pēdējās 7 dienas" : period === "30d" ? "Pēdējās 30 dienas" : "Pēdējās 90 dienas"}
                </span>
              )}
            </div>
            <div className="divide-y divide-border dark:divide-white/[0.04]">
              {teamData.map(({ name, entries, hours }, i) => {
                const isOverloaded = hours > teamAvgHours * 1.8 && teamAvgHours > 0;
                return (
                  <div key={i} className="flex items-center justify-between gap-4 px-6 py-3.5 transition-colors hover:bg-muted/40 dark:hover:bg-white/[0.02]">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted ring-1 ring-border dark:bg-white/[0.06] dark:ring-white/[0.08] text-xs font-semibold">
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{name}</div>
                        <div className="text-xs text-muted-foreground">{entries} ieraksti</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-semibold tabular-nums">{hours}h</div>
                        <div className="text-xs text-muted-foreground">apstiprinātās</div>
                      </div>
                      {isOverloaded && (
                        <div className="flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20 px-2.5 py-0.5 text-xs font-semibold">
                          <AlertTriangle className="h-3 w-3" />
                          Pārslodze
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-muted/40 dark:border-white/[0.07] dark:bg-white/[0.02] text-xs text-muted-foreground">
              <span>Vidēji uz darbinieku</span>
              <span className="font-medium tabular-nums">{Math.round(teamAvgHours * 10) / 10}h</span>
            </div>
          </Card>
        </>
      )}

      {/* Top categories */}
      {topCategories.length > 0 && (
        <Card className="relative mb-8 overflow-hidden p-0">
          <div className={glassInner} />
          <div className="px-6 py-4 border-b border-border dark:border-white/[0.07]">
            <div className="text-sm font-semibold">Populārākās kategorijas (apstiprinātie)</div>
          </div>
          <div className="px-6 py-5 space-y-3">
            {topCategories.map(([cat, count], i) => {
              const pct = totalApproved > 0 ? Math.round((count / totalApproved) * 100) : 0;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-36 truncate text-xs text-muted-foreground shrink-0">{cat}</div>
                  <div className="flex-1 h-1.5 bg-muted dark:bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-foreground/60 dark:bg-white/50 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-xs text-muted-foreground w-16 text-right tabular-nums">
                    {count} · {pct}%
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <SectionDivider label="Gaida jūsu izskatīšanu" />

      {recentPending.length === 0 ? (
        <EmptyState
          title="Nav ierakstu, kas gaida izskatīšanu"
          description="Lieliski - jūsu komanda šobrīd ir vienlīdzīgi pārskatāma."
        />
      ) : (
        <div className="grid gap-4">
          {recentPending.map((e: any) => (
            <EntryCard
              key={e.id}
              title={e.title}
              category={e.category}
              description={e.description}
              workDate={e.workDate}
              durationMinutes={e.durationMinutes}
              status={e.status}
              employeeName={e.employee.name}
              footer={
                <Link
                  href="/manager/entries"
                  className="text-sm font-medium underline-offset-4 hover:underline"
                >
                  Atvērt izskatīšanai →
                </Link>
              }
            />
          ))}
        </div>
      )}
    </>
  );
}
