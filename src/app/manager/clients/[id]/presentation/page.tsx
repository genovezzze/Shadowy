import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildProcessInsights, type InsightEntry } from "@/lib/process-insights";
import { resolveInsightPeriod } from "@/lib/process-insights-data";
import { categoryLabel, normalizeCategoryKey } from "@/lib/work-insights";
import { formatDurationLV, slugify } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { PeriodTabs } from "@/components/dashboard/period-tabs";
import { ClientReportActions } from "@/components/clients/client-report-actions";
import {
  ClientReportDocument,
  type ReportEmployee,
  type ReportWorkGroup,
} from "@/components/clients/client-report-document";
import { Button } from "@/components/ui/button";

const FALLBACK_HOURLY_RATE = 20;
/** Examples shown per work area — enough to recognise the work, short enough to read. */
const EXAMPLES_PER_GROUP = 4;

function periodDays(period: string) {
  if (period === "7d") return 7;
  if (period === "30d") return 30;
  if (period === "90d") return 90;
  return null;
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function lastSixMonths() {
  const now = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    return {
      key: monthKey(date),
      label: new Intl.DateTimeFormat("lv-LV", { month: "short" }).format(date),
    };
  });
}

function money(value: number) {
  return new Intl.NumberFormat("lv-LV", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

const shortDate = new Intl.DateTimeFormat("lv-LV", { day: "2-digit", month: "2-digit", year: "numeric" });

function periodLabel(period: string, start: Date | null, end: Date) {
  if (!start) return "Visa sadarbības vēsture";
  return `${shortDate.format(start)}–${shortDate.format(end)}`;
}

/**
 * Every report gets its own identity: the browser uses the document title as
 * the PDF file name, and the number makes two reports for the same client
 * distinguishable once they are saved or forwarded.
 */
function documentNumber(clientName: string, date: Date) {
  const code = slugify(clientName).replace(/-/g, "").slice(0, 6).toUpperCase() || "KLIENTS";
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
  return `${code}-${stamp}`;
}

function reportTitle(clientName: string, period: string, start: Date | null, end: Date) {
  return `Sadarbības pārskats · ${clientName} · ${periodLabel(period, start, end)}`;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { period?: string };
}): Promise<Metadata> {
  const session = await requireUser(["MANAGER", "ADMIN"]);
  const client = await prisma.client.findFirst({
    where: { id: params.id, organizationId: session.organizationId },
    select: { name: true },
  });
  if (!client) return { title: { absolute: "Sadarbības pārskats" } };

  const period = resolveInsightPeriod(searchParams?.period);
  const days = periodDays(period);
  const now = new Date();
  const start = days ? new Date(now.getTime() - days * 86400000) : null;

  return { title: { absolute: reportTitle(client.name, period, start, now) } };
}

export default async function ClientPresentationPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { period?: string };
}) {
  const session = await requireUser(["MANAGER", "ADMIN"]);
  const period = resolveInsightPeriod(searchParams?.period);
  const days = periodDays(period);
  const now = new Date();
  const currentStart = days ? new Date(now.getTime() - days * 86400000) : null;
  const previousStart = days ? new Date(now.getTime() - days * 2 * 86400000) : null;

  const client = await prisma.client.findFirst({
    where: { id: params.id, organizationId: session.organizationId },
    select: {
      id: true,
      name: true,
      freeMinutesPerMonth: true,
      organization: { select: { name: true, defaultHourlyRate: true } },
    },
  });
  if (!client) notFound();
  const clientId = client.id;
  const clientName = client.name;

  const entryWhere = {
    organizationId: session.organizationId,
    clientId: client.id,
    status: "APPROVED" as const,
    deletedAt: null,
    ...(session.role === "MANAGER" ? { managerId: session.userId } : {}),
  };
  const entrySelect = {
    id: true,
    title: true,
    category: true,
    description: true,
    durationMinutes: true,
    workDate: true,
    employee: {
      select: {
        id: true,
        name: true,
        hourlyRate: true,
        workRole: { select: { defaultHourlyRate: true } },
      },
    },
  };

  const [entries, previousEntries, sixMonthEntries] = await Promise.all([
    prisma.invisibleWorkEntry.findMany({
      where: { ...entryWhere, ...(currentStart ? { workDate: { gte: currentStart, lte: now } } : {}) },
      select: entrySelect,
      orderBy: { workDate: "desc" },
    }),
    days && currentStart && previousStart
      ? prisma.invisibleWorkEntry.findMany({
          where: { ...entryWhere, workDate: { gte: previousStart, lt: currentStart } },
          select: entrySelect,
        })
      : Promise.resolve([]),
    prisma.invisibleWorkEntry.findMany({
      where: {
        ...entryWhere,
        workDate: { gte: new Date(now.getFullYear(), now.getMonth() - 5, 1), lte: now },
      },
      select: { durationMinutes: true, workDate: true },
    }),
  ]);

  function toInsightEntry(entry: (typeof entries)[number]): InsightEntry {
    return {
      id: entry.id,
      title: entry.title,
      category: entry.category,
      description: entry.description,
      clientId,
      clientName,
      durationMinutes: entry.durationMinutes,
      workDate: entry.workDate,
      employeeId: entry.employee.id,
      employeeName: entry.employee.name,
    };
  }

  const insights = buildProcessInsights(entries.map(toInsightEntry), previousEntries.map(toInsightEntry));
  const totalMinutes = insights.totalMinutes;
  const includedMinutes = client.freeMinutesPerMonth;

  const monthly = new Map<string, { minutes: number; weightedCost: number }>();
  for (const entry of entries) {
    const key = monthKey(entry.workDate);
    const rate = Number(
      entry.employee.hourlyRate
      ?? entry.employee.workRole?.defaultHourlyRate
      ?? client.organization.defaultHourlyRate
      ?? FALLBACK_HOURLY_RATE,
    );
    const row = monthly.get(key) ?? { minutes: 0, weightedCost: 0 };
    row.minutes += entry.durationMinutes;
    row.weightedCost += (entry.durationMinutes / 60) * rate;
    monthly.set(key, row);
  }

  let additionalMinutes = 0;
  let additionalValue = 0;
  if (includedMinutes !== null) {
    for (const row of monthly.values()) {
      const extra = Math.max(0, row.minutes - includedMinutes);
      const averageRate = row.minutes > 0 ? row.weightedCost / (row.minutes / 60) : FALLBACK_HOURLY_RATE;
      additionalMinutes += extra;
      additionalValue += (extra / 60) * averageRate;
    }
  }

  // Work areas with real examples: this is what the client actually recognises.
  const groups = new Map<string, { minutes: number; entries: typeof entries }>();
  for (const entry of entries) {
    const key = normalizeCategoryKey(entry.category);
    const group = groups.get(key) ?? { minutes: 0, entries: [] };
    group.minutes += entry.durationMinutes;
    group.entries.push(entry);
    groups.set(key, group);
  }
  const sortedGroups = [...groups.entries()].sort((a, b) => b[1].minutes - a[1].minutes);

  const categories = sortedGroups.slice(0, 6).map(([key, group]) => ({
    key,
    label: categoryLabel(key),
    minutes: group.minutes,
    sharePercent: totalMinutes > 0 ? Math.round((group.minutes / totalMinutes) * 100) : 0,
  }));

  const workGroups: ReportWorkGroup[] = sortedGroups.slice(0, 6).map(([key, group]) => ({
    key,
    label: categoryLabel(key),
    minutes: group.minutes,
    count: group.entries.length,
    employeeCount: new Set(group.entries.map((entry) => entry.employee.id)).size,
    examples: [...group.entries]
      .sort((a, b) => b.durationMinutes - a.durationMinutes)
      .slice(0, EXAMPLES_PER_GROUP)
      .map((entry) => ({
        id: entry.id,
        title: entry.title,
        date: shortDate.format(entry.workDate),
        minutes: entry.durationMinutes,
        employee: entry.employee.name,
      })),
  }));

  const employeeTotals = new Map<string, { name: string; minutes: number; count: number; areas: Map<string, number> }>();
  for (const entry of entries) {
    const row = employeeTotals.get(entry.employee.id)
      ?? { name: entry.employee.name, minutes: 0, count: 0, areas: new Map<string, number>() };
    const areaKey = normalizeCategoryKey(entry.category);
    row.minutes += entry.durationMinutes;
    row.count += 1;
    row.areas.set(areaKey, (row.areas.get(areaKey) ?? 0) + entry.durationMinutes);
    employeeTotals.set(entry.employee.id, row);
  }
  const employees: ReportEmployee[] = [...employeeTotals.entries()]
    .map(([id, row]) => ({
      id,
      name: row.name,
      minutes: row.minutes,
      count: row.count,
      topArea: categoryLabel([...row.areas.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "other"),
    }))
    .sort((a, b) => b.minutes - a.minutes);

  const causeTotals = new Map<string, { label: string; count: number; minutes: number }>();
  for (const process of insights.processes) {
    for (const cause of process.causes) {
      const current = causeTotals.get(cause.key) ?? { label: cause.label, count: 0, minutes: 0 };
      current.count += cause.count;
      current.minutes += cause.minutes;
      causeTotals.set(cause.key, current);
    }
  }
  const topCauses = [...causeTotals.values()].sort((a, b) => b.minutes - a.minutes).slice(0, 4);

  const months = lastSixMonths();
  const chartData = months.map((month) => ({
    label: month.label,
    minutes: sixMonthEntries
      .filter((entry) => monthKey(entry.workDate) === month.key)
      .reduce((sum, entry) => sum + entry.durationMinutes, 0),
  }));

  return (
    <div className="space-y-6">
      <div data-print="hide">
        <PageHeader
          title={`Sadarbības pārskats · ${client.name}`}
          description="Gatavs dokuments, ko var izdrukāt, saglabāt kā PDF un nosūtīt klientam."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <PeriodTabs current={period} />
              <ClientReportActions />
            </div>
          }
        />
        <Button asChild variant="ghost" size="sm">
          <Link href={`/manager/clients/${client.id}`}>
            <ArrowLeft className="size-4" /> Iekšējais klienta skats
          </Link>
        </Button>
      </div>

      <ClientReportDocument
        organizationName={client.organization.name}
        clientName={client.name}
        documentNumber={documentNumber(client.name, now)}
        periodLabel={periodLabel(period, currentStart, now)}
        generatedAt={shortDate.format(now)}
        totalMinutes={totalMinutes}
        entryCount={entries.length}
        includedLabel={includedMinutes === null ? "Nav noteikts" : `${formatDurationLV(includedMinutes)} / mēn.`}
        additionalLabel={includedMinutes === null ? "Nav aprēķināts" : formatDurationLV(additionalMinutes)}
        additionalValueLabel={includedMinutes === null ? "Nav aprēķināta" : money(Math.round(additionalValue))}
        months={chartData}
        categories={categories}
        employees={employees}
        workGroups={workGroups}
        causes={topCauses}
        recommendations={insights.recommendations}
      />
    </div>
  );
}
