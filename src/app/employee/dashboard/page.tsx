import Link from "next/link";
import Image from "next/image";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { WorkTypeChart } from "@/components/dashboard/work-type-chart";
import { HoursTrendChart } from "@/components/dashboard/hours-trend-chart";
import { Button } from "@/components/ui/button";
import { EntryCard } from "@/components/entries/entry-card";
import { EmptyState } from "@/components/ui/empty-state";
import { CheckCircle2, Clock, RotateCcw, PlusCircle, Timer } from "lucide-react";
import { EmployeeEntryActions } from "@/components/entries/employee-entry-actions";
import { SectionDivider } from "@/components/dashboard/section-divider";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

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
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-foreground/50 dark:text-white/40">
            Pārskats
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Mans darba pārskats
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">
            Šeit jūs varat iesniegt neredzamo darbu un sekot līdzi savu ierakstu statusam.
          </p>
        </div>
        <Button asChild>
          <Link href="/employee/new-entry">
            <PlusCircle className="h-4 w-4" />
            Jauns ieraksts
          </Link>
        </Button>
      </div>

      <Card className="mb-8 overflow-hidden">
        <CardContent className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/30 dark:border-white/[0.1] dark:bg-white/[0.035]">
              <Image
                src="/shadowy.svg"
                alt=""
                width={25}
                height={25}
                className="invert dark:invert-0"
              />
            </div>
            <div>
              <h2 className="font-semibold">Shadowy AI ieraksts</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                Apraksti vai ierunā, kas šodien aizņēma papildu laiku, un
                pārskati Shadowy AI izveidotos melnrakstus.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="relative shrink-0">
            <Link href="/employee/smart-log">
              Atvērt Shadowy AI
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <KpiCard
          formal
          label="Gaida izskatīšanu"
          value={pending}
          icon={<Clock className="h-5 w-5" />}
        />
        <KpiCard
          formal
          label="Apstiprināti"
          value={approved}
          hint={entriesHint}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <KpiCard
          formal
          label="Apstiprinātās stundas"
          value={`${approvedHours}h`}
          hint={hoursHint}
          icon={<Timer className="h-5 w-5" />}
        />
        <KpiCard
          formal
          label="Atpakaļ / Noraidīti"
          value={`${returned} / ${rejected}`}
          icon={<RotateCcw className="h-5 w-5" />}
        />
      </div>

      <SectionDivider label="Aktivitāte" />

      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        <ActivityChart title="Mana aktivitāte (pēdējie 6 mēneši)" data={monthlyData} />
        <WorkTypeChart title="Apstiprinātie ieraksti pēc kategorijas" data={categoryData} />
      </div>

      {/* Monthly hours trend */}
      {approvedHours > 0 && (
        <div className="mb-8">
          <HoursTrendChart
            title="Apstiprinātās stundas pa mēnešiem"
            data={monthlyHours}
            badge={
              bestMonth.value > 0 ? (
                <>
                  Labākais mēnesis: <span className="font-medium text-foreground">{bestMonth.label} ({bestMonth.value}h)</span>
                </>
              ) : undefined
            }
          />
        </div>
      )}

      <SectionDivider label="Pēdējie ieraksti" />

      <div className="mb-4 flex items-center justify-end">
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
          description="Iesāciet ar pirmo neredzamā darba ierakstu - tas aizņems mazāk nekā minūti."
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
              clientName={e.clientName}
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
