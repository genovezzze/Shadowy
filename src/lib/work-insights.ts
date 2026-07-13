import { SMART_LOG_CATEGORY_LABELS, type SmartLogCategory } from "@/lib/smart-log";
import { normalizeClientName } from "@/lib/client-name";

type MinimalEntry = { category: string; durationMinutes: number };

export type CategoryBreakdown = { category: string; count: number; minutes: number };

export function groupByCategory(entries: MinimalEntry[]): CategoryBreakdown[] {
  const map = new Map<string, CategoryBreakdown>();
  for (const e of entries) {
    const cur = map.get(e.category) ?? { category: e.category, count: 0, minutes: 0 };
    cur.count += 1;
    cur.minutes += e.durationMinutes;
    map.set(e.category, cur);
  }
  return Array.from(map.values()).sort((a, b) => b.minutes - a.minutes);
}

export function topCategory(grouped: CategoryBreakdown[]): CategoryBreakdown | null {
  return grouped[0] ?? null;
}

export function categoryLabel(category: string): string {
  return SMART_LOG_CATEGORY_LABELS[category as SmartLogCategory] ?? category;
}

type MinimalTitledEntry = { category: string; title: string; durationMinutes: number };
export type CategoryBreakdownDetailed = CategoryBreakdown & {
  topTitles: { title: string; count: number }[];
};

/** Like groupByCategory, but also surfaces the most common entry titles per category (same "drill-down" data as the report page's category list). */
export function groupByCategoryWithTitles(
  entries: MinimalTitledEntry[],
  titleLimit = 3
): CategoryBreakdownDetailed[] {
  const grouped = groupByCategory(entries);
  return grouped.map((g) => {
    const titleCounts = new Map<string, number>();
    for (const e of entries) {
      if (e.category !== g.category) continue;
      titleCounts.set(e.title, (titleCounts.get(e.title) ?? 0) + 1);
    }
    const topTitles = [...titleCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, titleLimit)
      .map(([title, count]) => ({ title, count }));
    return { ...g, topTitles };
  });
}

type MinimalClientEntry = { clientId: string | null; clientName: string | null; durationMinutes: number };
export type ClientBreakdown = { name: string; minutes: number };

/** Groups entries by client, deduping "SIA X" / "X" style name variants like the dashboards do. */
export function groupByClient(entries: MinimalClientEntry[]): ClientBreakdown[] {
  const byId = new Map<string, ClientBreakdown>();
  const byName = new Map<string, ClientBreakdown>();
  for (const e of entries) {
    if (e.clientId) {
      const cur = byId.get(e.clientId) ?? { name: e.clientName ?? e.clientId, minutes: 0 };
      cur.minutes += e.durationMinutes;
      byId.set(e.clientId, cur);
    } else if (e.clientName) {
      const key = normalizeClientName(e.clientName);
      const cur = byName.get(key) ?? { name: e.clientName, minutes: 0 };
      cur.minutes += e.durationMinutes;
      byName.set(key, cur);
    }
  }
  return [...byId.values(), ...byName.values()].sort((a, b) => b.minutes - a.minutes);
}

type MinimalEmployeeEntry = { employeeId: string; employeeName: string; durationMinutes: number };
export type EmployeeBreakdown = { employeeId: string; name: string; count: number; minutes: number };

/** Groups entries by employee, for team-wide manager reports. */
export function groupByEmployee(entries: MinimalEmployeeEntry[]): EmployeeBreakdown[] {
  const map = new Map<string, EmployeeBreakdown>();
  for (const e of entries) {
    const cur = map.get(e.employeeId) ?? { employeeId: e.employeeId, name: e.employeeName, count: 0, minutes: 0 };
    cur.count += 1;
    cur.minutes += e.durationMinutes;
    map.set(e.employeeId, cur);
  }
  return Array.from(map.values()).sort((a, b) => b.minutes - a.minutes);
}

