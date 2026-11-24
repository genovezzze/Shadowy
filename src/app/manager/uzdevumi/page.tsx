import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { requireTeamTasks, ensureTasksForPeriod } from "@/lib/team-tasks-server";
import { boardPeople, loadBoard } from "@/lib/team-tasks-board";
import { isPeriod, isoDay, periodLabel, periodOf, rigaToday, shiftPeriod } from "@/lib/team-tasks";
import { TaskBoard } from "@/components/team-tasks/task-board";
import { QuickTasks } from "@/components/team-tasks/quick-tasks";
import { loadAbsences, loadQuickTasks } from "@/lib/team-extras-server";
import Link from "next/link";
import { CalendarOff } from "lucide-react";
import { APPLE_PILL } from "@/components/dashboard/apple";
import { BoardToolbar } from "@/components/team-tasks/board-toolbar";

export const dynamic = "force-dynamic";

export default async function TeamTasksPage({
  searchParams,
}: {
  searchParams: { m?: string; darbinieks?: string };
}) {
  const session = await requireUser(["MANAGER", "ADMIN"]);
  await requireTeamTasks(session.organizationId);

  const today = rigaToday();
  const current = periodOf(today);
  const period = isPeriod(searchParams.m) && searchParams.m <= current ? searchParams.m : current;

  if (period === current) await ensureTasksForPeriod(session.organizationId, current, { onlyIfEmpty: true });

  const people = await boardPeople(session);
  // Only people the viewer may see are accepted; the task scope enforces it again.
  const assignee = people.some((p) => p.id === searchParams.darbinieks) ? searchParams.darbinieks! : null;

  const [data, quickTasks, absences] = await Promise.all([
    loadBoard(session, period, { today, assigneeId: assignee }),
    loadQuickTasks(session),
    loadAbsences(session, today, today),
  ]);
  const awayToday = absences.filter((a) => a.status === "approved");

  return (
    <div>
      <PageHeader
        title="Komandas vadība"
        description="Visas komandas mēneša atskaites vienā skatā: kas paveikts, kas nokavēts un kur vajag palīdzību."
        actions={
          <Link href="/manager/prombutne" className={APPLE_PILL}>
            <CalendarOff className="h-3.5 w-3.5" />
            Prombūtne
          </Link>
        }
      />
      {awayToday.length > 0 && (
        <p className="mb-4 text-[14px] text-muted-foreground">
          <span className="font-medium text-foreground">Šodien prom:</span>{" "}
          {awayToday
            .map((a) => `${a.name}${a.substituteName ? ` (aizvieto ${a.substituteName})` : ""}`)
            .join(", ")}
        </p>
      )}
      <div className="mb-5">
        <QuickTasks initial={quickTasks} todayIso={isoDay(today)} />
      </div>
      <div className="mb-5">
        <BoardToolbar
          period={period}
          label={periodLabel(period)}
          prev={shiftPeriod(period, -1)}
          next={period < current ? shiftPeriod(period, 1) : null}
          isCurrent={period === current}
          people={people}
          assignee={assignee}
        />
      </div>
      <TaskBoard data={data} mode="team" period={period} todayIso={isoDay(today)} />
    </div>
  );
}
