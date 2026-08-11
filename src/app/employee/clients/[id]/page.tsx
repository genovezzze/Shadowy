import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EntryCard } from "@/components/entries/entry-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { formatDurationLV } from "@/lib/utils";
import { ClientMonthChart } from "@/components/clients/client-month-chart";
import { ArrowLeft, Clock, FileText } from "lucide-react";
import { categoryLabel, normalizeCategoryKey } from "@/lib/work-insights";

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

function formatMonth(yearMonth: string) {
  const [year, month] = yearMonth.split("-");
  return new Intl.DateTimeFormat("lv-LV", { month: "long", year: "numeric" }).format(
    new Date(Number(year), Number(month) - 1, 1)
  );
}

export default async function EmployeeClientDetailPage({ params }: { params: { id: string } }) {
  const session = await requireUser(["EMPLOYEE"]);

  const employee = await prisma.user.findFirst({
    where: { id: session.userId, organizationId: session.organizationId },
    select: { canSeeAllClients: true },
  });

  const client = await prisma.client.findFirst({
    where: {
      id: params.id,
      organizationId: session.organizationId,
      status: "active",
      ...(!employee?.canSeeAllClients
        ? { assignments: { some: { employeeId: session.userId } } }
        : {}),
    },
  });
  if (!client) notFound();

  const entries = await prisma.invisibleWorkEntry.findMany({
    where: {
      employeeId: session.userId,
      organizationId: session.organizationId,
      deletedAt: null,
      OR: [
        { clientId: client.id },
        { clientName: { equals: client.name, mode: "insensitive" } },
      ],
    },
    orderBy: { workDate: "desc" },
    include: {
      timeLogs: { select: { minutes: true } },
      helpedUser: { select: { name: true } },
    },
  });

  const entryMin = (e: (typeof entries)[0]) =>
    e.durationMinutes + e.timeLogs.reduce((s, l) => s + l.minutes, 0);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisYearMonth = getYearMonth(now);

  const totalMinutes = entries.reduce((s, e) => s + entryMin(e), 0);
  const thisMonthMinutes = entries
    .filter((e) => e.workDate >= monthStart)
    .reduce((s, e) => s + entryMin(e), 0);

  const monthMap = new Map<string, number>();
  for (const e of entries) {
    const ym = getYearMonth(new Date(e.workDate));
    monthMap.set(ym, (monthMap.get(ym) ?? 0) + entryMin(e));
  }

  const monthKeys = last6MonthKeys();
  const chartData = monthKeys.map((key) => ({
    label: new Date(key + "-01").toLocaleDateString("lv-LV", { month: "short" }),
    minutes: monthMap.get(key) ?? 0,
  }));

  const catMap = new Map<string, number>();
  for (const e of entries) {
    const key = normalizeCategoryKey(e.category);
    catMap.set(key, (catMap.get(key) ?? 0) + entryMin(e));
  }
  const catRows = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1]);
  const maxCatMin = catRows[0]?.[1] ?? 1;

  const limitMin = client.freeMinutesPerMonth ?? null;
  const thisMonthOverrun =
    limitMin !== null ? Math.max(0, thisMonthMinutes - limitMin) : 0;

  return (
    <>
      <PageHeader
        title={client.name}
        description={
          limitMin !== null
            ? `Bezmaksas limits: ${formatDurationLV(limitMin)} / mēnesī`
            : "Bez laika limita"
        }
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/employee/history">
              <ArrowLeft className="h-4 w-4" /> Atpakaļ
            </Link>
          </Button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <Card className="p-4">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-xs">Kopā ierakstīts</span>
          </div>
          <div className="text-2xl font-bold tabular-nums">{formatDurationLV(totalMinutes)}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{entries.length} ieraksti</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-xs">Šomēnes</span>
          </div>
          <div className={`text-2xl font-bold tabular-nums ${thisMonthOverrun > 0 ? "text-amber-500" : ""}`}>
            {thisMonthMinutes > 0 ? formatDurationLV(thisMonthMinutes) : "-"}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {limitMin !== null ? `limits: ${formatDurationLV(limitMin)}` : "bez limita"}
          </div>
        </Card>
      </div>

      {/* Limit bar */}
      {limitMin !== null && (
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="font-medium">Mans progress šomēnes</span>
              <span className={thisMonthOverrun > 0 ? "text-amber-500 font-semibold" : "text-muted-foreground"}>
                {formatDurationLV(thisMonthMinutes)} / {formatDurationLV(limitMin)}
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
          description="Kad tu norādīsi šo klientu savos ierakstos, tie parādīsies šeit."
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
            {catRows.length > 0 && (
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
                          <div
                            className="h-full rounded-full bg-primary/50"
                            style={{ width: `${(minutes / maxCatMin) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Monthly table */}
          {monthMap.size > 0 && (
            <section className="mb-8">
              <h2 className="text-base font-semibold mb-3">Mēneša sadalījums</h2>
              <Card className="overflow-hidden p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Mēnesis</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Ierakstīts</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Limits</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {Array.from(monthMap.entries())
                      .sort((a, b) => b[0].localeCompare(a[0]))
                      .map(([ym, minutes]) => (
                        <tr key={ym} className={`hover:bg-muted/20 ${ym === thisYearMonth ? "bg-muted/10" : ""}`}>
                          <td className="px-5 py-3 font-medium">
                            {formatMonth(ym)}
                            {ym === thisYearMonth && (
                              <span className="ml-2 text-xs text-muted-foreground">(šomēnes)</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums">{formatDurationLV(minutes)}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                            {limitMin !== null ? formatDurationLV(limitMin) : "∞"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </Card>
            </section>
          )}

          {/* Entries */}
          <section>
            <h2 className="text-base font-semibold mb-3">
              Ieraksti <span className="text-sm font-normal text-muted-foreground">({entries.length})</span>
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
                  managerComment={e.managerComment}
                  helpedColleague={e.helpedColleague}
                  helpedName={e.helpedUser?.name}
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
