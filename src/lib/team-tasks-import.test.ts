import { describe, it, expect } from "vitest";
import { hasFill, parseReportSheet, type GridCell } from "./team-tasks-import";

const t = (text: string): GridCell => ({ text, filled: false });
const grey: GridCell = { text: "", filled: true };
const blank = t("");

describe("hasFill", () => {
  it("treats no fill and white as empty", () => {
    expect(hasFill(undefined)).toBe(false);
    expect(hasFill({ patternType: "none" })).toBe(false);
    expect(hasFill({ patternType: "solid", fgColor: { rgb: "FFFFFFFF" } })).toBe(false);
    expect(hasFill({ patternType: "solid", fgColor: { theme: 0 } })).toBe(false);
  });

  it("detects grey, both as RGB and as a darkened theme colour", () => {
    expect(hasFill({ patternType: "solid", fgColor: { rgb: "FFBFBFBF" } })).toBe(true);
    expect(hasFill({ patternType: "solid", fgColor: { theme: 0, tint: -0.35 } })).toBe(true);
  });
});

describe("parseReportSheet", () => {
  // Shaped like the pilot's sheet: a title row, an empty row, the header with
  // an empty corner cell, then clients; an Info column at the end.
  const grid: GridCell[][] = [
    [t("Septembris 2026")],
    [],
    [blank, t("PB rēķ."), t("KASE"), t("PVN"), t("Info")],
    [t("Xcore"), blank, grey, blank, blank],
    [t("Letex"), blank, blank, blank, t("gaidām izrakstu")],
    [],
    [t("WP"), grey, grey, blank, blank],
  ];

  it("finds the header below the title and skips the Info column", () => {
    expect(parseReportSheet(grid)?.columns).toEqual(["PB rēķ.", "KASE", "PVN"]);
  });

  it("reads grey cells as not needed and skips empty rows", () => {
    expect(parseReportSheet(grid)?.rows).toEqual([
      { name: "Xcore", needed: [true, false, true] },
      { name: "Letex", needed: [true, true, true] },
      { name: "WP", needed: [false, false, true] },
    ]);
  });

  it("returns null when there is no header row", () => {
    expect(parseReportSheet([[t("Tikai virsraksts")]])).toBeNull();
  });

  it("keeps the first of duplicate client rows", () => {
    const dup = [...grid, [t("xcore"), grey, grey, grey, blank]];
    expect(parseReportSheet(dup)?.rows.filter((r) => r.name.toLowerCase() === "xcore")).toHaveLength(1);
  });
});
