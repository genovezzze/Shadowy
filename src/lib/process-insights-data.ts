import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { buildProcessInsights, type InsightEntry } from "@/lib/process-insights";

export const INSIGHT_PERIODS = new Set(["7d", "30d", "90d", "all"]);

export function resolveInsightPeriod(value?: string) {
  return value && INSIGHT_PERIODS.has(value) ? value : "30d";
}

function periodDays(period: string) {
  if (period === "7d") return 7;
  if (period === "90d") return 90;
  if (period === "30d") return 30;
  return null;
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
  period,
}: {
  organizationId: string;
  managerId?: string;
  period: string;
}) {
  const days = periodDays(period);
  const now = new Date();
  const currentStart = days ? new Date(now.getTime() - days * 86400000) : null;
  const previousStart = days ? new Date(now.getTime() - days * 2 * 86400000) : null;

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
        ...(currentStart ? { workDate: { gte: currentStart, lte: now } } : {}),
      },
      select,
      orderBy: { workDate: "desc" },
    }),
    days && currentStart && previousStart
      ? prisma.invisibleWorkEntry.findMany({
          where: {
            ...baseWhere,
            workDate: { gte: previousStart, lt: currentStart },
          },
          select,
        })
      : Promise.resolve([]),
  ]);

  return buildProcessInsights(current.map(mapEntry), previous.map(mapEntry));
}
