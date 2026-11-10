import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { LEGACY_SMART_LOG_CATEGORIES, SMART_LOG_CATEGORY_LABELS } from "@/lib/smart-log";

/**
 * Live figures from the PB Finanses pilot for the landing page.
 *
 * PB Finanses agreed (2026-11-10) to have their aggregates published as they
 * grow. Only totals leave this module: no entry text, client names or employee
 * names, and help recipients are reduced to letters by the page.
 *
 * Computed once a day (the `revalidate` below plus the pages' own) - one
 * organisation's approved entries, a few thousand rows, so the cost is a single
 * small read per day rather than one per visitor.
 */

const PILOT_ORG_SLUG = process.env.PILOT_ORG_SLUG ?? "pb-finanses";
const PILOT_START = "2026-07-06";

export type PilotHelpEdge = { times: number; minutes: number; topCategory: string | null };

export type PilotStats = {
  /** yyyy-mm-dd the figures were computed on. */
  asOf: string;
  startedOn: string;
  entries: number;
  returned: number;
  people: number;
  totalMinutes: number;
  medianEntryMinutes: number;
  avgEntryMinutes: number;
  under15Pct: number;
  helpEntries: number;
  helpMinutes: number;
  helpPct: number;
  /** The one person who logged the most help, and who they helped. */
  topHelperEntries: number;
  topHelperSharePct: number;
  helpFlow: PilotHelpEdge[];
  top3PeoplePct: number;
  top1PersonPct: number;
  busiestPersonMinutes: number;
  quietestPersonMinutes: number;
  recurringProcesses: number;
  recurringEntriesPct: number;
  clients: number;
  top5ClientsPct: number;
  largestClientMinutes: number;
  secondClientMinutes: number;
  medianClientMinutes: number;
  clientsOver10h: number;
  clientsUnder1h: number;
  topCategory: { label: string; entries: number; minutes: number } | null;
  /** Complete calendar months only, oldest first. */
  months: { month: string; minutes: number }[];
};

/**
 * Last good snapshot (2026-11-10), shown if the database can't be reached so
 * the landing never renders empty tiles.
 */
const FALLBACK: PilotStats = {
  asOf: "2026-11-10",
  startedOn: PILOT_START,
  entries: 2413,
  returned: 0,
  people: 10,
  totalMinutes: 113232,
  medianEntryMinutes: 30,
  avgEntryMinutes: 47,
  under15Pct: 22,
  helpEntries: 443,
  helpMinutes: 23754,
  helpPct: 21,
  topHelperEntries: 228,
  topHelperSharePct: 52,
  helpFlow: [],
  top3PeoplePct: 47,
  top1PersonPct: 17,
  busiestPersonMinutes: 18834,
  quietestPersonMinutes: 2814,
  recurringProcesses: 227,
  recurringEntriesPct: 49,
  clients: 119,
  top5ClientsPct: 21,
  largestClientMinutes: 5928,
  secondClientMinutes: 5886,
  medianClientMinutes: 492,
  clientsOver10h: 43,
  clientsUnder1h: 8,
  topCategory: null,
  months: [
    { month: "2026-07", minutes: 13002 },
    { month: "2026-08", minutes: 14442 },
    { month: "2026-09", minutes: 30714 },
    { month: "2026-10", minutes: 41376 },
  ],
};

const LEGACY_LABELS: Record<string, string> = Object.fromEntries(
  LEGACY_SMART_LOG_CATEGORIES.map((c) => [c.value, c.label]),
);

// "Other" buckets say nothing about the work, so they never stand in as the
// headline category.
const UNINFORMATIVE = new Set(["other", "other_work", "cits"]);

function readableCategory(key: string): string | null {
  if (UNINFORMATIVE.has(key)) return null;
  const label = (SMART_LOG_CATEGORY_LABELS as Record<string, string>)[key] ?? LEGACY_LABELS[key];
  if (!label) return null;
  return label.charAt(0).toLocaleUpperCase("lv-LV") + label.slice(1);
}

const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);
const median = (sorted: number[]) => (sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0);

