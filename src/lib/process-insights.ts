import { categoryLabel, normalizeCategoryKey } from "@/lib/work-insights";

export type InsightEntry = {
  id: string;
  title: string;
  category: string;
  description: string;
  clientId: string | null;
  clientName: string | null;
  durationMinutes: number;
  workDate: Date;
  employeeId: string;
  employeeName: string;
};

export type InsightCause = {
  key: string;
  label: string;
  count: number;
  minutes: number;
};

export type ProcessInsight = {
  key: string;
  categoryKey: string;
  label: string;
  count: number;
  minutes: number;
  averageMinutes: number;
  employeeCount: number;
  clientCount: number;
  lastSeen: Date;
  trendPercent: number | null;
  topTitles: { title: string; count: number }[];
  causes: InsightCause[];
};

export type ClientProcessShare = {
  key: string;
  label: string;
  minutes: number;
  sharePercent: number;
};

export type ClientInsight = {
  key: string;
  id: string | null;
  name: string;
  count: number;
  minutes: number;
  /** Share of every logged minute in the period, registered clients or not. */
  sharePercent: number;
  /** Share of the time that is attributed to registered clients. */
  clientSharePercent: number;
  averageMinutes: number;
  employeeCount: number;
  previousMinutes: number;
  /** Change against the equally long preceding period; null when there is nothing to compare. */
  trendPercent: number | null;
  /** Equal-width buckets across the analysed window, so rows are comparable. */
  trendPoints: number[];
  lastSeen: Date;
  topProcess: string;
  topCause: string | null;
  processes: ClientProcessShare[];
  causes: InsightCause[];
};

export type RecommendationProcess = {
  key: string;
  categoryKey: string;
  label: string;
  count: number;
  minutes: number;
};

export type ProcessRecommendation = {
  /** Primary (largest) process — used for links and as the React key. */
  processKey: string;
  categoryKey: string;
  processLabel: string;
  /** Every process this one suggestion covers, largest first. */
  processes: RecommendationProcess[];
  entryCount: number;
  minutes: number;
  title: string;
  description: string;
  employeeHelp: string;
  evidence: string;
  confidence: "high" | "medium" | "low";
  score: number;
  savingLowMinutes: number;
  savingHighMinutes: number;
};

export type ProcessInsightsResult = {
  totalEntries: number;
  totalMinutes: number;
  repeatedProcessCount: number;
  processCoveragePercent: number;
  potentialSavingLowMinutes: number;
  potentialSavingHighMinutes: number;
  /** Minutes that belong to registered clients. */
  clientMinutes: number;
  clientEntries: number;
  /** How much of the client time the three largest clients take. */
  clientConcentrationPercent: number;
  processes: ProcessInsight[];
  clients: ClientInsight[];
  recommendations: ProcessRecommendation[];
};

const TREND_BUCKETS = 6;

type CauseRule = {
  key: string;
  label: string;
  patterns: RegExp[];
};

const CAUSE_RULES: CauseRule[] = [
  {
    key: "missing_information",
    label: "Trūkst informācijas vai dokumentu",
    patterns: [/trukst/, /nepiln/, /nav sanem/, /gaid.*dokument/, /papildinform/, /precize/],
  },
  {
    key: "corrections",
    label: "Kļūdu un neprecizitāšu labošana",
    patterns: [/klud/, /laboj/, /nepareiz/, /parstrad/, /korekc/],
  },
  {
    key: "manual_work",
    label: "Manuāla datu apstrāde",
    patterns: [/manual/, /ar roku/, /ievad/, /parnes/, /kop[eē]/, /excel/],
  },
  {
    key: "coordination",
    label: "Saskaņošana un komunikācija",
    patterns: [/saskan/, /sazin/, /komunik/, /atbild/, /jautaj/, /zvan/],
  },
  {
    key: "urgent_requests",
    label: "Steidzami vai neplānoti pieprasījumi",
    patterns: [/steidz/, /nekavej/, /neplan/, /prioritat/],
  },
  {
    key: "system_friction",
    label: "Sistēmu vai integrāciju ierobežojumi",
    patterns: [/sistem/, /programma/, /nedarbo/, /tehnisk/, /integrac/, /eksport/, /import/],
  },
];

