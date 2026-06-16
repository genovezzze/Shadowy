import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/entries/status-badge";
import { formatDateTimeLV, formatDurationLV } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText, UserCog, Users, Clock, Timer, TrendingUp } from "lucide-react";
import { GettingStarted } from "@/components/dashboard/getting-started";
import { PeriodTabs } from "@/components/dashboard/period-tabs";
import { SectionDivider } from "@/components/dashboard/section-divider";

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

  const [managers, employees, totalEntries, pending, recent, allEntries, managerList] =
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
    ]);

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
