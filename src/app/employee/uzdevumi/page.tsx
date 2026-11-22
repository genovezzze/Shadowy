import Link from "next/link";
import { Settings2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { APPLE_PILL } from "@/components/dashboard/apple";
import { SheetOnboarding } from "@/components/team-tasks/sheet-onboarding";
import { PageHeader } from "@/components/layout/page-header";
import { requireTeamTasks, ensureTasksForPeriod } from "@/lib/team-tasks-server";
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

  const [ownColumns, firmColumns, clientCount] = await Promise.all([
    prisma.reportType.count({ where: { organizationId: session.organizationId, ownerUserId: session.userId } }),
    prisma.reportType.count({ where: { organizationId: session.organizationId, ownerUserId: null, active: true } }),
    prisma.client.count({
      where: { organizationId: session.organizationId, status: "active", assignments: { some: { employeeId: session.userId } } },
    }),
  ]);
  const needsSetup = ownColumns === 0 && firmColumns === 0;

  // Tasks appear on their own: the first visit of the month creates them, the
  // daily cron does the same once it is scheduled.
  if (period === current && !needsSetup) {
    await ensureTasksForPeriod(session.organizationId, current, { onlyIfEmpty: true });
  }

  const data = needsSetup ? null : await loadBoard(session, period, { today });

  return (
    <div>
      <PageHeader
        title="Mani uzdevumi"
        description="Mēneša atskaites pa klientiem. Uzdevumi izveidojas paši no klientu reģistra - atliek tikai atzīmēt paveikto."
        actions={
          <Link href="/employee/uzdevumi/tabula" className={APPLE_PILL}>
            <Settings2 className="h-3.5 w-3.5" />
            Mana tabula
          </Link>
        }
      />
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
