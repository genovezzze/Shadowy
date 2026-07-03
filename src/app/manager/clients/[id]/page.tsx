import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EntryCard } from "@/components/entries/entry-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { classifyWorkType } from "@/lib/work-type";
import { formatDurationLV } from "@/lib/utils";
import { AlertTriangle, ArrowLeft, Clock, Settings, TrendingUp } from "lucide-react";

const HOURLY_RATE_EUR = 20;

function formatMonth(yearMonth: string) {
  const [year, month] = yearMonth.split("-");
  return new Intl.DateTimeFormat("lv-LV", { month: "long", year: "numeric" }).format(
    new Date(Number(year), Number(month) - 1, 1)
  );
}

export default async function ClientProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await requireUser(["MANAGER"]);

  const client = await prisma.client.findFirst({
    where: { id: params.id, organizationId: session.organizationId },
  });
  if (!client) notFound();

  const teamUsers = await prisma.user.findMany({
    where: { organizationId: session.organizationId, managerId: session.userId, role: "EMPLOYEE" },
    select: { id: true, name: true, workRole: { select: { duties: { select: { text: true } } } } },
  });

  const entries = await prisma.invisibleWorkEntry.findMany({
    where: {
      organizationId: session.organizationId,
      managerId: session.userId,
      clientName: client.name,
      status: "APPROVED",
    },
    orderBy: { workDate: "desc" },
    include: { employee: { select: { id: true, name: true } } },
  });

  // ── Aggregations ────────────────────────────────────────────────────────────

  const now = new Date();
  const thisYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const totalMinutes = entries.reduce((s, e) => s + e.durationMinutes, 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  // Monthly breakdown
  const monthMap = new Map<string, number>();
  for (const e of entries) {
    const ym = `${e.workDate.getFullYear()}-${String(e.workDate.getMonth() + 1).padStart(2, "0")}`;
    monthMap.set(ym, (monthMap.get(ym) ?? 0) + e.durationMinutes);
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

  const thisMonthMinutes = monthMap.get(thisYearMonth) ?? 0;
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
    rec.minutes += e.durationMinutes;
    rec.count += 1;
    empMap.set(id, rec);
  }
  const empRows = Array.from(empMap.values()).sort((a, b) => b.minutes - a.minutes);

  // By category
  const catMap = new Map<string, number>();
  for (const e of entries) {
    catMap.set(e.category, (catMap.get(e.category) ?? 0) + e.durationMinutes);
  }
  const catRows = Array.from(catMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const maxCatMin = catRows[0]?.[1] ?? 1;

  // Extra work (outside role)
  let extraMinutes = 0;
  for (const e of entries) {
    const emp = teamUsers.find((u) => u.id === e.employee.id);
    const duties = emp?.workRole?.duties.map((d) => d.text) ?? [];
    if (classifyWorkType(e.category, e.title, duties) === "extra") {
      extraMinutes += e.durationMinutes;
    }
  }

  return (
    <>
      <PageHeader
        title={client.name}
        description={
          client.freeMinutesPerMonth !== null
            ? `Bezmaksas limits: ${formatDurationLV(client.freeMinutesPerMonth)} / mēnesī`
            : "Bez bezmaksas laika limita"
        }
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/manager/clients">
                <ArrowLeft className="h-4 w-4" /> Visi klienti
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/manager/clients">
                <Settings className="h-4 w-4" /> Rediģēt limitu
              </Link>
            </Button>
          </div>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-8">
        {[
          {
            label: "Kopā ierakstīts",
            value: totalHours > 0 ? `${totalHours}h` : "—",
            sub: `${entries.length} ieraksti`,
            icon: Clock,
          },
          {
            label: "Šomēnes",
            value: thisMonthMinutes > 0 ? formatDurationLV(thisMonthMinutes) : "—",
            sub:
              client.freeMinutesPerMonth !== null
                ? `limits: ${formatDurationLV(client.freeMinutesPerMonth)}`
                : "bez limita",
            icon: TrendingUp,
          },
          {
            label: "Pārsniegums šomēnes",
            value: thisMonthOverrun > 0 ? formatDurationLV(thisMonthOverrun) : "—",
            sub: thisMonthOverrun > 0 ? `~€${Math.round((thisMonthOverrun / 60) * HOURLY_RATE_EUR)}` : "ietilpst limitā",
            icon: AlertTriangle,
            warn: thisMonthOverrun > 0,
          },
          {
            label: "Kopā pārsniegums",
            value: totalOverrunEur > 0 ? `€${totalOverrunEur}` : "—",
            sub: totalOverrunMinutes > 0 ? formatDurationLV(totalOverrunMinutes) : "viss ietilpst",
            icon: AlertTriangle,
            warn: totalOverrunEur > 0,
          },
        ].map((k, i) => (
          <Card key={i} className="p-4">
            <div className={`flex items-center gap-1.5 mb-1 ${k.warn ? "text-amber-500" : "text-muted-foreground"}`}>
              <k.icon className="h-4 w-4" />
              <span className="text-xs">{k.label}</span>
            </div>
            <div className={`text-2xl font-bold tabular-nums ${k.warn ? "text-amber-500" : ""}`}>
              {k.value}
            </div>
            <div className="text-xs text-muted-foreground">{k.sub}</div>
          </Card>
        ))}
      </div>

      {entries.length === 0 ? (
        <EmptyState
          title="Nav ierakstu šim klientam"
          description="Kad darbinieki norādīs šo klientu savos ierakstos, tie parādīsies šeit."
        />
      ) : (
        <>
          {/* Monthly breakdown */}
          {monthRows.length > 0 && (
            <section className="mb-8">
              <h2 className="text-base font-semibold mb-3">Mēneša sadalījums</h2>
              <Card className="overflow-hidden p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Mēnesis</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Ierakstīts</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Limits / mēn.</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Pārsniegums</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">~EUR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {monthRows.map(({ ym, minutes, overrun, eur }) => (
                      <tr
                        key={ym}
                        className={`transition-colors hover:bg-muted/20 ${ym === thisYearMonth ? "bg-muted/10" : ""}`}
                      >
                        <td className="px-5 py-3 font-medium">
                          {formatMonth(ym)}
                          {ym === thisYearMonth && (
                            <span className="ml-2 text-xs text-muted-foreground">(šomēnes)</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">{formatDurationLV(minutes)}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                          {client.freeMinutesPerMonth !== null
                            ? formatDurationLV(client.freeMinutesPerMonth)
                            : "∞"}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {overrun > 0 ? (
                            <span className="font-semibold text-amber-500">+{formatDurationLV(overrun)}</span>
                          ) : (
                            <span className="text-emerald-500 text-xs">Ietilpst</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {eur > 0 ? (
                            <span className="font-semibold text-amber-500">€{eur}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {totalOverrunMinutes > 0 && (
                    <tfoot>
                      <tr className="border-t border-border bg-muted/20">
                        <td colSpan={3} className="px-5 py-2.5 text-xs text-muted-foreground">
                          Kopā pārsniegums (€{HOURLY_RATE_EUR}/h)
                        </td>
                        <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-amber-500">
                          +{formatDurationLV(totalOverrunMinutes)}
                        </td>
                        <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-amber-500">
                          €{totalOverrunEur}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </Card>
              {totalOverrunEur > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Novērtējums balstīts uz €{HOURLY_RATE_EUR}/h likmi. Mainiet klienta limitu sadaļā{" "}
                  <Link href="/manager/clients" className="underline hover:text-foreground">
                    Klienti
                  </Link>
                  .
                </p>
              )}
            </section>
          )}

          <div className="grid gap-6 sm:grid-cols-2 mb-8">
            {/* By employee */}
            {empRows.length > 0 && (
              <section>
                <h2 className="text-base font-semibold mb-3">Pēc darbinieka</h2>
                <Card className="overflow-hidden p-0">
                  <div className="divide-y divide-border">
                    {empRows.map((emp, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 px-5 py-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{emp.name}</div>
                          <div className="text-xs text-muted-foreground">{emp.count} ieraksti</div>
                        </div>
                        <div className="text-sm font-semibold tabular-nums shrink-0">
                          {formatDurationLV(emp.minutes)}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </section>
            )}

            {/* By category */}
            {catRows.length > 0 && (
              <section>
                <h2 className="text-base font-semibold mb-3">Pēc kategorijas</h2>
                <Card className="p-5">
                  <div className="space-y-3">
                    {catRows.map(([cat, minutes], i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-32 truncate text-xs text-muted-foreground shrink-0">
                          {cat}
                        </div>
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-foreground/60 rounded-full"
                            style={{ width: `${Math.round((minutes / maxCatMin) * 100)}%` }}
                          />
                        </div>
                        <div className="text-xs tabular-nums text-muted-foreground w-14 text-right shrink-0">
                          {formatDurationLV(minutes)}
                        </div>
                      </div>
                    ))}
                  </div>
                  {extraMinutes > 0 && (
                    <div className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
                      Papildu darbs (ārpus lomas):{" "}
                      <span className="font-medium text-indigo-500">
                        {formatDurationLV(extraMinutes)}
                      </span>
                    </div>
                  )}
                </Card>
              </section>
            )}
          </div>

          {/* Entry list */}
          <section>
            <h2 className="text-base font-semibold mb-3">
              Visi ieraksti{" "}
              <span className="text-sm font-normal text-muted-foreground">({entries.length})</span>
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
                  durationMinutes={e.durationMinutes}
                  status={e.status}
                  employeeName={e.employee.name}
                  managerComment={e.managerComment}
                />
              ))}
              {entries.length > 50 && (
                <p className="text-center text-xs text-muted-foreground pt-2">
                  Rāda 50 no {entries.length} ierakstiem. Eksportējiet CSV, lai iegūtu pilnu sarakstu.
                </p>
              )}
            </div>
          </section>
        </>
      )}
    </>
  );
}
