/**
 * The calendar week a weekly email reports on: last Monday to Sunday, by the
 * Riga calendar.
 *
 * Work dates are calendar days stored as UTC instants (00:00Z from the entry
 * form, 12:00Z from smart log), so a Riga day D always falls inside
 * [D 00:00Z, D+1 00:00Z). Ranges here are built from those UTC midnights.
 *
 * Before this, the emails used "now minus 7 days". Sent Monday 06:15 UTC, that
 * window started after last Monday's 00:00Z entries and dropped the whole
 * Monday from the week.
 */

const DAY_MS = 86_400_000;

const LV_MONTHS = [
  "janvāris", "februāris", "marts", "aprīlis", "maijs", "jūnijs",
  "jūlijs", "augusts", "septembris", "oktobris", "novembris", "decembris",
];

/** The Riga calendar date of `now`, as a UTC-midnight Date. */
export function rigaDate(now: Date): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Riga",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return new Date(`${parts}T00:00:00.000Z`);
}

export interface ReportWeek {
  /** Monday 00:00Z of the reported week (inclusive). */
  start: Date;
  /** Monday 00:00Z after the reported week (exclusive). */
  end: Date;
  /** Monday 00:00Z of the week before, for the trend (inclusive; ends at `start`). */
  prevStart: Date;
  /** Human label, e.g. "16.-22. novembris" or "30. novembris - 6. decembris". */
  label: string;
}

/** The last full Monday-Sunday week before the Riga day of `now`. */
export function previousReportWeek(now: Date = new Date()): ReportWeek {
  const today = rigaDate(now);
  const sinceMonday = (today.getUTCDay() + 6) % 7; // Monday = 0
  const thisMonday = new Date(today.getTime() - sinceMonday * DAY_MS);
  const start = new Date(thisMonday.getTime() - 7 * DAY_MS);
  const prevStart = new Date(start.getTime() - 7 * DAY_MS);
  return { start, end: thisMonday, prevStart, label: weekLabel(start) };
}

function weekLabel(monday: Date): string {
  const sunday = new Date(monday.getTime() + 6 * DAY_MS);
  const m1 = monday.getUTCMonth();
  const m2 = sunday.getUTCMonth();
  if (m1 === m2) return `${monday.getUTCDate()}.-${sunday.getUTCDate()}. ${LV_MONTHS[m2]}`;
  return `${monday.getUTCDate()}. ${LV_MONTHS[m1]} - ${sunday.getUTCDate()}. ${LV_MONTHS[m2]}`;
}
