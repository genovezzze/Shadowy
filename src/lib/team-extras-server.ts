import "server-only";
import { prisma } from "./db";
import { isoDay } from "./team-tasks";

type Session = { role: string; organizationId: string; userId: string };

export interface QuickTaskView {
  id: string;
  text: string;
  dueDate: string | null; // YYYY-MM-DD
  done: boolean;
  clientName: string | null;
  /** Set when someone else asked for it. */
  fromName: string | null;
  /** Set when it was handed to a colleague. */
  toName: string | null;
}

/** The viewer's to-dos plus the ones they handed to others; done ones for a week. */
export async function loadQuickTasks(session: Session): Promise<QuickTaskView[]> {
  const weekAgo = new Date(Date.now() - 7 * 86_400_000);
  const rows = await prisma.quickTask.findMany({
    where: {
      organizationId: session.organizationId,
      OR: [{ assigneeId: session.userId }, { createdById: session.userId }],
      AND: [{ OR: [{ done: false }, { doneAt: { gte: weekAgo } }] }],
    },
    orderBy: [{ done: "asc" }, { dueDate: "asc" }, { createdAt: "asc" }],
    take: 300,
    select: {
      id: true,
      text: true,
      dueDate: true,
      done: true,
      assigneeId: true,
      createdById: true,
      client: { select: { name: true } },
      assignee: { select: { name: true } },
      createdBy: { select: { name: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    text: r.text,
    dueDate: r.dueDate ? isoDay(r.dueDate) : null,
    done: r.done,
    clientName: r.client?.name ?? null,
    fromName: r.createdById !== session.userId ? r.createdBy.name : null,
    toName: r.assigneeId !== session.userId ? r.assignee.name : null,
  }));
}

export interface AbsenceView {
  id: string;
  userId: string;
  name: string;
  type: "vacation" | "sick" | "busy";
  startDate: string;
  endDate: string;
  startTime: string | null;
  endTime: string | null;
  status: "planned" | "approved";
  substituteName: string | null;
  /** Only for the viewer's own absences: a private note never leaves its owner. */
  note: string | null;
  mine: boolean;
  /** The viewer may approve it (their manager or an admin). */
  canApprove: boolean;
  canDelete: boolean;
}

/** Everyone's time away overlapping [from, to]: the fact and the substitute, no details. */
export async function loadAbsences(session: Session, from: Date, to: Date): Promise<AbsenceView[]> {
  const rows = await prisma.absence.findMany({
    where: { organizationId: session.organizationId, startDate: { lte: to }, endDate: { gte: from } },
    orderBy: [{ startDate: "asc" }],
    select: {
      id: true,
      userId: true,
      type: true,
      startDate: true,
      endDate: true,
      startTime: true,
      endTime: true,
      status: true,
      note: true,
      user: { select: { name: true, managerId: true } },
      substitute: { select: { name: true } },
    },
  });
  return rows.map((r) => {
    const mine = r.userId === session.userId;
    const manages = session.role === "ADMIN" || (session.role === "MANAGER" && r.user.managerId === session.userId);
    return {
      id: r.id,
      userId: r.userId,
      name: r.user.name,
      type: r.type as AbsenceView["type"],
      startDate: isoDay(r.startDate),
      endDate: isoDay(r.endDate),
      startTime: r.startTime,
      endTime: r.endTime,
      status: r.status === "approved" ? "approved" : "planned",
      substituteName: r.substitute?.name ?? null,
      note: mine ? r.note : null,
      mine,
      canApprove: manages && r.status !== "approved" && !mine,
      canDelete: mine || manages,
    };
  });
}
