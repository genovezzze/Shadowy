/**
 * Tokens for the admin overview's card style: white tiles with a hairline
 * border, a colour tile behind each icon, pill filters. Components take an
 * `apple` flag (or a `tint`) and fall back to their regular look without it,
 * so only the screens that opt in change.
 *
 * Tints tell metrics and sections apart, never good from bad, so they don't
 * encode a judgement about a person (CLAUDE.md, principle 1).
 */

// "neutral" is the quiet default: a graphite tile with a white icon, grey data.
export type MetricTint = "neutral" | "blue" | "green" | "orange" | "indigo" | "cyan" | "pink" | "red";

/** Text colour, light / dark variants - for figures and inline status. */
export const METRIC_TINTS: Record<MetricTint, string> = {
  neutral: "text-foreground",
  blue: "text-[#007AFF] dark:text-[#0A84FF]",
  green: "text-[#248A3D] dark:text-[#30D158]",
  orange: "text-[#C93400] dark:text-[#FF9F0A]",
  indigo: "text-[#5856D6] dark:text-[#7D7AFF]",
  cyan: "text-[#0071A4] dark:text-[#64D2FF]",
  pink: "text-[#D30F45] dark:text-[#FF375F]",
  red: "text-[#D70015] dark:text-[#FF453A]",
};

/** Solid fill for bars, dots and progress. */
export const TINT_FILL: Record<MetricTint, string> = {
  neutral: "bg-foreground/50",
  blue: "bg-[#007AFF] dark:bg-[#0A84FF]",
  green: "bg-[#34C759] dark:bg-[#30D158]",
  orange: "bg-[#FF9500] dark:bg-[#FF9F0A]",
  indigo: "bg-[#5856D6] dark:bg-[#5E5CE6]",
  cyan: "bg-[#32ADE6] dark:bg-[#64D2FF]",
  pink: "bg-[#FF2D55] dark:bg-[#FF375F]",
  red: "bg-[#FF3B30] dark:bg-[#FF453A]",
};

/** Colour tile behind the first icon of an APPLE_CARD_LABEL row. */
export const TINT_TILE: Record<MetricTint, string> = {
  neutral: "[&>svg]:bg-[#1c1c1e] dark:[&>svg]:bg-white/[0.12]",
  blue: "[&>svg]:bg-[#007AFF] dark:[&>svg]:bg-[#0A84FF]",
  green: "[&>svg]:bg-[#34C759] dark:[&>svg]:bg-[#30D158]",
  orange: "[&>svg]:bg-[#FF9500] dark:[&>svg]:bg-[#FF9F0A]",
  indigo: "[&>svg]:bg-[#5856D6] dark:[&>svg]:bg-[#5E5CE6]",
  cyan: "[&>svg]:bg-[#32ADE6] dark:[&>svg]:bg-[#40C8E0]",
  pink: "[&>svg]:bg-[#FF2D55] dark:[&>svg]:bg-[#FF375F]",
  red: "[&>svg]:bg-[#FF3B30] dark:[&>svg]:bg-[#FF453A]",
};

/** Same colours as a standalone square, for icon tiles outside a label row. */
export const TINT_SQUARE: Record<MetricTint, string> = {
  neutral: "bg-[#1c1c1e] dark:bg-white/[0.12]",
  blue: "bg-[#007AFF] dark:bg-[#0A84FF]",
  green: "bg-[#34C759] dark:bg-[#30D158]",
  orange: "bg-[#FF9500] dark:bg-[#FF9F0A]",
  indigo: "bg-[#5856D6] dark:bg-[#5E5CE6]",
  cyan: "bg-[#32ADE6] dark:bg-[#40C8E0]",
  pink: "bg-[#FF2D55] dark:bg-[#FF375F]",
  red: "bg-[#FF3B30] dark:bg-[#FF453A]",
};

/** Raw hex pairs for SVG and chart libraries that can't take classes. */
export const TINT_HEX: Record<MetricTint, { light: string; dark: string }> = {
  neutral: { light: "#8E8E93", dark: "#8E8E93" },
  blue: { light: "#007AFF", dark: "#0A84FF" },
  green: { light: "#34C759", dark: "#30D158" },
  orange: { light: "#FF9500", dark: "#FF9F0A" },
  indigo: { light: "#5856D6", dark: "#5E5CE6" },
  cyan: { light: "#32ADE6", dark: "#64D2FF" },
  pink: { light: "#FF2D55", dark: "#FF375F" },
  red: { light: "#FF3B30", dark: "#FF453A" },
};

/** White tile with a hairline border; a near-black step in dark. */
export const METRIC_SURFACE =
  "rounded-2xl border border-black/[0.07] bg-white text-card-foreground dark:border-white/[0.07] dark:bg-card";

/** Raised step inside a surface, e.g. an inset row or a track behind a bar. */
export const APPLE_FILL = "bg-black/[0.05] dark:bg-white/[0.08]";

/** Hairline between list rows. */
export const APPLE_SEPARATOR = "border-black/[0.07] dark:border-white/[0.07]";

/** Small outlined pill action, like the header buttons. */
export const APPLE_PILL =
  "flex h-8 items-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-3.5 text-[13px] font-medium text-foreground transition-colors hover:bg-black/[0.03] dark:border-white/[0.1] dark:bg-white/[0.04] dark:hover:bg-white/[0.08]";

/** Card header: icon on a colour tile (pair with TINT_TILE) and a bold title. */
export const APPLE_CARD_LABEL =
  "flex items-center gap-2 font-display text-[14px] font-medium text-foreground [&>svg]:box-content [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0 [&>svg]:rounded-lg [&>svg]:p-1.5 [&>svg]:text-white";

/** Grey track holding a row of filter pills. */
export const CHIP_GROUP = "flex items-center gap-0.5 rounded-full bg-black/[0.04] p-1 dark:bg-white/[0.06]";

/** One filter pill; pass `active` for the selected state. */
export function chipClass(active: boolean): string {
  return [
    "inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[13px] transition-colors",
    active
      ? "bg-white font-medium text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.08)] dark:bg-white/[0.14]"
      : "text-foreground/70 hover:text-foreground",
  ].join(" ");
}

/** Small outlined badge in a tile's corner, e.g. a period or a change. */
export const TILE_BADGE =
  "inline-flex h-5 items-center rounded-full border border-black/[0.08] px-2 text-[11px] text-muted-foreground dark:border-white/[0.1]";

/** Form field skin: tall, soft-filled, rounded, blue focus. Pass as className. */
export const APPLE_FIELD =
  "h-11 rounded-xl border-black/[0.08] bg-black/[0.02] px-3.5 text-[15px] shadow-none focus-visible:border-[#007AFF]/50 focus-visible:ring-2 focus-visible:ring-[#007AFF]/20 focus-visible:ring-offset-0 dark:border-white/[0.08] dark:bg-white/[0.04] dark:focus-visible:border-[#0A84FF]/50 dark:focus-visible:ring-[#0A84FF]/20";

/** Primary action: solid blue pill. */
export const APPLE_PRIMARY_BUTTON =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#007AFF] px-6 text-[15px] font-medium text-white transition-colors hover:bg-[#0062CC] disabled:pointer-events-none disabled:opacity-50 dark:bg-[#0A84FF] dark:hover:bg-[#0A74E0]";

/** Quiet heading type: the brand display face at medium weight, for card and section titles. */
export const QUIET_LABEL = "font-display text-[15px] font-medium";
