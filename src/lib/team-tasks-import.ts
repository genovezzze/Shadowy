/**
 * Reading the firm's monthly report sheet (rows = clients, columns = reports,
 * grey cell = the client doesn't need that report) into a registry preview.
 * Pure: the route turns the workbook into a grid, this decides what it means.
 */

export interface GridCell {
  text: string;
  /** Has a background fill (any colour but white). */
  filled: boolean;
}

export interface ParsedSheet {
  columns: string[];
  rows: { name: string; needed: boolean[] }[];
}

type FillColor = { rgb?: string; theme?: number; tint?: number; indexed?: number } | undefined;

function isWhite(color: FillColor): boolean {
  if (!color) return true;
  if (color.rgb) return /^(FF)?FFFFFF$/i.test(color.rgb);
  // Theme 0 is the workbook's background (white); a negative tint darkens it to grey.
  if (color.theme === 0) return !(color.tint && color.tint < 0);
  // Indexed 9 is white, 64 is the system background.
  if (color.indexed === 9 || color.indexed === 64) return true;
  return false;
}

/** SheetJS style object (`cell.s` with `cellStyles: true`) -> has a visible fill. */
export function hasFill(style: unknown): boolean {
  if (!style || typeof style !== "object") return false;
  const s = style as { patternType?: string; fgColor?: FillColor; bgColor?: FillColor };
  if (!s.patternType || s.patternType === "none") return false;
  if (s.patternType === "solid") return !isWhite(s.fgColor);
  // Patterned fills (gray125...) also read as "greyed out".
  return true;
}

const NOTE_HEADER = /^(info|piez[iī]mes?|koment[aā]rs?)$/i;
const CLIENT_HEADER = /^(klients?|klienti|uz[nņ][eē]mums|nosaukums)$/i;

/**
 * Header = the first row (of the first 15) with at least three filled-in
 * texts; the title row above it ("Septembris 2026") has one. Client names sit
 * in the first column; an "Info" column is a note, not a report.
 */
export function parseReportSheet(grid: GridCell[][]): ParsedSheet | null {
  const headerIndex = grid
    .slice(0, 15)
    .findIndex((row) => row.filter((c) => c.text.trim()).length >= 3);
  if (headerIndex < 0) return null;

  const header = grid[headerIndex];
  const labelled = header.findIndex((c) => CLIENT_HEADER.test(c.text.trim()));
  const nameCol = labelled < 0 ? 0 : labelled;

  const reportCols: { index: number; name: string }[] = [];
  header.forEach((cell, index) => {
    const name = cell.text.replace(/\s+/g, " ").trim();
    if (index === nameCol || !name || NOTE_HEADER.test(name) || CLIENT_HEADER.test(name)) return;
    if (reportCols.some((c) => c.name.toLowerCase() === name.toLowerCase())) return;
    reportCols.push({ index, name: name.slice(0, 40) });
  });
  if (reportCols.length === 0) return null;

  const rows: ParsedSheet["rows"] = [];
  const seen = new Set<string>();
  for (const row of grid.slice(headerIndex + 1)) {
    const name = (row[nameCol]?.text ?? "").replace(/\s+/g, " ").trim();
    if (!name || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    rows.push({
      name: name.slice(0, 120),
      needed: reportCols.map((col) => !(row[col.index]?.filled ?? false)),
    });
  }

  return { columns: reportCols.map((c) => c.name), rows };
}
