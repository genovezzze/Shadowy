/**
 * Build a CSV document from rows of cells.
 * Uses ';' as delimiter and prepends a UTF-8 BOM so Excel (incl. LV locale)
 * opens it with correct columns and diacritics.
 */
const BOM = String.fromCharCode(0xfeff);

export function toCsv(rows: (string | number | null | undefined)[][]): string {
  const body = rows
    .map((row) => row.map((cell) => escapeCell(cell)).join(";"))
    .join("\r\n");
  return BOM + body;
}

function escapeCell(value: string | number | null | undefined): string {
  const str = value == null ? "" : String(value);
  if (/[";\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
