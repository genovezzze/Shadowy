/**
 * Normalizes a client name for matching/deduplication: folds Latvian
 * diacritics, unifies quote styles, strips a leading or trailing "SIA" (LV
 * equivalent of "Ltd."), and folds case/whitespace. "SIA \"Letex\"" and
 * "Letex" normalize to the same key — including when there's no space between
 * "SIA" and the quote, e.g. SIA"Ganri" or SIA''Ganri'' (the SIA-strip must
 * run before quotes are removed, otherwise "SIA" and the name collapse into
 * one word and the leading-SIA regex no longer matches).
 *
 * Diacritics are folded first via Unicode NFD (ā→a, ē→e, ī→i, ū→u, č→c, š→s,
 * ž→z, ķ→k, ļ→l, ņ→n, ģ→g) so free-typed variants like "Ganrī" and "Ganri"
 * — which employees enter inconsistently when a client isn't picked from the
 * combobox — resolve to the same key.
 *
 * All whitespace is stripped (not just collapsed) so free-typed variants
 * like "Tech Gym" and "Techgym" also resolve to the same key.
 */
export function normalizeClientName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/''/g, '"')
    .trim()
    .replace(/^sia[\s"“”'‘’«»´`]+/i, "")
    .replace(/[\s"“”'‘’«»´`]+sia$/i, "")
    .replace(/["“”'‘’«»´`]/g, "")
    .replace(/\s+/g, "")
    .toLowerCase();
}
