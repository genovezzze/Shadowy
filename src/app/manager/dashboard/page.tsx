import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PeriodTabs } from "@/components/dashboard/period-tabs";
import { SectionDivider } from "@/components/dashboard/section-divider";
import { resolveWorkType } from "@/lib/work-type";
import { formatDurationLV } from "@/lib/utils";
import {
  AlertTriangle,
  Building2,
  Clock,
  FileText,
  Plus,
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

  const [teamCount, clients, approved, pending, pendingCount] = await Promise.all([
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
        ...(periodFilter ? { workDate: periodFilter } : {}),
      },
      select: {
        title: true,
        category: true,
        clientName: true,
        durationMinutes: true,
        workDate: true,
        source: true,
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
      where: { organizationId: orgId, managerId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { employee: { select: { name: true } } },
    }),
    prisma.invisibleWorkEntry.count({
      where: { organizationId: orgId, managerId, status: "PENDING" },
    }),
  ]);

  // Aggregate by client name
  const clientMinutes = new Map<string, number>();
  const categoryCount = new Map<string, number>();
  let totalMinutes = 0;
  let extraMinutes = 0;

  for (const e of approved) {
    totalMinutes += e.durationMinutes;
    if (e.clientName) {
      clientMinutes.set(e.clientName, (clientMinutes.get(e.clientName) ?? 0) + e.durationMinutes);
    }
    categoryCount.set(e.category, (categoryCount.get(e.category) ?? 0) + 1);

    const duties = e.employee.workRole?.duties.map((d: { text: string }) => d.text) ?? [];
    if (resolveWorkType(e.isOutsideRole, e.category, e.title, duties) === "extra") {
      extraMinutes += e.durationMinutes;
    }
  }

  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
  const extraHours = Math.round((extraMinutes / 60) * 10) / 10;
  const extraValue = Math.round(extraHours * HOURLY_RATE_EUR);

  // Client rows with limit comparison
  const clientRows = clients.map((c) => {
    const used = clientMinutes.get(c.name) ?? 0;
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

  // Untracked entries (clientName set but no client record)
  const untrackedNames = [...new Set(
    approved
      .map((e) => e.clientName)
      .filter((n): n is string => !!n && !clients.some((c) => c.name === n))
  )];

  const topCategories = Array.from(categoryCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-8">
        {[
          { label: "Darbinieki", value: teamCount, icon: Users, sub: "komandā" },
          { label: "Kopā stundas", value: `${totalHours}h`, icon: Clock, sub: "ierakstītas" },
          { label: "Papildu darbs", value: `${extraHours}h`, icon: FileText, sub: `~€${extraValue}` },
          { label: "Gaida apstiprinājumu", value: pendingCount, icon: AlertTriangle, sub: "manuāli ieraksti" },
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

      {/* Client table */}
      <SectionDivider label="Klienti" />
      <div className="mb-8">
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
                      <td className="px-5 py-3 font-medium">{c.name}</td>
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
      {topCategories.length > 0 && (
        <>
          <SectionDivider label="Kategorijas" />
          <Card className="mb-8 p-5">
            <div className="space-y-3">
              {topCategories.map(([cat, count], i) => {
                const pct = approved.length > 0 ? Math.round((count / approved.length) * 100) : 0;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-40 truncate text-xs text-muted-foreground shrink-0">{cat}</div>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-foreground/60 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground w-16 text-right tabular-nums">
                      {count} · {pct}%
                    </div>
                  </div>
                );
              })}
            </div>
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
