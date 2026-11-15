/**
 * Normalizes a client name for matching/deduplication: folds Latvian
 * diacritics, unifies quote styles, strips a leading or trailing "SIA" (LV
 * equivalent of "Ltd."), and folds case/whitespace. "SIA \"Letex\"" and
 * "Letex" normalize to the same key - including when there's no space between
 * "SIA" and the quote, e.g. SIA"Ganri" or SIA''Ganri'' (the SIA-strip must
 * run before quotes are removed, otherwise "SIA" and the name collapse into
 * one word and the leading-SIA regex no longer matches).
 *
 * Diacritics are folded first via Unicode NFD (ā→a, ē→e, ī→i, ū→u, č→c, š→s,
 * ž→z, ķ→k, ļ→l, ņ→n, ģ→g) so free-typed variants like "Ganrī" and "Ganri"
 * - which employees enter inconsistently when a client isn't picked from the
 * combobox - resolve to the same key.
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

export type ClientLookupEntry = {
  name: string;
  aliases?: { normalized: string }[];
};

/**
 * Builds the normalized-key → client map used to attach free-typed entries to
 * a registered client. Employees shorthand clients ("VKK" for "Ventspils
 * Kērlinga Klubs"), and those shorthands only exist as aliases, so a lookup
 * built from names alone silently drops the hours.
 *
 * Aliases fill gaps only: a real client name always wins over another client's
 * alias that normalizes to the same key.
 */
export function buildClientLookup<T extends ClientLookupEntry>(clients: T[]): Map<string, T> {
  const byNorm = new Map(clients.map((c) => [normalizeClientName(c.name), c]));
  for (const c of clients) {
    for (const alias of c.aliases ?? []) {
      if (!byNorm.has(alias.normalized)) byNorm.set(alias.normalized, c);
    }
  }
  return byNorm;
}

export type ClientSelection =
  | { ok: true; clientId: string | null; clientName: string | null }
  | { ok: false; unknownName: string };

/**
 * Decides which client a saved entry is attached to. The AI writes the client
 * the way it heard it ("SIA Balta" for "SIA Baltija"), so a name that is not
 * on the firm's client list must never be saved as if it were a client: the
 * employee has to pick one from the list or choose no client.
 *
 * - An explicit pick (clientId) counts only if it belongs to this firm's
 *   clients, so a crafted request cannot attach hours to another tenant.
 * - A name resolves through the name/alias lookup to the registered client.
 * - A firm with no client list yet keeps free-typed names (nothing to match).
 */
export function resolveClientSelection<T extends ClientLookupEntry & { id: string }>(
  input: { clientId?: string | null; clientName?: string | null },
  orgClients: T[],
  lookup: Map<string, T> = buildClientLookup(orgClients),
): ClientSelection {
  if (input.clientId) {
    const picked = orgClients.find((c) => c.id === input.clientId);
    return picked
      ? { ok: true, clientId: picked.id, clientName: picked.name }
      : { ok: false, unknownName: input.clientName ?? "" };
  }
  const name = input.clientName?.trim();
  if (!name) return { ok: true, clientId: null, clientName: null };
  const match = lookup.get(normalizeClientName(name));
  if (match) return { ok: true, clientId: match.id, clientName: match.name };
  if (orgClients.length === 0) return { ok: true, clientId: null, clientName: name };
  return { ok: false, unknownName: name };
}
