/**
 * The period a dashboard or report looks at: one of the quick presets
 * (7 / 30 / 90 days, all time) or a custom range picked in the calendar.
 *
 * URL shape: `?period=7d|30d|90d|all` or `?period=custom&from=2026-04-01&to=2026-12-30`.
 *
 * Work dates are calendar days stored as UTC instants (00:00Z from the entry
 * form, 12:00Z from smart log), so a custom range [from, to] is the half-open
 * interval [from 00:00Z, to+1 00:00Z), which holds both.
 */

const DAY_MS = 86_400_000;
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

export type PeriodKey = "7d" | "30d" | "90d" | "all" | "custom";

const PRESET_DAYS: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };

export interface DateRange {
  key: PeriodKey;
  /** Inclusive start; undefined for all time. */
  start?: Date;
  /** Exclusive end; undefined means "up to now". */
  end?: Date;
  /** Custom range bounds as yyyy-mm-dd (both inclusive). */
  from?: string;
  to?: string;
  /** Length in days; null for all time. */
  days: number | null;
  /** Lowercase caption, e.g. "pēdējās 7 dienas" or "01.04.2026 - 30.12.2026". */
  label: string;
  /** Short badge, e.g. "7 d." or "01.04.-30.12.2026". */
  badge: string;
}

function parseIsoDay(value: string | undefined): Date | null {
  if (!value || !ISO_DAY.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** dd.mm.yyyy for a UTC-midnight day. */
export function lvDay(date: Date): string {
  return `${pad(date.getUTCDate())}.${pad(date.getUTCMonth() + 1)}.${date.getUTCFullYear()}`;
}

function shortBadge(start: Date, lastDay: Date): string {
  const sameYear = start.getUTCFullYear() === lastDay.getUTCFullYear();
  const head = sameYear ? `${pad(start.getUTCDate())}.${pad(start.getUTCMonth() + 1)}.` : lvDay(start);
  return `${head}-${lvDay(lastDay)}`;
}

export function resolveDateRange(
  params: { period?: string; from?: string; to?: string } | undefined,
  opts: { defaultKey: Exclude<PeriodKey, "custom">; now?: Date },
): DateRange {
  const now = opts.now ?? new Date();
  const period = params?.period;

  if (period === "custom") {
    let first = parseIsoDay(params?.from);
    let last = parseIsoDay(params?.to);
    if (first && last) {
      if (first > last) [first, last] = [last, first];
      const end = new Date(last.getTime() + DAY_MS);
      const from = first.toISOString().slice(0, 10);
      const to = last.toISOString().slice(0, 10);
      const label = from === to ? lvDay(first) : `${lvDay(first)} - ${lvDay(last)}`;
      return {
        key: "custom",
        start: first,
        end,
        from,
        to,
        days: Math.round((end.getTime() - first.getTime()) / DAY_MS),
        label,
        badge: from === to ? lvDay(first) : shortBadge(first, last),
      };
    }
    // A half-filled or broken custom range falls back to the page default.
  }

  const key = period && (period in PRESET_DAYS || period === "all") ? period : opts.defaultKey;
  if (key === "all") return { key: "all", days: null, label: "viss laiks", badge: "Viss" };
  const days = PRESET_DAYS[key];
  return {
    key: key as PeriodKey,
    start: new Date(now.getTime() - days * DAY_MS),
    days,
    label: `pēdējās ${days} dienas`,
    badge: `${days} d.`,
  };
}

/** Prisma filter on a date column for the range, or undefined for all time. */
export function rangeFilter(range: DateRange): { gte?: Date; lt?: Date } | undefined {
  if (!range.start && !range.end) return undefined;
  return {
    ...(range.start ? { gte: range.start } : {}),
    ...(range.end ? { lt: range.end } : {}),
  };
}

/**
 * The window a trend arrow compares, and the equally long one right before it.
 * All time has no baseline, so it falls back to the last 30 days.
 */
export function comparisonWindows(
  range: DateRange,
  now: Date = new Date(),
): { current: { start: Date; end: Date }; previous: { start: Date; end: Date }; label: string } {
  if (range.key === "custom" && range.start && range.end) {
    const length = range.end.getTime() - range.start.getTime();
    return {
      current: { start: range.start, end: range.end },
      previous: { start: new Date(range.start.getTime() - length), end: range.start },
      label: `pret iepr. ${range.days} d.`,
    };
  }
  const days = range.days ?? 30;
  const start = new Date(now.getTime() - days * DAY_MS);
  return {
    current: { start, end: now },
    previous: { start: new Date(start.getTime() - days * DAY_MS), end: start },
    label: `pret iepr. ${days} d.`,
  };
}

const LV_MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jūn", "Jūl", "Aug", "Sep", "Okt", "Nov", "Dec"];

export interface TrendBucket {
  key: string;
  label: string;
  start: Date;
  end: Date;
}

/**
 * Chart buckets for a custom range: days up to a month, weeks (from Monday)
 * up to half a year, calendar months beyond that.
 */
export function customTrendBuckets(start: Date, end: Date): TrendBucket[] {
  const days = Math.round((end.getTime() - start.getTime()) / DAY_MS);
  const buckets: TrendBucket[] = [];

  if (days <= 31) {
    for (let t = start.getTime(); t < end.getTime(); t += DAY_MS) {
      const d = new Date(t);
      buckets.push({
        key: d.toISOString().slice(0, 10),
        label: `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}`,
        start: d,
        end: new Date(t + DAY_MS),
      });
    }
    return buckets;
  }

  if (days <= 183) {
    const sinceMonday = (start.getUTCDay() + 6) % 7;
    for (let t = start.getTime() - sinceMonday * DAY_MS; t < end.getTime(); t += 7 * DAY_MS) {
      const d = new Date(t);
      buckets.push({
        key: d.toISOString().slice(0, 10),
        label: `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}`,
        start: new Date(Math.max(t, start.getTime())),
        end: new Date(Math.min(t + 7 * DAY_MS, end.getTime())),
      });
    }
    return buckets;
  }

  let y = start.getUTCFullYear();
  let m = start.getUTCMonth();
  while (Date.UTC(y, m, 1) < end.getTime()) {
    const monthStart = Date.UTC(y, m, 1);
    const monthEnd = Date.UTC(y, m + 1, 1);
    buckets.push({
      key: `${y}-${pad(m + 1)}`,
      label: start.getUTCFullYear() === end.getUTCFullYear() ? LV_MONTHS_SHORT[m] : `${LV_MONTHS_SHORT[m]} ${String(y).slice(2)}`,
      start: new Date(Math.max(monthStart, start.getTime())),
      end: new Date(Math.min(monthEnd, end.getTime())),
    });
    m++;
    if (m === 12) {
      m = 0;
      y++;
    }
  }
  return buckets;
}

/** Sums `value` of items into the bucket their date falls in; hours, 1 decimal. */
export function sumIntoBuckets<T>(
  buckets: TrendBucket[],
  items: T[],
  dateOf: (item: T) => Date,
  minutesOf: (item: T) => number,
): { label: string; value: number }[] {
  const totals = buckets.map(() => 0);
  for (const item of items) {
    const t = dateOf(item).getTime();
    const i = buckets.findIndex((b) => t >= b.start.getTime() && t < b.end.getTime());
    if (i >= 0) totals[i] += minutesOf(item);
  }
  return buckets.map((b, i) => ({ label: b.label, value: Math.round((totals[i] / 60) * 10) / 10 }));
}

/**
 * Report chart buckets: 7-day chunks counted from the range start (as the
 * printed report always had), or calendar months when the range is longer
 * than half a year.
 */
export function reportBuckets(start: Date, end: Date): TrendBucket[] {
  if (end.getTime() - start.getTime() > 183 * DAY_MS) return customTrendBuckets(start, end);
  const buckets: TrendBucket[] = [];
  for (let t = start.getTime(); t < end.getTime(); t += 7 * DAY_MS) {
    const d = new Date(t);
    buckets.push({
      key: d.toISOString(),
      label: `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}`,
      start: d,
      end: new Date(Math.min(t + 7 * DAY_MS, end.getTime())),
    });
  }
  return buckets;
}
