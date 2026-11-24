import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { requireTeamTasks } from "@/lib/team-tasks-server";
import { loadAbsences } from "@/lib/team-extras-server";
import { isoDay, rigaToday } from "@/lib/team-tasks";
import { AbsenceBoard } from "./absence-board";

/** Shared by /employee/prombutne and /manager/prombutne. */
export async function AbsencePage({
  session,
  month,
  basePath,
}: {
  session: { role: "ADMIN" | "MANAGER" | "EMPLOYEE"; organizationId: string; userId: string };
  month?: string;
  basePath: string;
}) {
  await requireTeamTasks(session.organizationId);
  const today = rigaToday();
  const todayIso = isoDay(today);
  const shown = month && /^\d{4}-(0[1-9]|1[0-2])$/.test(month) ? month : todayIso.slice(0, 7);
  const [y, m] = shown.split("-").map(Number);
  const from = new Date(Date.UTC(y, m - 1, 1));
  const to = new Date(Date.UTC(y, m, 0));
  // Also today's absences when another month is shown, for the "today" strip.
  const loadFrom = from < today ? from : today;
  const loadTo = to > today ? to : today;

  const [absences, people] = await Promise.all([
    loadAbsences(session, loadFrom, loadTo),
    prisma.user.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Prombūtne"
        description="Kas kad ir prom un kas aizvieto. Kolēģi redz tikai prombūtnes faktu un aizvietotāju, nevis iemeslu."
      />
      <AbsenceBoard
        absences={absences}
        people={people}
        meId={session.userId}
        todayIso={todayIso}
        month={shown}
        basePath={basePath}
      />
    </div>
  );
}
