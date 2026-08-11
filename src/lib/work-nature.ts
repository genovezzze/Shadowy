import { categoryLabel, normalizeCategoryKey } from "@/lib/work-insights";

/**
 * The second axis of an entry: *why* it counted as invisible work, as opposed
 * to `category`, which says *what* was done. It is a flag rather than a
 * category because both are true at once - "I booked the cheques, and I did it
 * because Anna was out" - and a single field can only record one of them.
 *
 * Its share is of all entries, not of the categories, so it deliberately does
 * not fit into the category list's 100%.
 */
export const WORK_NATURE_FLAGS = [
  {
    key: "helping_colleague",
    field: "helpedColleague",
    label: "Palīdzība kolēģim",
    hint: "Darīju kolēģa vietā vai viņa uzdevuma atbalstam",
  },
] as const;

export type WorkNatureFlagKey = (typeof WORK_NATURE_FLAGS)[number]["key"];

/**
 * Loose key for matching a person by name, so "Anna K." and "anna k" resolve to
 * the same colleague. Shared by the draft-review UI and the save action so both
 * sides agree on who a name refers to.
 */
export function normalizePersonName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "")
    .toLowerCase();
}

export type NatureEntry = {
  category: string;
  durationMinutes: number;
  helpedColleague?: boolean | null;
};

export type WorkNatureBreakdown = {
  key: WorkNatureFlagKey;
  label: string;
  count: number;
  minutes: number;
  /** Share of all entries in the period, not of the other flags. */
  pct: number;
  /** Bar width relative to the largest flag, so small flags stay visible. */
  barPct: number;
  /** What kind of work was done under this flag. */
  topCategories: { label: string; count: number }[];
};

function isSet(entry: NatureEntry, key: WorkNatureFlagKey): boolean {
  switch (key) {
    case "helping_colleague":
      return entry.helpedColleague === true;
  }
}

/**
 * Cross-cuts the period's entries by nature flag, and inside each flag by
 * category - answering "what kind of work do people actually do for each
 * other", which the single-axis category list could never show.
 */
export function groupByWorkNature(
  entries: NatureEntry[],
  categoryLimit = 3
): WorkNatureBreakdown[] {
  const total = entries.length;
  const rows = WORK_NATURE_FLAGS.map((flag) => {
    const matching = entries.filter((entry) => isSet(entry, flag.key));
    const categoryCounts = new Map<string, number>();
    for (const entry of matching) {
      const key = normalizeCategoryKey(entry.category);
      categoryCounts.set(key, (categoryCounts.get(key) ?? 0) + 1);
    }
    return {
      key: flag.key,
      label: flag.label,
      count: matching.length,
      minutes: matching.reduce((sum, entry) => sum + entry.durationMinutes, 0),
      pct: total > 0 ? Math.round((matching.length / total) * 100) : 0,
      barPct: 0,
      topCategories: [...categoryCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, categoryLimit)
        .map(([key, count]) => ({ label: categoryLabel(key), count })),
    };
  }).filter((row) => row.count > 0);

  const max = Math.max(...rows.map((row) => row.count), 1);
  for (const row of rows) {
    row.barPct = Math.round((row.count / max) * 100);
  }
  return rows.sort((a, b) => b.minutes - a.minutes);
}

export type HelpPairEntry = {
  employeeName: string;
  helpedName: string | null;
  durationMinutes: number;
  helpedColleague?: boolean | null;
};

export type HelpPair = {
  from: string;
  to: string;
  count: number;
  minutes: number;
};

/** "Who covers for whom", strongest pair first. Needs a named recipient. */
export function groupHelpPairs(entries: HelpPairEntry[], limit = 5): HelpPair[] {
  const pairs = new Map<string, HelpPair>();
  for (const entry of entries) {
    if (entry.helpedColleague !== true || !entry.helpedName) continue;
    const key = `${entry.employeeName}→${entry.helpedName}`;
    const current =
      pairs.get(key) ?? {
        from: entry.employeeName,
        to: entry.helpedName,
        count: 0,
        minutes: 0,
      };
    current.count += 1;
    current.minutes += entry.durationMinutes;
    pairs.set(key, current);
  }
  return [...pairs.values()]
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, limit);
}
