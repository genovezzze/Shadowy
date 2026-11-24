import { normalizeClientName } from "./client-name";
import { isoDay, utcDay } from "./team-tasks";

/**
 * One line instead of a note on paper: "Zvanīt Letex par izrakstu rīt",
 * "@Jānis pārbaudīt Kipu PVN piektdien", "Nosūtīt aktu 25.11".
 * Rules, not AI: date words, an @person and a known client name are picked
 * out of the text; everything else stays as written.
 */

export interface QuickTaskInput {
  today: Date; // UTC-midnight Riga day
  clients: { id: string; name: string }[];
  people: { id: string; name: string }[];
}

export interface ParsedQuickTask {
  text: string;
  dueDate: Date | null;
  clientId: string | null;
  assigneeId: string | null;
}

/** Folds case and Latvian diacritics: "Trešdien" -> "tresdien". */
export function fold(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

const WEEKDAYS = ["svetdien", "pirmdien", "otrdien", "tresdien", "ceturtdien", "piektdien", "sestdien"];

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}

/** A date word or dd.mm[.yyyy] -> the day it means, or null. */
export function parseDateWord(word: string, today: Date): Date | null {
  const bare = word.replace(/[,;:!?]+$/, "");
  const w = fold(bare).replace(/\.$/, "");
  if (w === "sodien") return today;
  if (w === "rit") return addDays(today, 1);
  if (w === "parit") return addDays(today, 2);

  const weekday = WEEKDAYS.indexOf(w);
  if (weekday >= 0) {
    // The coming one; said on that same weekday it means next week.
    const diff = (weekday - today.getUTCDay() + 7) % 7 || 7;
    return addDays(today, diff);
  }

  const m = /^(\d{1,2})\.(\d{1,2})\.?(\d{4})?\.?$/.exec(bare.trim());
  if (m) {
    const day = Number(m[1]);
    const month = Number(m[2]);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    let year = m[3] ? Number(m[3]) : today.getUTCFullYear();
    let date = utcDay(year, month, day);
    if (date.getUTCMonth() !== month - 1) return null; // 31.02
    // Without a year, a date already past means next year.
    if (!m[3] && isoDay(date) < isoDay(today)) {
      year += 1;
      date = utcDay(year, month, day);
    }
    return date;
  }
  return null;
}

export function parseQuickTask(raw: string, input: QuickTaskInput): ParsedQuickTask {
  let dueDate: Date | null = null;
  let assigneeId: string | null = null;
  const kept: string[] = [];

  const words = raw.trim().split(/\s+/).filter(Boolean);
  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    // "@Jānis" or "@Jānis:" -> hand it to that colleague (first match by name start).
    if (word.startsWith("@") && word.length > 1 && !assigneeId) {
      const key = fold(word.slice(1).replace(/[:,]+$/, ""));
      const person = input.people.find((p) => fold(p.name).startsWith(key));
      if (person) {
        assigneeId = person.id;
        continue;
      }
    }

    if (!dueDate) {
      const date = parseDateWord(word, input.today);
      if (date) {
        dueDate = date;
        // "līdz rīt" / "līdz 25.11": drop the "līdz" before it too.
        if (kept.length && fold(kept[kept.length - 1]) === "lidz") kept.pop();
        continue;
      }
    }
    kept.push(word);
  }

  const text = kept.join(" ").replace(/\s+([,.;:!?])/g, "$1").trim();

  // The longest known client name that appears in the text.
  const haystack = normalizeClientName(text);
  let clientId: string | null = null;
  let best = 0;
  for (const client of input.clients) {
    const key = normalizeClientName(client.name);
    if (key.length >= 3 && key.length > best && haystack.includes(key)) {
      clientId = client.id;
      best = key.length;
    }
  }

  return { text: text || raw.trim(), dueDate, clientId, assigneeId };
}