const BROAD_CATEGORIES = new Set([
  "helping_colleague",
  "other",
  "urgent_extra_task",
  "work_outside_role",
]);

function normalizedTitle(title: string) {
  return title
    .toLocaleLowerCase("lv-LV")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\b(par|pie|ar|un|no|uz|klientam|klienta|kolegam|kolegei)\b/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 100);
}

function processGroupKey(entry: InsightEntry) {
  const categoryKey = normalizeCategoryKey(entry.category);
  if (!BROAD_CATEGORIES.has(categoryKey)) return categoryKey;
  return `${categoryKey}::${normalizedTitle(entry.title) || "bez-nosaukuma"}`;
}

function searchableText(entry: InsightEntry) {
  return `${entry.title} ${entry.description}`
    .toLocaleLowerCase("lv-LV")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function detectedCauseKeys(entry: InsightEntry): string[] {
  const text = searchableText(entry);
  return CAUSE_RULES
    .filter((rule) => rule.patterns.some((pattern) => pattern.test(text)))
    .map((rule) => rule.key);
}

function buildCauses(entries: InsightEntry[]): InsightCause[] {
  const causes = new Map<string, InsightCause>();
  for (const entry of entries) {
    for (const causeKey of detectedCauseKeys(entry)) {
      const rule = CAUSE_RULES.find((item) => item.key === causeKey)!;
      const current = causes.get(causeKey) ?? {
        key: causeKey,
        label: rule.label,
        count: 0,
        minutes: 0,
      };
      current.count += 1;
      current.minutes += entry.durationMinutes;
      causes.set(causeKey, current);
    }
  }
  return [...causes.values()].sort((a, b) => b.minutes - a.minutes || b.count - a.count);
}

function clientKey(entry: InsightEntry) {
  if (entry.clientId) return `id:${entry.clientId}`;
  if (!entry.clientName) return null;
  return `name:${entry.clientName.trim().toLocaleLowerCase("lv-LV")}`;
}

type Suggestion = {
  title: string;
  description: string;
  employeeHelp: string;
  lowRate: number;
  highRate: number;
};

function recommendationFor(process: ProcessInsight): Suggestion {
  const cause = process.causes[0]?.key;

  if (cause === "missing_information") {
    return {
      title: "Standartizēt informācijas saņemšanu",
      description: "Izveidojiet vienotu klienta pieprasījuma formu ar obligātajiem laukiem un dokumentu sarakstu.",
      employeeHelp: "Darbiniekam būs gatavs pieprasījuma šablons un nebūs atkārtoti jāmeklē trūkstošā informācija.",
      lowRate: 0.2,
      highRate: 0.35,
    };
  }
  if (cause === "corrections") {
    return {
      title: "Ieviest pārbaudes soli pirms nodošanas",
      description: "Pievienojiet īsu kontrolsarakstu biežākajām kļūdām un vienojieties par skaidru darba nodošanas kārtību.",
      employeeHelp: "Darbinieks saņem vienotu pārbaudes secību un mazāk laika velta atkārtotai labošanai.",
      lowRate: 0.2,
      highRate: 0.4,
    };
  }
  if (cause === "manual_work") {
    return {
      title: "Pārbaudīt automatizācijas iespēju",
      description: "Izvērtējiet datu importu, veidni vai integrāciju, kas aizstāj atkārtotu manuālu ievadi.",
      employeeHelp: "Darbiniekam paliek pārbaude un izņēmumu apstrāde, nevis vienādu datu pārrakstīšana.",
      lowRate: 0.25,
      highRate: 0.45,
    };
  }
  if (cause === "coordination") {
    return {
      title: "Samazināt atkārtotu saskaņošanu",
      description: "Nosakiet vienu saziņas kanālu, atbildīgo personu un gatavas atbildes biežākajiem jautājumiem.",
      employeeHelp: "Darbiniekam būs skaidrs kontakts un gatava atbilde, nevis atkārtota informācijas meklēšana.",
      lowRate: 0.15,
      highRate: 0.3,
    };
  }
  if (cause === "system_friction") {
    return {
      title: "Novērst sistēmu starpposmu",
      description: "Kartējiet, kur dati tiek pārvietoti starp sistēmām, un pārbaudiet importa, eksporta vai integrācijas iespējas.",
      employeeHelp: "Darbiniekam samazināsies pārslēgšanās starp sistēmām un atkārtotas darbības.",
      lowRate: 0.2,
      highRate: 0.4,
    };
  }

  const category = process.categoryKey;
  if (["statistics_reports", "invoicing", "payment_preparation", "payroll_calculation"].includes(category)) {
    return {
      title: "Izveidot atkārtojamu veidni",
      description: "Fiksējiet procesa soļus vienā veidnē un pārbaudiet, kurus laukus iespējams aizpildīt automātiski.",
      employeeHelp: "Darbinieks var sākt no gatavas struktūras un koncentrēties uz pārbaudi un izņēmumiem.",
      lowRate: 0.15,
      highRate: 0.3,
    };
  }
  if (["repeated_questions", "onboarding"].includes(category)) {
    return {
      title: "Pārvērst pieredzi īsā instrukcijā",
      description: "Izveidojiet vienas lapas instrukciju vai FAQ no biežāk atkārtotajiem jautājumiem.",
      employeeHelp: "Darbinieki var atrast atbildi paši un izmantot vienotu, pārbaudītu skaidrojumu.",
      lowRate: 0.15,
      highRate: 0.3,
    };
  }

  return {
    title: "Standartizēt atkārtojošos procesu",
    description: "Aprakstiet procesa sākumu, atbildīgo, nepieciešamo informāciju un vēlamo rezultātu vienā īsā kontrolsarakstā.",
    employeeHelp: "Darbiniekam būs skaidra darba secība un mazāk neskaidru starpposmu.",
    lowRate: 0.1,
    highRate: 0.2,
  };
}

function roundedSaving(minutes: number, rate: number) {
  return Math.max(5, Math.round((minutes * rate) / 5) * 5);
}

export function buildProcessInsights(
  entries: InsightEntry[],
  previousEntries: InsightEntry[] = [],
): ProcessInsightsResult {
  const byProcess = new Map<string, InsightEntry[]>();
  const previousMinutes = new Map<string, number>();

  for (const entry of entries) {
    const key = processGroupKey(entry);
    const list = byProcess.get(key) ?? [];
    list.push(entry);
    byProcess.set(key, list);
  }
  for (const entry of previousEntries) {
    const key = processGroupKey(entry);
    previousMinutes.set(key, (previousMinutes.get(key) ?? 0) + entry.durationMinutes);
  }

  const processes: ProcessInsight[] = [...byProcess.entries()].map(([key, processEntries]) => {
    const categoryKey = normalizeCategoryKey(processEntries[0].category);
    const minutes = processEntries.reduce((sum, entry) => sum + entry.durationMinutes, 0);
    const titles = new Map<string, number>();
    const employees = new Set<string>();
    const clients = new Set<string>();
    for (const entry of processEntries) {
      titles.set(entry.title, (titles.get(entry.title) ?? 0) + 1);
      employees.add(entry.employeeId);
      const keyForClient = clientKey(entry);
      if (keyForClient) clients.add(keyForClient);
    }
    const before = previousMinutes.get(key) ?? 0;
    const topTitles = [...titles.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([title, count]) => ({ title, count }));
    return {
      key,
      categoryKey,
      label: BROAD_CATEGORIES.has(categoryKey) ? topTitles[0]?.title ?? categoryLabel(categoryKey) : categoryLabel(categoryKey),
      count: processEntries.length,
      minutes,
      averageMinutes: Math.round(minutes / processEntries.length),
      employeeCount: employees.size,
      clientCount: clients.size,
      lastSeen: new Date(Math.max(...processEntries.map((entry) => entry.workDate.getTime()))),
      trendPercent: before > 0 ? Math.round(((minutes - before) / before) * 100) : null,
      topTitles,
      causes: buildCauses(processEntries),
    };
  }).sort((a, b) => b.minutes - a.minutes || b.count - a.count);

  const totalMinutes = entries.reduce((sum, entry) => sum + entry.durationMinutes, 0);
  const clientGroups = new Map<string, InsightEntry[]>();
  for (const entry of entries) {
    const key = clientKey(entry);
    if (!key || !entry.clientName) continue;
    const list = clientGroups.get(key) ?? [];
    list.push(entry);
    clientGroups.set(key, list);
  }

  const previousClientMinutes = new Map<string, number>();
  for (const entry of previousEntries) {
    const key = clientKey(entry);
    if (!key) continue;
    previousClientMinutes.set(key, (previousClientMinutes.get(key) ?? 0) + entry.durationMinutes);
  }

  // One shared timeline for every client, so the small trend charts can be
  // compared row by row instead of each having its own scale.
  let rangeStart = Number.POSITIVE_INFINITY;
  let rangeEnd = Number.NEGATIVE_INFINITY;
  for (const entry of entries) {
    const time = entry.workDate.getTime();
    if (time < rangeStart) rangeStart = time;
    if (time > rangeEnd) rangeEnd = time;
  }
  const bucketSpan = rangeEnd > rangeStart ? (rangeEnd - rangeStart) / TREND_BUCKETS : 0;
  function bucketIndex(date: Date) {
    if (!bucketSpan) return TREND_BUCKETS - 1;
    return Math.min(TREND_BUCKETS - 1, Math.floor((date.getTime() - rangeStart) / bucketSpan));
  }

  const clientMinutes = [...clientGroups.values()]
    .reduce((sum, group) => sum + group.reduce((inner, entry) => inner + entry.durationMinutes, 0), 0);
  const clientEntryCount = [...clientGroups.values()].reduce((sum, group) => sum + group.length, 0);

  const clients: ClientInsight[] = [...clientGroups.entries()].map(([key, clientEntries]) => {
    const minutes = clientEntries.reduce((sum, entry) => sum + entry.durationMinutes, 0);
    const processTotals = new Map<string, number>();
    const employees = new Set<string>();
    const trendPoints = Array.from({ length: TREND_BUCKETS }, () => 0);
    let lastSeen = clientEntries[0].workDate;
    for (const entry of clientEntries) {
      const processKey = normalizeCategoryKey(entry.category);
      processTotals.set(processKey, (processTotals.get(processKey) ?? 0) + entry.durationMinutes);
      employees.add(entry.employeeId);
      trendPoints[bucketIndex(entry.workDate)] += entry.durationMinutes;
      if (entry.workDate > lastSeen) lastSeen = entry.workDate;
    }
    const processes: ClientProcessShare[] = [...processTotals.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([processKey, processMinutes]) => ({
        key: processKey,
        label: categoryLabel(processKey),
        minutes: processMinutes,
        sharePercent: minutes > 0 ? Math.round((processMinutes / minutes) * 100) : 0,
      }));
    const previous = previousClientMinutes.get(key) ?? 0;
    return {
      key,
      id: key.startsWith("id:") ? key.slice(3) : null,
      name: clientEntries[0].clientName!,
      count: clientEntries.length,
      minutes,
      sharePercent: totalMinutes > 0 ? Math.round((minutes / totalMinutes) * 100) : 0,
      clientSharePercent: clientMinutes > 0 ? Math.round((minutes / clientMinutes) * 100) : 0,
      averageMinutes: Math.round(minutes / clientEntries.length),
      employeeCount: employees.size,
      previousMinutes: previous,
      trendPercent: previous > 0 ? Math.round(((minutes - previous) / previous) * 100) : null,
      trendPoints,
      lastSeen,
      topProcess: processes[0]?.label ?? "Nav datu",
      topCause: buildCauses(clientEntries)[0]?.label ?? null,
      processes,
      causes: buildCauses(clientEntries),
    };
  }).sort((a, b) => b.minutes - a.minutes);

  const clientConcentrationMinutes = clients.slice(0, 3).reduce((sum, client) => sum + client.minutes, 0);

  // One suggestion can fit several processes. Showing it once per process
  // produced identical, repeating cards, so the same advice is merged into a
  // single action that names every process it covers.
  const merged = new Map<string, ProcessRecommendation>();
  for (const process of processes) {
    if (process.count < 2 || process.minutes < 45) continue;
    const suggestion = recommendationFor(process);
    const confidence: ProcessRecommendation["confidence"] = process.count >= 5 && process.minutes >= 180
      ? "high"
      : process.count >= 3 || process.minutes >= 120
        ? "medium"
        : "low";
    const entry: RecommendationProcess = {
      key: process.key,
      categoryKey: process.categoryKey,
      label: process.label,
      count: process.count,
      minutes: process.minutes,
    };
    const score = Math.min(100, Math.round(process.count * 8 + process.minutes / 12 + process.employeeCount * 4));
    const existing = merged.get(suggestion.title);

    if (!existing) {
      merged.set(suggestion.title, {
        processKey: process.key,
        categoryKey: process.categoryKey,
        processLabel: process.label,
        processes: [entry],
        entryCount: process.count,
        minutes: process.minutes,
        title: suggestion.title,
        description: suggestion.description,
        employeeHelp: suggestion.employeeHelp,
        evidence: `${process.count} ieraksti · ${process.employeeCount} darbinieki · ${process.clientCount} klienti`,
        confidence,
        score,
        savingLowMinutes: roundedSaving(process.minutes, suggestion.lowRate),
        savingHighMinutes: roundedSaving(process.minutes, suggestion.highRate),
      });
      continue;
    }

    existing.processes.push(entry);
    existing.entryCount += process.count;
    existing.minutes += process.minutes;
    existing.savingLowMinutes += roundedSaving(process.minutes, suggestion.lowRate);
    existing.savingHighMinutes += roundedSaving(process.minutes, suggestion.highRate);
    existing.score = Math.min(100, existing.score + Math.round(score / 2));
    existing.evidence = `${existing.entryCount} ieraksti ${existing.processes.length} procesos`;
    if (confidence === "high" || (confidence === "medium" && existing.confidence === "low")) {
      existing.confidence = confidence;
    }
  }

  const recommendations = [...merged.values()]
    .map((item) => ({ ...item, processes: [...item.processes].sort((a, b) => b.minutes - a.minutes) }))
    .sort((a, b) => b.score - a.score || b.minutes - a.minutes);

  return {
    totalEntries: entries.length,
    totalMinutes,
    repeatedProcessCount: processes.filter((process) => process.count >= 2).length,
    processCoveragePercent: entries.length > 0
      ? Math.round((processes.filter((process) => process.count >= 2).reduce((sum, process) => sum + process.count, 0) / entries.length) * 100)
      : 0,
    potentialSavingLowMinutes: recommendations.reduce((sum, item) => sum + item.savingLowMinutes, 0),
    potentialSavingHighMinutes: recommendations.reduce((sum, item) => sum + item.savingHighMinutes, 0),
    clientMinutes,
    clientEntries: clientEntryCount,
    clientConcentrationPercent: clientMinutes > 0
      ? Math.round((clientConcentrationMinutes / clientMinutes) * 100)
      : 0,
    processes,
    clients,
    recommendations,
  };
}
