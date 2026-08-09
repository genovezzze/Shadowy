/** Formatting shared by every insights surface, so numbers read the same everywhere. */

function hoursValue(minutes: number) {
  const hours = minutes / 60;
  if (hours >= 10) return String(Math.round(hours));
  return (Math.round(hours * 10) / 10).toString().replace(".", ",");
}

/** Saving ranges sit inside narrow tiles, so they stay short: "21–40 h". */
export function formatSavingRangeLV(lowMinutes: number, highMinutes: number) {
  if (highMinutes < 60) return `${lowMinutes}–${highMinutes} min`;
  return `${hoursValue(lowMinutes)}–${hoursValue(highMinutes)} h`;
}

/**
 * Percentages become meaningless once the previous period was almost empty
 * (+2150% tells nobody anything), so large growth is shown as a multiplier.
 */
export function formatTrendLV(percent: number) {
  if (percent >= 200) {
    const times = 1 + percent / 100;
    return `×${(Math.round(times * 10) / 10).toString().replace(".", ",")}`;
  }
  return `${percent > 0 ? "+" : ""}${percent}%`;
}

export const CONFIDENCE_LABELS: Record<"high" | "medium" | "low", string> = {
  high: "Pamatots plašos datos",
  medium: "Vidēji daudz datu",
  low: "Sākotnējs signāls",
};
