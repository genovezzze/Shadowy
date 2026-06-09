import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { WorkTypeChart } from "@/components/dashboard/work-type-chart";
import { Button } from "@/components/ui/button";
import { EntryCard } from "@/components/entries/entry-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, RotateCcw, PlusCircle, Timer, TrendingUp } from "lucide-react";
import { EmployeeEntryActions } from "@/components/entries/employee-entry-actions";

const LV_MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jūn", "Jūl", "Aug", "Sep", "Okt", "Nov", "Dec"];

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

export default async function EmployeeDashboard() {
  const session = await requireUser(["EMPLOYEE"]);

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 86400000);

  const [pending, approved, returned, rejected, recent, allEntries, categories] = await Promise.all([
    prisma.invisibleWorkEntry.count({
      where: { employeeId: session.userId, status: "PENDING" },
    }),
    prisma.invisibleWorkEntry.count({
      where: { employeeId: session.userId, status: "APPROVED" },
    }),
    prisma.invisibleWorkEntry.count({
      where: { employeeId: session.userId, status: "RETURNED" },
    }),
    prisma.invisibleWorkEntry.count({
      where: { employeeId: session.userId, status: "REJECTED" },
    }),
    prisma.invisibleWorkEntry.findMany({
      where: { employeeId: session.userId },
      orderBy: { updatedAt: "desc" },
      take: 4,
    }),
    prisma.invisibleWorkEntry.findMany({
      where: { employeeId: session.userId },
      select: { createdAt: true, status: true, category: true, durationMinutes: true },
    }),
    prisma.category.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { name: "asc" },
    }),
  ]);

  const categoryNames = categories.map((c: { name: string }) => c.name);
  const monthlyData = buildMonthlyData(allEntries);

  type EntrySlice = { createdAt: Date; status: string; category: string; durationMinutes: number };

  const approvedEntries = allEntries.filter((e: EntrySlice) => e.status === "APPROVED");

  const approvedMinutes = approvedEntries.reduce((s: number, e: EntrySlice) => s + e.durationMinutes, 0);
  const approvedHours = Math.round((approvedMinutes / 60) * 10) / 10;

  // Trend: current 30d vs prev 30d (approved hours)
  const currentMonthMinutes = approvedEntries
    .filter((e: EntrySlice) => e.createdAt >= thirtyDaysAgo)
    .reduce((s: number, e: EntrySlice) => s + e.durationMinutes, 0);
  const prevMonthMinutes = approvedEntries
    .filter((e: EntrySlice) => e.createdAt >= sixtyDaysAgo && e.createdAt < thirtyDaysAgo)
    .reduce((s: number, e: EntrySlice) => s + e.durationMinutes, 0);
  const hoursHint = trendHint(currentMonthMinutes, prevMonthMinutes);

  // Trend: entries submitted this 30d vs prev 30d
  const currentEntries = allEntries.filter((e: EntrySlice) => e.createdAt >= thirtyDaysAgo).length;
  const prevEntries = allEntries.filter(
    (e: EntrySlice) => e.createdAt >= sixtyDaysAgo && e.createdAt < thirtyDaysAgo
  ).length;
  const entriesHint = trendHint(currentEntries, prevEntries);

  // Category breakdown
  const categoryMap = new Map<string, number>();
  for (const e of approvedEntries) {
    categoryMap.set(e.category, (categoryMap.get(e.category) ?? 0) + 1);
  }
  const categoryData = Array.from(categoryMap.entries())
    .map(([name, value], i) => ({ name, value, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }))
    .sort((a, b) => b.value - a.value);

  // Monthly hours trend (last 6 months)
  const monthlyHours = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const mins = approvedEntries
      .filter((e: EntrySlice) => e.createdAt.getFullYear() === year && e.createdAt.getMonth() === month)
      .reduce((s: number, e: EntrySlice) => s + e.durationMinutes, 0);
    return { label: LV_MONTHS[month], value: Math.round((mins / 60) * 10) / 10 };
  });

  // Best month
  const bestMonth = monthlyHours.reduce((best, m) => (m.value > best.value ? m : best), monthlyHours[0]);

  return (
    <>
      <PageHeader
        title={`Sveiks, ${session.name.split(" ")[0]}!`}
        description="Šeit jūs varat iesniegt neredzamo darbu un sekot līdzi savu ierakstu statusam."
        actions={
          <Button asChild>
            <Link href="/employee/new-entry">
              <PlusCircle className="h-4 w-4" />
              Jauns ieraksts
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <KpiCard
          label="Gaida izskatīšanu"
          value={pending}
          tone="warning"
          icon={<Clock className="h-5 w-5" />}
        />
        <KpiCard
          label="Apstiprināti"
          value={approved}
          hint={entriesHint}
          tone="success"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <KpiCard
          label="Apstiprinātās stundas"
          value={`${approvedHours}h`}
          hint={hoursHint}
          tone="success"
          icon={<Timer className="h-5 w-5" />}
        />
        <KpiCard
          label="Atpakaļ / Noraidīti"
          value={`${returned} / ${rejected}`}
          icon={<RotateCcw className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        <ActivityChart title="Mana aktivitāte (pēdējie 6 mēneši)" data={monthlyData} />
        <WorkTypeChart title="Apstiprinātie ieraksti pēc kategorijas" data={categoryData} />
      </div>

      {/* Monthly hours trend */}
      {approvedHours > 0 && (
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Apstiprinātās stundas pa mēnešiem
              </CardTitle>
              {bestMonth.value > 0 && (
                <span className="text-xs text-muted-foreground">
                  Labākais mēnesis: <span className="font-medium text-foreground">{bestMonth.label} ({bestMonth.value}h)</span>
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-20">
              {monthlyHours.map(({ label, value }, i) => {
                const maxVal = Math.max(...monthlyHours.map((m) => m.value), 1);
                const heightPct = (value / maxVal) * 100;
                const isCurrent = i === monthlyHours.length - 1;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end" style={{ height: "60px" }}>
                      <div
                        className={`w-full rounded-sm transition-all ${isCurrent ? "bg-emerald-500" : "bg-muted-foreground/20"}`}
                        style={{ height: `${Math.max(heightPct, value > 0 ? 4 : 0)}%` }}
                        title={`${value}h`}
                      />
                    </div>
                    <div className="text-[10px] text-muted-foreground">{label}</div>
                    {value > 0 && (
                      <div className={`text-[10px] font-medium tabular-nums ${isCurrent ? "text-emerald-500" : "text-muted-foreground"}`}>
                        {value}h
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-semibold">Pēdējie ieraksti</h2>
          <p className="text-sm text-muted-foreground">
            Pēdējās izmaiņas jūsu iesniegtajos ierakstos.
          </p>
        </div>
        <Link
          href="/employee/history"
          className="text-sm font-medium underline-offset-4 hover:underline"
        >
          Skatīt visu vēsturi →
        </Link>
      </div>

      {recent.length === 0 ? (
        <EmptyState
          title="Vēl nav iesniegtu ierakstu"
          description="Iesāciet ar pirmo neredzamā darba ierakstu — tas aizņems mazāk nekā minūti."
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
                    categories={categoryNames}
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
