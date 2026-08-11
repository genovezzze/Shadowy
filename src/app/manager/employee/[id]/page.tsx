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
import { ArrowLeft, Clock, TrendingUp, Users, Tag } from "lucide-react";
import {
  categoryLabel,
  groupByCategory,
  groupByClient,
  weekCountTrend,
  weekTrend,
  weeklyRecommendation,
} from "@/lib/work-insights";
import { toggleCanSeeAllClients } from "./actions";

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

export default async function ManagerEmployeeDetail({
  params,
}: {
  params: { id: string };
}) {
  const session = await requireUser(["MANAGER", "ADMIN"]);

  const employee = await prisma.user.findFirst({
    where: {
      id: params.id,
      organizationId: session.organizationId,
      role: "EMPLOYEE",
      ...(session.role === "MANAGER" ? { managerId: session.userId } : {}),
    },
  });
  if (!employee) notFound();

  const [entries, clients] = await Promise.all([
    prisma.invisibleWorkEntry.findMany({
      where: { employeeId: employee.id, organizationId: session.organizationId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, title: true, category: true, description: true,
        clientName: true, clientId: true,
        client: { select: { name: true } },
        workDate: true, durationMinutes: true, status: true, managerComment: true,
        helpedColleague: true,
        helpedUser: { select: { name: true } },
      },
    }),
    prisma.client.findMany({
      where: { organizationId: session.organizationId },
      select: { id: true, name: true, aliases: { select: { normalized: true } } },
    }),
  ]);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000);

  const totalMinutes = entries.reduce((s, e) => s + e.durationMinutes, 0);
  const thisMonthMinutes = entries
    .filter((e) => e.workDate >= monthStart)
    .reduce((s, e) => s + e.durationMinutes, 0);

  const thisWeekEntries = entries.filter((e) => e.workDate >= weekAgo);
  const prevWeekEntries = entries.filter((e) => e.workDate >= twoWeeksAgo && e.workDate < weekAgo);
  const thisWeekMinutes = thisWeekEntries.reduce((s, e) => s + e.durationMinutes, 0);
  const prevWeekMinutes = prevWeekEntries.reduce((s, e) => s + e.durationMinutes, 0);
  const minutesTrend = weekTrend(thisWeekMinutes, prevWeekMinutes);
  const countTrend = weekCountTrend(thisWeekEntries.length, prevWeekEntries.length);
  const recommendation = weeklyRecommendation(groupByCategory(thisWeekEntries));

  // Chart: last 6 months
  const monthMap = new Map<string, number>();
  for (const e of entries) {
    const ym = getYearMonth(new Date(e.workDate));
    monthMap.set(ym, (monthMap.get(ym) ?? 0) + e.durationMinutes);
  }
  const chartData = last6MonthKeys().map((key) => ({
    label: new Date(key + "-01").toLocaleDateString("lv-LV", { month: "short" }),
    minutes: monthMap.get(key) ?? 0,
  }));

  // By category
  const catRows = groupByCategory(entries);
  const maxCatMin = catRows[0]?.minutes ?? 1;
  const topCat = catRows[0] ?? null;

  // By client
  const clientRows = groupByClient(entries, clients);
  const maxClientMin = clientRows[0]?.minutes ?? 1;

  const backHref = session.role === "ADMIN" ? "/admin/employees" : "/manager/employees";

  return (
    <>
      <PageHeader
        title={employee.name}
        description={
          employee.title
            ? `${employee.title} · ${employee.email}`
            : employee.email
        }
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href={backHref}>
              <ArrowLeft className="h-4 w-4" /> Atpakaļ
            </Link>
          </Button>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        <KpiCard
          icon={<Clock className="h-4 w-4" />}
          label="Kopā ierakstīts"
          value={formatDurationLV(totalMinutes)}
          sub={`${entries.length} ieraksti`}
        />
        <KpiCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Šomēnes"
          value={thisMonthMinutes > 0 ? formatDurationLV(thisMonthMinutes) : "-"}
          sub="šis kalendārais mēnesis"
        />
        <KpiCard
          icon={<Tag className="h-4 w-4" />}
          label="Galvenā kategorija"
          value={topCat ? categoryLabel(topCat.category) : "-"}
          sub={topCat && totalMinutes > 0 ? `${Math.round((topCat.minutes / totalMinutes) * 100)}% no laika` : "nav datu"}
        />
        <KpiCard
          icon={<Users className="h-4 w-4" />}
          label="Klienti"
          value={String(clientRows.length)}
          sub="dažādi klienti"
        />
      </div>

      {/* Week trend + recommendation */}
      <Card className="mb-8">
        <CardContent className="flex flex-col gap-1.5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            <span className="font-medium">Šonedēļ: </span>
            <span className="text-muted-foreground">
              {thisWeekEntries.length} ieraksti · {formatDurationLV(thisWeekMinutes)}
              {minutesTrend ? ` · ${minutesTrend}` : countTrend ? ` · ${countTrend}` : ""}
            </span>
          </div>
          <p className="text-xs text-muted-foreground sm:max-w-md sm:text-right">{recommendation}</p>
        </CardContent>
      </Card>

      {/* Redz visus klientus toggle */}
      <Card className="mb-8">
        <div className="flex items-center justify-between gap-4 px-6 py-4">
          <div>
            <div className="text-sm font-medium">Redz visus klientus</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Ja ieslēgts - darbinieks var izvēlēties jebkuru klientu iesniedzot ierakstu
            </div>
          </div>
          <form action={async () => {
            "use server";
            await toggleCanSeeAllClients(employee.id, employee.canSeeAllClients);
          }}>
            <Button
              type="submit"
              variant={employee.canSeeAllClients ? "default" : "outline"}
              size="sm"
            >
              {employee.canSeeAllClients ? "Ieslēgts" : "Izslēgts"}
            </Button>
          </form>
        </div>
      </Card>

      {entries.length === 0 ? (
        <EmptyState
          title="Šim darbiniekam vēl nav ierakstu"
          description="Kad darbinieks iesniegs neredzamo darbu, tas parādīsies šeit."
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
                  {catRows.map((c) => (
                    <div key={c.category}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="truncate text-muted-foreground">{categoryLabel(c.category)}</span>
                        <span className="shrink-0 ml-2 font-medium">{formatDurationLV(c.minutes)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/50"
                          style={{ width: `${(c.minutes / maxCatMin) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* By client */}
          {clientRows.length > 0 && (
            <Card className="mb-8">
              <CardContent className="p-5">
                <h2 className="text-sm font-semibold mb-4">Pēc klienta</h2>
                <div className="space-y-3">
                  {clientRows.map((c) => (
                    <div key={c.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium truncate">{c.name}</span>
                        <span className="text-muted-foreground shrink-0 ml-2">{formatDurationLV(c.minutes)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500/60"
                          style={{ width: `${(c.minutes / maxClientMin) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
                  clientName={e.clientName ?? e.client?.name ?? undefined}
                  clientHref={e.clientId ? `/manager/clients/${e.clientId}` : undefined}
                  workDate={e.workDate}
                  durationMinutes={e.durationMinutes}
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

function KpiCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-1.5 mb-1 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
    </Card>
  );
}
