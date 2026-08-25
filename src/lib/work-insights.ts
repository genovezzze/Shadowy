import {
  CATEGORY_LABEL_ALIASES,
  LEGACY_SMART_LOG_CATEGORIES,
  SMART_LOG_CATEGORIES,
  SMART_LOG_CATEGORY_LABELS,
  type SmartLogCategory,
} from "@/lib/smart-log";
import { buildClientLookup, normalizeClientName } from "@/lib/client-name";

/**
 * Legacy labels belong here too. Retiring a category moves it out of
 * SMART_LOG_CATEGORIES, and if this map were built from the live list alone,
 * every row still storing that label would stop folding into its key - the 123
 * rows reading "palīdzība kolēģim" would split off from the 6 reading
 * "helping_colleague" and render as two identical-looking chart lines.
 */
const LABEL_TO_KEY: Record<string, string> = Object.fromEntries(
  [...SMART_LOG_CATEGORIES, ...LEGACY_SMART_LOG_CATEGORIES].map((c) => [
    c.label.toLowerCase(),
    c.value,
  ])
);

/**
 * Older entries (manual or pre-migration AI parses) can store the category as
 * its Latvian label text ("darba algas aprēķini") instead of the canonical key
 * ("payroll_calculation"). Collapse both forms to the same key before grouping,
 * so they don't show up as two separate rows that happen to render identically.
 */
export function normalizeCategoryKey(category: string): string {
  if (category in SMART_LOG_CATEGORY_LABELS) return category;
  const lowered = category.trim().toLowerCase();
  return LABEL_TO_KEY[lowered] ?? CATEGORY_LABEL_ALIASES[lowered] ?? category;
}

type MinimalEntry = { category: string; durationMinutes: number };

export type CategoryBreakdown = { category: string; count: number; minutes: number };