/** Percentage week-over-week change (for continuous values like minutes), or null with no prior week. */
export function weekTrend(current: number, previous: number): string | null {
  if (previous === 0) return null;
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return "tāpat kā iepriekšējā nedēļā";
  return `${pct > 0 ? "+" : ""}${pct}% vs iepriekšējā nedēļa`;
}

/** Absolute week-over-week change (for small counts like entries), or null with no prior week. */
export function weekCountTrend(current: number, previous: number): string | null {
  if (previous === 0) return null;
  const diff = current - previous;
  if (diff === 0) return "tik pat, cik iepriekšējā nedēļā";
  return `${diff > 0 ? "+" : ""}${diff} vs iepriekšējā nedēļa`;
}

const RECOMMENDATIONS: Record<SmartLogCategory, string> = {
  helping_colleague:
    "Šonedēļ daudz palīdzēji kolēģiem — pārliecinies, ka vadītājs to redz, jo šis darbs bieži paliek nepamanīts.",
  urgent_extra_task:
    "Daudz steidzamu papildu uzdevumu — ja tas atkārtojas arī nākamnedēļ, runā ar vadītāju par darba slodzi.",
  repeated_questions:
    "Daudz atkārtotu jautājumu no kolēģiem — varbūt vērts sagatavot īsu instrukciju vai FAQ, lai ietaupītu laiku nākotnē.",
  fixing_mistakes:
    "Liela daļa laika aizgāja kļūdu labošanai — apsver, vai procesu, kurā šīs kļūdas rodas, var uzlabot.",
  work_outside_role:
    "Liela daļa darba bija ārpus tavas lomas — vērts to pārrunāt ar vadītāju.",
  onboarding:
    "Daudz laika veltīts jaunu cilvēku ievadīšanai darbā — vērtīgs ieguldījums komandā, kas reti tiek pamanīts.",
  statistics_reports:
    "Liela daļa laika aizgāja statistikas pārskatu sagatavošanai — apsver, vai daļu no šī darba var automatizēt vai veidot pēc gatavas veidnes.",
  payroll_calculation:
    "Daudz laika veltīts algu aprēķiniem — ja tas atkārtojas katru nedēļu ar līdzīgu apjomu, vērts pārrunāt ar vadītāju par slodzes sadalījumu.",
  payment_preparation:
    "Liela daļa laika aizgāja maksājumu sagatavošanai — pārbaudi, vai šo procesu var paātrināt ar skaidrākiem šabloniem.",
  invoicing:
    "Daudz laika pavadīts rēķinu izrakstīšanā — apsver, vai atkārtotus rēķinus var sagatavot pēc veidnes.",
  legal_documents:
    "Liela daļa laika aizgāja juridisko dokumentu sagatavošanai — šis darbs bieži prasa īpašu uzmanību, pārliecinies, ka tam ir pietiekami daudz laika.",
  client_communication:
    "Daudz laika pavadīts saziņā ar klientiem — vērtīgs darbs, kas bieži paliek neredzams budžetā.",
  client_meeting:
    "Daudz laika aizņēmušas klātienes tikšanās ar klientiem — apsver, vai daļu no tām var apvienot vai risināt attālināti.",
  hortus_digital_communication:
    "Liela daļa laika aizgāja saziņai ar Hortus Digital — vērtīgs darbs, kas bieži paliek neredzams budžetā.",
  other:
    "Turpini pierakstīt savu neredzamo darbu — tas palīdz iegūt skaidrāku ainu par nedēļu.",
};

export function weeklyRecommendation(grouped: CategoryBreakdown[]): string {
  const top = topCategory(grouped);
  if (!top) {
    return "Šonedēļ nav ierakstu — pievieno kaut vienu, lai nākamā pārskata būtu par ko runāt.";
  }
  return RECOMMENDATIONS[top.category as SmartLogCategory] ?? RECOMMENDATIONS.other;
}
