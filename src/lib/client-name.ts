/**
 * Normalizes a client name for matching/deduplication: unifies quote styles,
 * strips a leading or trailing "SIA" (LV equivalent of "Ltd."), and folds
 * case/whitespace. "SIA \"Letex\"" and "Letex" normalize to the same key.
 */
export function normalizeClientName(name: string): string {
  return name
    .replace(/''/g, '"')
    .replace(/["""'''«»´`]/g, "")
    .trim()
    .replace(/^sia\s+/i, "")
    .replace(/\s+sia$/i, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}
