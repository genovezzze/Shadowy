import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { buildProcessInsights, type InsightEntry } from "@/lib/process-insights";
import { comparisonWindows, resolveDateRange, type DateRange } from "@/lib/date-range";

/** Insights default to the last 30 days. */
export function resolveInsightRange(params?: { period?: string; from?: string; to?: string }): DateRange {
  return resolveDateRange(params, { defaultKey: "30d" });
}

function mapEntry(entry: {
  id: string;
  title: string;
  category: string;
  description: string;
  clientId: string | null;
  clientName: string | null;
  durationMinutes: number;
  workDate: Date;
  client: { name: string } | null;
  employee: { id: string; name: string };
}): InsightEntry {
  return {
    id: entry.id,
    title: entry.title,
    category: entry.category,
    description: entry.description,
    clientId: entry.clientId,
    // Client analytics must contain registered clients only. Free-typed names
    // remain available in the source entry, but must not create fake clients.
    clientName: entry.client?.name ?? null,
    durationMinutes: entry.durationMinutes,
    workDate: entry.workDate,
    employeeId: entry.employee.id,
    employeeName: entry.employee.name,
  };
}

export async function getProcessInsights({
  organizationId,
  managerId,
  range,
}: {
  organizationId: string;
  managerId?: string;
  range: DateRange;
}) {
  const now = new Date();
  // All time has nothing to compare against.
  const windows = range.start ? comparisonWindows(range, now) : null;

  const baseWhere: Prisma.InvisibleWorkEntryWhereInput = {
    organizationId,
    status: "APPROVED",
    deletedAt: null,
    ...(managerId ? { managerId } : {}),
  };
  const select = {
    id: true,
    title: true,
    category: true,
    description: true,
    clientId: true,
    clientName: true,
    durationMinutes: true,
    workDate: true,
    client: { select: { name: true } },
    employee: { select: { id: true, name: true } },
  } satisfies Prisma.InvisibleWorkEntrySelect;

  const [current, previous] = await Promise.all([
    prisma.invisibleWorkEntry.findMany({
      where: {
        ...baseWhere,
        ...(windows ? { workDate: { gte: windows.current.start, lt: windows.current.end } } : {}),
      },
      select,
      orderBy: { workDate: "desc" },
    }),
    windows
      ? prisma.invisibleWorkEntry.findMany({
          where: {
            ...baseWhere,
            workDate: { gte: windows.previous.start, lt: windows.previous.end },
          },
          select,
        })
      : Promise.resolve([]),
  ]);

  return buildProcessInsights(current.map(mapEntry), previous.map(mapEntry));
}