function topBy<K>(map: Map<K, number>) {
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

async function compute(): Promise<PilotStats> {
  const org = await prisma.organization.findUnique({ where: { slug: PILOT_ORG_SLUG }, select: { id: true } });
  if (!org) return FALLBACK;

  const rows = await prisma.invisibleWorkEntry.findMany({
    where: { organizationId: org.id, deletedAt: null, workDate: { gte: new Date(`${PILOT_START}T00:00:00Z`) } },
    select: {
      employeeId: true,
      clientId: true,
      clientName: true,
      category: true,
      durationMinutes: true,
      status: true,
      helpedColleague: true,
      helpedUserId: true,
      workDate: true,
    },
  });
  const entries = rows.filter((r) => r.status === "APPROVED");
  if (entries.length === 0) return FALLBACK;

  const totalMinutes = entries.reduce((sum, r) => sum + r.durationMinutes, 0);
  const durations = entries.map((r) => r.durationMinutes).sort((a, b) => a - b);

  const byPerson = new Map<string, number>();
  for (const r of entries) byPerson.set(r.employeeId, (byPerson.get(r.employeeId) ?? 0) + r.durationMinutes);
  const people = topBy(byPerson).map(([, m]) => m);

  const clientKey = (r: (typeof entries)[number]) =>
    r.clientId ?? (r.clientName ? `name:${r.clientName.trim().toLocaleLowerCase("lv-LV")}` : null);
  const byClient = new Map<string, number>();
  const byClientCategory = new Map<string, number>();
  for (const r of entries) {
    const key = clientKey(r);
    if (!key) continue;
    byClient.set(key, (byClient.get(key) ?? 0) + r.durationMinutes);
    byClientCategory.set(`${key}|${r.category}`, (byClientCategory.get(`${key}|${r.category}`) ?? 0) + 1);
  }
  const clients = topBy(byClient).map(([, m]) => m);
  const clientsAscending = [...clients].sort((a, b) => a - b);
  const recurring = [...byClientCategory.values()].filter((n) => n >= 3);

  // Help: who logged the most of it, and how it spreads across the people they helped.
  const help = entries.filter((r) => r.helpedColleague || r.helpedUserId);
  const helpMinutes = help.reduce((sum, r) => sum + r.durationMinutes, 0);
  const helpByPerson = new Map<string, number>();
  for (const r of help) helpByPerson.set(r.employeeId, (helpByPerson.get(r.employeeId) ?? 0) + r.durationMinutes);
  const [topHelper] = topBy(helpByPerson);
  const topHelperRows = topHelper ? help.filter((r) => r.employeeId === topHelper[0]) : [];
  const recipients = new Map<string, { times: number; minutes: number; categories: Map<string, number> }>();
  for (const r of topHelperRows) {
    if (!r.helpedUserId) continue;
    const edge = recipients.get(r.helpedUserId) ?? { times: 0, minutes: 0, categories: new Map() };
    edge.times += 1;
    edge.minutes += r.durationMinutes;
    edge.categories.set(r.category, (edge.categories.get(r.category) ?? 0) + r.durationMinutes);
    recipients.set(r.helpedUserId, edge);
  }
  const helpFlow = [...recipients.values()]
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 7)
    .map((edge) => ({
      times: edge.times,
      minutes: edge.minutes,
      topCategory: topBy(edge.categories).map(([key]) => readableCategory(key)).find(Boolean) ?? null,
    }));

  const byCategory = new Map<string, { entries: number; minutes: number }>();
  for (const r of entries) {
    const c = byCategory.get(r.category) ?? { entries: 0, minutes: 0 };
    c.entries += 1;
    c.minutes += r.durationMinutes;
    byCategory.set(r.category, c);
  }
  const topCategory =
    [...byCategory.entries()]
      .sort((a, b) => b[1].minutes - a[1].minutes)
      .map(([key, c]) => ({ label: readableCategory(key), ...c }))
      .find((c): c is { label: string; entries: number; minutes: number } => c.label !== null) ?? null;

  const currentMonth = new Date().toISOString().slice(0, 7);
  const byMonth = new Map<string, number>();
  for (const r of entries) {
    const month = r.workDate.toISOString().slice(0, 7);
    if (month < currentMonth) byMonth.set(month, (byMonth.get(month) ?? 0) + r.durationMinutes);
  }

  return {
    asOf: new Date().toISOString().slice(0, 10),
    startedOn: PILOT_START,
    entries: entries.length,
    returned: rows.filter((r) => r.status !== "APPROVED" && r.status !== "PENDING").length,
    people: byPerson.size,
    totalMinutes,
    medianEntryMinutes: median(durations),
    avgEntryMinutes: Math.round(totalMinutes / entries.length),
    under15Pct: pct(durations.filter((m) => m < 15).length, entries.length),
    helpEntries: help.length,
    helpMinutes,
    helpPct: pct(helpMinutes, totalMinutes),
    topHelperEntries: topHelperRows.length,
    topHelperSharePct: pct(topHelper?.[1] ?? 0, helpMinutes),
    helpFlow,
    top3PeoplePct: pct(people.slice(0, 3).reduce((s, m) => s + m, 0), totalMinutes),
    top1PersonPct: pct(people[0] ?? 0, totalMinutes),
    busiestPersonMinutes: people[0] ?? 0,
    quietestPersonMinutes: people.at(-1) ?? 0,
    recurringProcesses: recurring.length,
    recurringEntriesPct: pct(recurring.reduce((s, n) => s + n, 0), entries.length),
    clients: clients.length,
    top5ClientsPct: pct(clients.slice(0, 5).reduce((s, m) => s + m, 0), totalMinutes),
    largestClientMinutes: clients[0] ?? 0,
    secondClientMinutes: clients[1] ?? 0,
    medianClientMinutes: median(clientsAscending),
    clientsOver10h: clients.filter((m) => m > 600).length,
    clientsUnder1h: clients.filter((m) => m < 60).length,
    topCategory,
    months: [...byMonth.entries()].sort().map(([month, minutes]) => ({ month, minutes })),
  };
}

const cachedCompute = unstable_cache(compute, ["pilot-stats-v1"], { revalidate: 86400 });

export async function getPilotStats(): Promise<PilotStats> {
  try {
    return await cachedCompute();
  } catch (error) {
    console.error("[pilot-stats] falling back to snapshot", error);
    return FALLBACK;
  }
}
