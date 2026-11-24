import Link from "next/link";
import { Settings2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { APPLE_PILL } from "@/components/dashboard/apple";
import { SheetOnboarding } from "@/components/team-tasks/sheet-onboarding";
import { PageHeader } from "@/components/layout/page-header";
import { requireTeamTasks, ensureTasksForPeriod, activeSubstitutions } from "@/lib/team-tasks-server";
import { loadQuickTasks } from "@/lib/team-extras-server";
import { QuickTasks } from "@/components/team-tasks/quick-tasks";
import { CalendarOff } from "lucide-react";
import { loadBoard } from "@/lib/team-tasks-board";
import { isPeriod, isoDay, periodLabel, periodOf, rigaToday, shiftPeriod } from "@/lib/team-tasks";
import { TaskBoard } from "@/components/team-tasks/task-board";
import { BoardToolbar } from "@/components/team-tasks/board-toolbar";

export const dynamic = "force-dynamic";

export default async function EmployeeTasksPage({ searchParams }: { searchParams: { m?: string } }) {
  const session = await requireUser(["EMPLOYEE"]);
  await requireTeamTasks(session.organizationId);

  const today = rigaToday();
  const current = periodOf(today);
  const period = isPeriod(searchParams.m) && searchParams.m <= current ? searchParams.m : current;

  const [ownColumns, firmColumns, clientCount, quickTasks, substitutions] = await Promise.all([
    prisma.reportType.count({ where: { organizationId: session.organizationId, ownerUserId: session.userId } }),
    prisma.reportType.count({ where: { organizationId: session.organizationId, ownerUserId: null, active: true } }),
    prisma.client.count({
      where: { organizationId: session.organizationId, status: "active", assignments: { some: { employeeId: session.userId } } },
    }),
    loadQuickTasks(session),
    activeSubstitutions(session, today),
  ]);
  const needsSetup = ownColumns === 0 && firmColumns === 0;

  // Tasks appear on their own: the first visit of the month creates them, the
  // daily cron does the same once it is scheduled.
  if (period === current && !needsSetup) {
    await ensureTasksForPeriod(session.organizationId, current, { onlyIfEmpty: true });
  }

  // While a colleague is on approved leave, their tasks show up here too.
  const substituteFor = substitutions.map((s) => s.userId);
  const data = needsSetup ? null : await loadBoard(session, period, { today, substituteFor });

  return (
    <div>
      <PageHeader
        title="Mani uzdevumi"
        description="Mēneša atskaites pa klientiem. Uzdevumi izveidojas paši no klientu reģistra - atliek tikai atzīmēt paveikto."
        actions={
          <>
            <Link href="/employee/prombutne" className={APPLE_PILL}>
              <CalendarOff className="h-3.5 w-3.5" />
              Prombūtne
            </Link>
            <Link href="/employee/uzdevumi/tabula" className={APPLE_PILL}>
              <Settings2 className="h-3.5 w-3.5" />
              Mana tabula
            </Link>
          </>
        }
      />
      {substitutions.length > 0 && (
        <div className="mb-5 rounded-xl border border-[#007AFF]/25 bg-[#007AFF]/[0.06] px-4 py-3 text-[14px]">
          Šobrīd aizvietojat:{" "}
          {substitutions.map((s, i) => (
            <span key={s.userId}>
              {i > 0 && ", "}
              <strong className="font-medium">{s.name}</strong> (līdz {isoDay(s.endDate).slice(8, 10)}.{isoDay(s.endDate).slice(5, 7)})
            </span>
          ))}
          . Viņu atskaites redzamas jūsu tabulā.
        </div>
      )}
      <div className="mb-5">
        <QuickTasks initial={quickTasks} todayIso={isoDay(today)} />
      </div>
      {data ? (
        <>
          <div className="mb-5">
            <BoardToolbar
              period={period}
              label={periodLabel(period)}
              prev={shiftPeriod(period, -1)}
              next={period < current ? shiftPeriod(period, 1) : null}
              isCurrent={period === current}
            />
          </div>
          <TaskBoard data={data} mode="mine" period={period} todayIso={isoDay(today)} />
        </>
      ) : (
        <SheetOnboarding clientCount={clientCount} />
      )}
    </div>
  );
}
