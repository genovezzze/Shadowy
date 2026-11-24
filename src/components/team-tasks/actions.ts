"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { isTeamTasksEnabled, taskScopeOpts } from "@/lib/team-tasks-server";
import { isPeriod, scopedTaskWhere } from "@/lib/team-tasks";

type Result = { ok: true } | { ok: false; error: string };

const NOT_FOUND = { ok: false as const, error: "Uzdevums nav atrasts." };

function revalidateBoards() {
  revalidatePath("/employee/uzdevumi");
  revalidatePath("/manager/uzdevumi");
}

async function sessionWithModule() {
  const session = await requireUser();
  if (!(await isTeamTasksEnabled(session.organizationId))) return null;
  return session;
}

const statusSchema = z.enum(["NOT_STARTED", "IN_PROGRESS", "DONE"]);

export async function setTaskStatus(taskId: string, status: string): Promise<Result> {
  const session = await sessionWithModule();
  if (!session) return NOT_FOUND;
  const parsed = statusSchema.safeParse(status);
  if (!parsed.success || typeof taskId !== "string") return { ok: false, error: "Nepareizs statuss." };

  const task = await prisma.clientTask.findFirst({
    where: scopedTaskWhere({ id: taskId }, session, await taskScopeOpts(session)),
    select: { id: true, status: true },
  });
  if (!task) return NOT_FOUND;

  const done = parsed.data === "DONE";
  await prisma.clientTask.update({
    where: { id: task.id },
    data: {
      status: parsed.data,
      completedAt: done ? new Date() : null,
      completedById: done ? session.userId : null,
    },
  });
  revalidateBoards();
  return { ok: true };
}

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Everything one sheet cell holds, like in Excel: free text ("XXX",
 * "Nom.līg.", "Sw.0001"), whether it is done, and the date it was done.
 */
export async function setTaskCell(
  taskId: string,
  input: { text: string; done: boolean; date: string | null },
): Promise<Result> {
  const session = await sessionWithModule();
  if (!session) return NOT_FOUND;
  if (typeof taskId !== "string" || !input || typeof input.done !== "boolean") {
    return { ok: false, error: "Nepareizi dati." };
  }
  const text = typeof input.text === "string" ? input.text.trim().slice(0, 500) : "";
  if (input.date !== null && (typeof input.date !== "string" || !DAY_RE.test(input.date))) {
    return { ok: false, error: "Nepareizs datums." };
  }

  const task = await prisma.clientTask.findFirst({
    where: scopedTaskWhere({ id: taskId }, session, await taskScopeOpts(session)),
    select: { id: true, status: true },
  });
  if (!task) return NOT_FOUND;

  // Noon UTC keeps the chosen calendar day the same in Riga.
  const completedAt = input.done ? (input.date ? new Date(`${input.date}T10:00:00Z`) : new Date()) : null;
  await prisma.clientTask.update({
    where: { id: task.id },
    data: {
      comment: text || null,
      status: input.done ? "DONE" : task.status === "DONE" ? "NOT_STARTED" : task.status,
      completedAt,
      completedById: input.done ? session.userId : null,
    },
  });
  revalidateBoards();
  return { ok: true };
}

export async function setTaskComment(taskId: string, comment: string): Promise<Result> {
  const session = await sessionWithModule();
  if (!session) return NOT_FOUND;
  const text = typeof comment === "string" ? comment.trim().slice(0, 500) : "";

  const task = await prisma.clientTask.findFirst({
    where: scopedTaskWhere({ id: taskId }, session, await taskScopeOpts(session)),
    select: { id: true },
  });
  if (!task) return NOT_FOUND;

  await prisma.clientTask.update({ where: { id: task.id }, data: { comment: text || null } });
  revalidateBoards();
  return { ok: true };
}

/**
 * The "Info" cell. Anyone who can see a task of this client in this month may
 * write it; that keeps an employee from writing notes on clients they don't
 * work with.
 */
export async function setClientMonthNote(clientId: string, period: string, text: string): Promise<Result> {
  const session = await sessionWithModule();
  if (!session) return NOT_FOUND;
  if (typeof clientId !== "string" || !isPeriod(period)) return { ok: false, error: "Nepareizi dati." };
  const value = typeof text === "string" ? text.trim().slice(0, 500) : "";

  const visible = await prisma.clientTask.findFirst({
    where: scopedTaskWhere({ clientId, period }, session, await taskScopeOpts(session)),
    select: { id: true },
  });
  if (!visible) return { ok: false, error: "Klients nav atrasts." };

  if (!value) {
    await prisma.clientMonthNote.deleteMany({
      where: { organizationId: session.organizationId, clientId, period },
    });
  } else {
    await prisma.clientMonthNote.upsert({
      where: { clientId_period: { clientId, period } },
      create: {
        organizationId: session.organizationId,
        clientId,
        period,
        text: value,
        updatedById: session.userId,
      },
      update: { text: value, updatedById: session.userId },
    });
  }
  revalidateBoards();
  return { ok: true };
}