export function groupByCategory(entries: MinimalEntry[]): CategoryBreakdown[] {
  const map = new Map<string, CategoryBreakdown>();
  for (const e of entries) {
    const key = normalizeCategoryKey(e.category);
    const cur = map.get(key) ?? { category: key, count: 0, minutes: 0 };
    cur.count += 1;
    cur.minutes += e.durationMinutes;
    map.set(key, cur);
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
      if (normalizeCategoryKey(e.category) !== g.category) continue;
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
type ClientRef = { id: string; name: string; aliases?: { normalized: string }[] };
/**
 * `filterValue` is the value the entries-page client filter expects
 * (`id:<clientId>` or `name:<free-typed name>`), so a breakdown row can be
 * turned into a link straight to the entries behind it.
 */
export type ClientBreakdown = { name: string; minutes: number; filterValue: string };

/**
 * Groups entries by client, deduping "SIA X" / "X" style name variants like
 * the dashboards do. Pass the org's registered clients so a free-typed name
 * that is really an alias ("VKK") folds into its client instead of forming a
 * second row next to it.
 */
export function groupByClient(
  entries: MinimalClientEntry[],
  clients: ClientRef[] = [],
): ClientBreakdown[] {
  const clientById = new Map(clients.map((c) => [c.id, c]));
  const clientByNorm = buildClientLookup(clients);
  const byId = new Map<string, ClientBreakdown>();
  const byName = new Map<string, ClientBreakdown>();

  for (const e of entries) {
    // A free-typed name that resolves to a registered client is counted under
    // that client, so its hours land in a single row under the official name.
    const registered = e.clientId
      ? clientById.get(e.clientId)
      : e.clientName
        ? clientByNorm.get(normalizeClientName(e.clientName))
        : undefined;

    if (registered) {
      const cur = byId.get(registered.id)
        ?? { name: registered.name, minutes: 0, filterValue: `id:${registered.id}` };
      cur.minutes += e.durationMinutes;
      byId.set(registered.id, cur);
    } else if (e.clientId) {
      // Caller passed no client list (or the client is gone) - keep the old
      // behaviour of grouping on the id alone.
      const cur = byId.get(e.clientId)
        ?? { name: e.clientName ?? e.clientId, minutes: 0, filterValue: `id:${e.clientId}` };
      cur.minutes += e.durationMinutes;
      byId.set(e.clientId, cur);
    } else if (e.clientName) {
      const key = normalizeClientName(e.clientName);
      const cur = byName.get(key)
        ?? { name: e.clientName, minutes: 0, filterValue: `name:${e.clientName}` };
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

type MinimalRoleEntry = MinimalEmployeeEntry & { roleName: string | null };
export type EmployeeRoleGroup = {
  /** null for employees without a work role - always sorted last. */
  roleName: string | null;
  employeeIds: string[];
  count: number;
  minutes: number;
  members: EmployeeBreakdown[];
};

/**
 * Groups entries by work role and then by employee. Roles carry different
 * rates and duties, so a mixed per-employee list cannot be evaluated: the
 * grouping is what separates e.g. accountants from accounting assistants.
 */
export function groupByRoleAndEmployee(entries: MinimalRoleEntry[]): EmployeeRoleGroup[] {
  const roleByEmployee = new Map<string, string | null>();
  for (const e of entries) {
    if (!roleByEmployee.has(e.employeeId)) roleByEmployee.set(e.employeeId, e.roleName);
  }

  const groups = new Map<string, EmployeeRoleGroup>();
  for (const employee of groupByEmployee(entries)) {
    const roleName = roleByEmployee.get(employee.employeeId) ?? null;
    const key = roleName ?? "";
    const group = groups.get(key)
      ?? { roleName, employeeIds: [], count: 0, minutes: 0, members: [] };
    group.employeeIds.push(employee.employeeId);
    group.count += employee.count;
    group.minutes += employee.minutes;
    group.members.push(employee);
    groups.set(key, group);
  }

  return Array.from(groups.values()).sort((a, b) => {
    if ((a.roleName === null) !== (b.roleName === null)) return a.roleName === null ? 1 : -1;
    return b.minutes - a.minutes;
  });
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

/**
 * Keyed by category, including the retired nature-categories: entries written
 * before those became flags still carry them, so a weekly digest over older
 * data must still find a recommendation.
 */
const RECOMMENDATIONS: Record<string, string> = {
  bookkeeping_invoices:
    "Liela daļa laika aizgāja rēķinu un pavadzīmju grāmatošanai - ja piegādātāji atkārtojas, vērts pārrunāt automātisku ievadi vai e-rēķinus.",
  bookkeeping_receipts:
    "Daudz laika aizgāja čeku grāmatošanai - apsver, vai čekus var savākt digitāli jau to rašanās brīdī.",
  bookkeeping_cash:
    "Liela daļa laika aizgāja kases operācijām - ja Z atskaites un orderi atkārtojas katru nedēļu, vērts paskatīties uz to sagatavošanas procesu.",
  bookkeeping_advances:
    "Daudz laika aizgāja avansa norēķinu grāmatošanai - bieži tas nozīmē, ka atskaites pienāk nepilnīgas.",
  bookkeeping_bank:
    "Liela daļa laika aizgāja bankas operāciju grāmatošanai - vērts pārbaudīt, vai bankas izrakstu var importēt automātiski.",
  document_scanning:
    "Daudz laika pavadīts dokumentu skenēšanā un digitalizēšanā - apsver, vai dokumentus var saņemt jau digitāli.",
  document_archiving:
    "Daudz laika pavadīts dokumentu arhivēšanā un sakārtošanā - ja tas atkārtojas katru mēnesi, vērts pārskatīt glabāšanas kārtību.",
  bookkeeping:
    "Liela daļa laika aizgāja grāmatošanai - ja tie ir līdzīgi dokumenti nedēļu pēc nedēļas, vērts pārrunāt, vai daļu var ievadīt automātiski.",
  document_processing:
    "Daudz laika pavadīts dokumentu skenēšanā un sakārtošanā - apsver, vai dokumentus var saņemt jau digitāli.",
  reconciliation:
    "Liela daļa laika aizgāja pārbaudēm un saskaņošanai - ja kļūdas atkārtojas, vērts paskatīties uz procesu, kurā tās rodas.",
  helping_colleague:
    "Šonedēļ daudz palīdzēji kolēģiem - pārliecinies, ka vadītājs to redz, jo šis darbs bieži paliek nepamanīts.",
  urgent_extra_task:
    "Daudz steidzamu papildu uzdevumu - ja tas atkārtojas arī nākamnedēļ, runā ar vadītāju par darba slodzi.",
  repeated_questions:
    "Daudz atkārtotu jautājumu no kolēģiem - varbūt vērts sagatavot īsu instrukciju vai FAQ, lai ietaupītu laiku nākotnē.",
  fixing_mistakes:
    "Liela daļa laika aizgāja kļūdu labošanai - apsver, vai procesu, kurā šīs kļūdas rodas, var uzlabot.",
  work_outside_role:
    "Liela daļa darba bija ārpus tavas lomas - vērts to pārrunāt ar vadītāju.",
  onboarding:
    "Daudz laika veltīts jaunu cilvēku ievadīšanai darbā - vērtīgs ieguldījums komandā, kas reti tiek pamanīts.",
  statistics_reports:
    "Liela daļa laika aizgāja statistikas pārskatu sagatavošanai - apsver, vai daļu no šī darba var automatizēt vai veidot pēc gatavas veidnes.",
  annual_report:
    "Daudz laika veltīts gada pārskatu sastādīšanai - sezonāls darbs, ko vērts plānot laikus, lai tas nekrājas kopā ar ikdienas uzdevumiem.",
  payroll_calculation:
    "Daudz laika veltīts algu aprēķiniem - ja tas atkārtojas katru nedēļu ar līdzīgu apjomu, vērts pārrunāt ar vadītāju par slodzes sadalījumu.",
  payment_preparation:
    "Liela daļa laika aizgāja maksājumu sagatavošanai - pārbaudi, vai šo procesu var paātrināt ar skaidrākiem šabloniem.",
  invoicing:
    "Daudz laika pavadīts rēķinu izrakstīšanā - apsver, vai atkārtotus rēķinus var sagatavot pēc veidnes.",
  legal_documents:
    "Liela daļa laika aizgāja juridisko dokumentu sagatavošanai - šis darbs bieži prasa īpašu uzmanību, pārliecinies, ka tam ir pietiekami daudz laika.",
  client_communication:
    "Daudz laika pavadīts saziņā ar klientiem - vērtīgs darbs, kas bieži paliek neredzams budžetā.",
  client_meeting:
    "Daudz laika aizņēmušas klātienes tikšanās ar klientiem - apsver, vai daļu no tām var apvienot vai risināt attālināti.",
  hortus_digital_communication:
    "Liela daļa laika aizgāja saziņai ar Hortus Digital - vērtīgs darbs, kas bieži paliek neredzams budžetā.",
  vid_communication:
    "Liela daļa laika aizgāja saziņai ar VID - vērtīgs darbs, kas bieži paliek neredzams budžetā.",
  other:
    "Turpini pierakstīt savu neredzamo darbu - tas palīdz iegūt skaidrāku ainu par nedēļu.",
};

export function weeklyRecommendation(grouped: CategoryBreakdown[]): string {
  const top = topCategory(grouped);
  if (!top) {
    return "Šonedēļ nav ierakstu - pievieno kaut vienu, lai nākamā pārskata būtu par ko runāt.";
  }
  return RECOMMENDATIONS[top.category as SmartLogCategory] ?? RECOMMENDATIONS.other;
}
