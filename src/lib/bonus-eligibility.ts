import type { PeriodType } from "./reward-types";
import { normalizeCategoryKey } from "./work-insights";

export interface EligibilityEntry {
  durationMinutes: number;
  category: string;
  workDate: Date | string;
}

export interface EligibilityResult {
  eligible: boolean;
  hours: number;
  needed: number;
  progressPercent: number;
}

export interface EligibilityRule {
  minimumHours: number;
  periodType: PeriodType;
  categories: string[];
  workRoleIds: string[];
}

export function getPeriodStart(periodType: PeriodType): Date {
  const now = new Date();
  switch (periodType) {
    case "WEEK":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "TWO_WEEKS":
      return new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    case "MONTH":
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case "QUARTER":
      return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
  }
}

export function calculateEligibility(
  rule: EligibilityRule,
  approvedEntries: EligibilityEntry[],
  employeeWorkRoleId?: string | null
): EligibilityResult {
  if (rule.workRoleIds.length > 0) {
    if (!employeeWorkRoleId || !rule.workRoleIds.includes(employeeWorkRoleId)) {
      return { eligible: false, hours: 0, needed: rule.minimumHours, progressPercent: 0 };
    }
  }

  const periodStart = getPeriodStart(rule.periodType);
  let filtered = approvedEntries.filter(
    (e) => new Date(e.workDate) >= periodStart
  );

  if (rule.categories.length > 0) {
    // Rules are stored with the Latvian label, entries with the canonical key
    // (older entries carry the label too). Compare on the key so a rule keeps
    // matching regardless of which form either side happens to hold.
    const wanted = new Set(rule.categories.map(normalizeCategoryKey));
    filtered = filtered.filter((e) => wanted.has(normalizeCategoryKey(e.category)));
  }

  const totalMinutes = filtered.reduce((s, e) => s + e.durationMinutes, 0);
  const hours = totalMinutes / 60;
  const needed = Math.max(0, rule.minimumHours - hours);
  const progressPercent = Math.min(100, Math.round((hours / rule.minimumHours) * 100));

  return {
    eligible: hours >= rule.minimumHours,
    hours: Math.round(hours * 10) / 10,
    needed: Math.round(needed * 10) / 10,
    progressPercent,
  };
}
