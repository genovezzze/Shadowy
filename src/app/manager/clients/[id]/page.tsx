import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EntryCard } from "@/components/entries/entry-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { resolveWorkType } from "@/lib/work-type";
import { formatDurationLV } from "@/lib/utils";
import { ClientMonthChart } from "@/components/clients/client-month-chart";
import { AlertTriangle, ArrowLeft, Clock, TrendingUp, Users, FileText } from "lucide-react";
import { categoryLabel } from "@/lib/work-insights";

const HOURLY_RATE_EUR = 20;

function formatMonth(yearMonth: string) {
  const [year, month] = yearMonth.split("-");
  return new Intl.DateTimeFormat("lv-LV", { month: "long", year: "numeric" }).format(
    new Date(Number(year), Number(month) - 1, 1)
  );
}

function getYearMonth(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function last6MonthKeys() {
  const keys: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(getYearMonth(d));
  }
  return keys;
}

export default async function ClientProfilePage({ params }: { params: { id: string } }) {
  const session = await requireUser(["MANAGER", "ADMIN"]);

  const client = await prisma.client.findFirst({
    where: { id: params.id, organizationId: session.organizationId },
  });
  if (!client) notFound();

  const teamUsers = await prisma.user.findMany({
    where: {
      organizationId: session.organizationId,
      role: "EMPLOYEE",
      ...(session.role === "MANAGER" ? { managerId: session.userId } : {}),
    },
    select: { id: true, name: true, workRole: { select: { duties: { select: { text: true } } } } },
  });

  const entries = await prisma.invisibleWorkEntry.findMany({
    where: {
      organizationId: session.organizationId,
      deletedAt: null,
      ...(session.role === "MANAGER" ? { managerId: session.userId } : {}),
      OR: [
        { clientId: client.id },
        { clientName: { equals: client.name, mode: "insensitive" } },
      ],
    },
    orderBy: { workDate: "desc" },
    include: {
      employee: { select: { id: true, name: true } },
      timeLogs: { select: { minutes: true } },
    },
  });

  const entryMin = (e: (typeof entries)[0]) =>
    e.durationMinutes + e.timeLogs.reduce((s, l) => s + l.minutes, 0);

  const now = new Date();
  const thisYearMonth = getYearMonth(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalMinutes = entries.reduce((s, e) => s + entryMin(e), 0);
  const thisMonthMinutes = entries
    .filter((e) => e.workDate >= monthStart)
    .reduce((s, e) => s + entryMin(e), 0);

  // Monthly breakdown
  const monthMap = new Map<string, number>();
  for (const e of entries) {
    const ym = getYearMonth(new Date(e.workDate));
    monthMap.set(ym, (monthMap.get(ym) ?? 0) + entryMin(e));
  }
  const monthRows = Array.from(monthMap.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([ym, minutes]) => {
      const overrun =
        client.freeMinutesPerMonth !== null
          ? Math.max(0, minutes - client.freeMinutesPerMonth)
          : 0;
      return { ym, minutes, overrun, eur: Math.round((overrun / 60) * HOURLY_RATE_EUR) };
    });

  // Chart: last 6 months
  const monthKeys = last6MonthKeys();
  const chartData = monthKeys.map((key) => ({
    label: new Date(key + "-01").toLocaleDateString("lv-LV", { month: "short" }),
    minutes: monthMap.get(key) ?? 0,
  }));

  const thisMonthOverrun =
    client.freeMinutesPerMonth !== null
      ? Math.max(0, thisMonthMinutes - client.freeMinutesPerMonth)
      : 0;
  const totalOverrunMinutes = monthRows.reduce((s, r) => s + r.overrun, 0);
  const totalOverrunEur = Math.round((totalOverrunMinutes / 60) * HOURLY_RATE_EUR);

  // By employee
  const empMap = new Map<string, { name: string; minutes: number; count: number }>();
  for (const e of entries) {
    const id = e.employee.id;
    const rec = empMap.get(id) ?? { name: e.employee.name, minutes: 0, count: 0 };
    rec.minutes += entryMin(e);
    rec.count += 1;
    empMap.set(id, rec);
  }
  const empRows = Array.from(empMap.values()).sort((a, b) => b.minutes - a.minutes);
  const maxEmpMin = empRows[0]?.minutes ?? 1;

  // By category
  const catMap = new Map<string, number>();
  for (const e of entries) {
    catMap.set(e.category, (catMap.get(e.category) ?? 0) + entryMin(e));
  }
  const catRows = Array.from(catMap.entries())
    .sort((a, b) => b[1] - a[1]);
  const maxCatMin = catRows[0]?.[1] ?? 1;

  // Extra work (outside role)
  let extraMinutes = 0;
  for (const e of entries) {
    const emp = teamUsers.find((u) => u.id === e.employee.id);
    const duties = emp?.workRole?.duties.map((d) => d.text) ?? [];
    if (resolveWorkType(e.isOutsideRole, e.category, e.title, duties) === "extra") {
      extraMinutes += entryMin(e);
    }
  }

  const limitMin = client.freeMinutesPerMonth ?? null;

  return (
    <>
      <PageHeader
        title={client.name}
        description={
          limitMin !== null
            ? `Bezmaksas limits: ${formatDurationLV(limitMin)} / mēnesī`
            : "Bez bezmaksas laika limita"
        }
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/manager/clients">
              <ArrowLeft className="h-4 w-4" /> Visi klienti
            </Link>
          </Button>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-8">
        <KpiCard icon={<Clock className="h-4 w-4" />} label="Kopā ierakstīts" value={formatDurationLV(totalMinutes)} sub={`${entries.length} ieraksti`} />
        <KpiCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Šomēnes"
          value={thisMonthMinutes > 0 ? formatDurationLV(thisMonthMinutes) : "—"}
          sub={limitMin !== null ? `limits: ${formatDurationLV(limitMin)}` : "bez limita"}
        />
        <KpiCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Pārsniegums šomēnes"
          value={thisMonthOverrun > 0 ? formatDurationLV(thisMonthOverrun) : "—"}
          sub={thisMonthOverrun > 0 ? `~€${Math.round((thisMonthOverrun / 60) * HOURLY_RATE_EUR)}` : "ietilpst limitā"}
          warn={thisMonthOverrun > 0}
        />
        <KpiCard
          icon={<Users className="h-4 w-4" />}
          label="Darbinieki"
          value={String(empRows.length)}
          sub={`${entries.length} ieraksti kopā`}
        />
      </div>

      {/* Limit progress bar */}
      {limitMin !== null && (
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="font-medium">Limits šomēnes</span>
              <span className={thisMonthOverrun > 0 ? "text-amber-500 font-semibold" : "text-muted-foreground"}>
                {formatDurationLV(thisMonthMinutes)} / {formatDurationLV(limitMin)}
                {thisMonthOverrun > 0 && ` · +${formatDurationLV(thisMonthOverrun)} pārsniegums`}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${thisMonthOverrun > 0 ? "bg-amber-500" : "bg-emerald-500"}`}
                style={{ width: `${Math.min(100, (thisMonthMinutes / limitMin) * 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {entries.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-5 w-5" />}
          title="Nav ierakstu šim klientam"
          description="Kad darbinieki norādīs šo klientu savos ierakstos, tie parādīsies šeit."
        />
      ) : (
        <>
          {/* Chart + categories */}
          <div className="grid gap-6 lg:grid-cols-3 mb-8">
            <Card className="lg:col-span-2">
              <CardContent className="p-5">
                <h2 className="text-sm font-semibold mb-4">Pēdējie 6 mēneši</h2>
                <ClientMonthChart data={chartData} />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <h2 className="text-sm font-semibold mb-4">Pēc kategorijas</h2>
                <div className="space-y-3">
                  {catRows.map(([cat, minutes]) => (
                    <div key={cat}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="truncate text-muted-foreground">{categoryLabel(cat)}</span>
                        <span className="shrink-0 ml-2 font-medium">{formatDurationLV(minutes)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary/50" style={{ width: `${(minutes / maxCatMin) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                  {extraMinutes > 0 && (
                    <div className="pt-2 border-t border-border text-xs text-muted-foreground">
                      Papildu darbs (ārpus lomas):{" "}
                      <span className="font-medium text-indigo-500">{formatDurationLV(extraMinutes)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* By employee */}
          {empRows.length > 0 && (
            <Card className="mb-8">
              <CardContent className="p-5">
                <h2 className="text-sm font-semibold mb-4">Pēc darbinieka</h2>
                <div className="space-y-3">
                  {empRows.map((emp) => (
                    <div key={emp.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{emp.name}</span>
                        <span className="text-muted-foreground">{formatDurationLV(emp.minutes)} · {emp.count} ieraksti</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500/60" style={{ width: `${(emp.minutes / maxEmpMin) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Monthly table */}
          {monthRows.length > 0 && (
            <section className="mb-8">
              <h2 className="text-base font-semibold mb-3">Mēneša sadalījums</h2>
              <Card className="overflow-hidden p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Mēnesis</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Ierakstīts</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Limits</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Pārsniegums</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">~EUR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {monthRows.map(({ ym, minutes, overrun, eur }) => (
                      <tr key={ym} className={`hover:bg-muted/20 ${ym === thisYearMonth ? "bg-muted/10" : ""}`}>
                        <td className="px-5 py-3 font-medium">
                          {formatMonth(ym)}
                          {ym === thisYearMonth && <span className="ml-2 text-xs text-muted-foreground">(šomēnes)</span>}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">{formatDurationLV(minutes)}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                          {limitMin !== null ? formatDurationLV(limitMin) : "∞"}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {overrun > 0 ? <span className="font-semibold text-amber-500">+{formatDurationLV(overrun)}</span> : <span className="text-emerald-500 text-xs">Ietilpst</span>}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {eur > 0 ? <span className="font-semibold text-amber-500">€{eur}</span> : <span className="text-muted-foreground">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {totalOverrunMinutes > 0 && (
                    <tfoot>
                      <tr className="border-t border-border bg-muted/20">
                        <td colSpan={3} className="px-5 py-2.5 text-xs text-muted-foreground">Kopā pārsniegums (€{HOURLY_RATE_EUR}/h)</td>
                        <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-amber-500">+{formatDurationLV(totalOverrunMinutes)}</td>
                        <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-amber-500">€{totalOverrunEur}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </Card>
            </section>
          )}

          {/* Entry list */}
          <section>
            <h2 className="text-base font-semibold mb-3">
              Visi ieraksti <span className="text-sm font-normal text-muted-foreground">({entries.length})</span>
            </h2>
            <div className="grid gap-3">
              {entries.slice(0, 50).map((e) => (
                <EntryCard
                  key={e.id}
                  title={e.title}
                  category={e.category}
                  description={e.description}
                  clientName={e.clientName}
                  workDate={e.workDate}
                  durationMinutes={entryMin(e)}
                  status={e.status}
                  employeeName={e.employee.name}
                  managerComment={e.managerComment}
                />
              ))}
              {entries.length > 50 && (
                <p className="text-center text-xs text-muted-foreground pt-2">
                  Rāda 50 no {entries.length} ierakstiem.
                </p>
              )}
            </div>
          </section>
        </>
      )}
    </>
  );
}

function KpiCard({ icon, label, value, sub, warn }: { icon: React.ReactNode; label: string; value: string; sub: string; warn?: boolean }) {
  return (
    <Card className="p-4">
      <div className={`flex items-center gap-1.5 mb-1 ${warn ? "text-amber-500" : "text-muted-foreground"}`}>
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className={`text-2xl font-bold tabular-nums ${warn ? "text-amber-500" : ""}`}>{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
    </Card>
  );
}
