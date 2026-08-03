export type ClientMonthOption = {
  value: string;
  label: string;
};

export type MonthlyMinutesMap = Map<string, Map<string, number>>;

export function yearMonthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function formatClientMonth(key: string): string {
  const [year, month] = key.split("-").map(Number);
  const label = new Intl.DateTimeFormat("lv-LV", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function resolveClientMonth(raw?: string, now = new Date()) {
  const currentKey = yearMonthKey(now);
  if (raw === "all") {
    return {
      key: "all",
      label: "Viss periods",
      start: null,
      end: null,
      isCurrent: false,
      isAll: true,
    };
  }
  const match = raw?.match(/^(\d{4})-(0[1-9]|1[0-2])$/);
  const key = match ? raw! : currentKey;
  const [year, month] = key.split("-").map(Number);

  return {
    key,
    label: formatClientMonth(key),
    start: new Date(Date.UTC(year, month - 1, 1)),
    end: new Date(Date.UTC(year, month, 1)),
    isCurrent: key === currentKey,
    isAll: false,
  };
}

export function clientMonthOptions(
  dates: Date[],
  selectedKey: string,
  now = new Date(),
): ClientMonthOption[] {
  const keys = new Set(dates.map(yearMonthKey));
  keys.add(yearMonthKey(now));
  if (selectedKey !== "all") keys.add(selectedKey);

  return [
    { value: "all", label: "Viss periods" },
    ...[...keys]
    .sort((a, b) => b.localeCompare(a))
    .map((value) => ({ value, label: formatClientMonth(value) })),
  ];
}

export function addMonthlyMinutes(
  map: MonthlyMinutesMap,
  groupKey: string,
  workDate: Date,
  minutes: number,
) {
  if (!map.has(groupKey)) map.set(groupKey, new Map());
  const months = map.get(groupKey)!;
  const monthKey = yearMonthKey(workDate);
  months.set(monthKey, (months.get(monthKey) ?? 0) + minutes);
}

export function sumMonthlyOverrun(
  map: MonthlyMinutesMap,
  groupKeys: string[],
  monthlyLimit: number,
): number {
  const combined = new Map<string, number>();
  for (const groupKey of groupKeys) {
    for (const [month, minutes] of map.get(groupKey) ?? []) {
      combined.set(month, (combined.get(month) ?? 0) + minutes);
    }
  }
  return [...combined.values()].reduce(
    (sum, minutes) => sum + Math.max(0, minutes - monthlyLimit),
    0,
  );
}
