import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/entries/status-badge";
import { formatDateTimeLV, formatDurationLV } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText, UserCog, Users, Clock, Timer, TrendingUp } from "lucide-react";
import { GettingStarted } from "@/components/dashboard/getting-started";
import { PeriodTabs } from "@/components/dashboard/period-tabs";

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

  return (
    <>
      <PageHeader
        title="Organizācijas pārskats"
        description="Galvenie rādītāji par jūsu organizāciju."
        actions={<PeriodTabs current={period} />}
      />

      <GettingStarted
        hasManagers={managers > 0}
        hasEmployees={employees > 0}
        hasEntries={totalEntries > 0}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <KpiCard label="Vadītāji" value={managers} icon={<UserCog className="h-5 w-5" />} />
        <KpiCard label="Darbinieki" value={employees} icon={<Users className="h-5 w-5" />} />
        <KpiCard
          label={period === "all" ? "Visi ieraksti" : "Ieraksti periodā"}
          value={totalEntries}
          icon={<FileText className="h-5 w-5" />}
        />
        <KpiCard
          label="Gaida izskatīšanu"
          value={pending}
          tone="warning"
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      {/* Org-wide trend chart */}
      <div className="mb-8">
        <ActivityChart title="Organizācijas aktivitāte (pēdējie 12 mēneši)" data={monthlyData} />
      </div>

      {/* Manager performance table */}
      {managerStats.length > 0 && (
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Vadītāju sniegums
              </CardTitle>
              {period !== "all" && (
                <span className="text-xs text-muted-foreground">
                  {period === "7d" ? "Pēdējās 7 dienas" : period === "30d" ? "Pēdējās 30 dienas" : "Pēdējās 90 dienas"}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground">Vadītājs</th>
                    <th className="px-4 py-2.5 text-center text-xs font-medium text-muted-foreground">Komanda</th>
                    <th className="px-4 py-2.5 text-center text-xs font-medium text-muted-foreground">Gaida</th>
                    <th className="px-4 py-2.5 text-center text-xs font-medium text-muted-foreground">Izskatīti</th>
                    <th className="px-6 py-2.5 text-right text-xs font-medium text-muted-foreground flex items-center justify-end gap-1">
                      <Timer className="h-3 w-3" /> Vid. izskatīšana
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {managerStats
                    .sort((a, b) => (a.avgReviewDays ?? 999) - (b.avgReviewDays ?? 999))
                    .map((m, i) => (
                      <tr key={i} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-3 font-medium">{m.name}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{m.teamSize}</td>
                        <td className="px-4 py-3 text-center">
                          {m.pending > 0 ? (
                            <span className="inline-flex items-center rounded-full bg-warning/10 text-warning px-2 py-0.5 text-xs font-medium">
                              {m.pending}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-muted-foreground tabular-nums">{m.reviewed}</td>
                        <td className="px-6 py-3 text-right">
                          {m.avgReviewDays !== null ? (
                            <span
                              className={
                                m.avgReviewDays <= 1
                                  ? "text-success font-medium tabular-nums"
                                  : m.avgReviewDays <= 3
                                  ? "text-foreground tabular-nums"
                                  : "text-warning font-medium tabular-nums"
                              }
                            >
                              {m.avgReviewDays} d.
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle>Nesenā aktivitāte</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recent.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="Pagaidām nav aktivitātes"
                description="Kad darbinieki iesniegs neredzamā darba ierakstus, tie parādīsies šeit."
              />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recent.map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{e.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {e.employee.name} · {e.category} · {formatDurationLV(e.durationMinutes)} ·{" "}
                      {formatDateTimeLV(e.updatedAt)}
                    </div>
                  </div>
                  <StatusBadge status={e.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
