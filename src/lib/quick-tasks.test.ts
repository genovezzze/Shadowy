import { describe, it, expect } from "vitest";
import { parseDateWord, parseQuickTask } from "./quick-tasks";
import { isoDay, utcDay } from "./team-tasks";

// Friday, 20 Nov 2026 in Riga.
const TODAY = utcDay(2026, 11, 20);
const input = {
  today: TODAY,
  clients: [
    { id: "letex", name: 'SIA "Letex"' },
    { id: "kipu", name: "Kipu" },
    { id: "ab", name: "AB" },
  ],
  people: [
    { id: "janis", name: "Jānis Bērziņš" },
    { id: "ilze", name: "Ilze Darbiniece" },
  ],
};
const day = (d: Date | null) => (d ? isoDay(d) : null);

describe("parseDateWord", () => {
  it("reads relative words", () => {
    expect(day(parseDateWord("šodien", TODAY))).toBe("2026-11-20");
    expect(day(parseDateWord("rīt", TODAY))).toBe("2026-11-21");
    expect(day(parseDateWord("Rit,", TODAY))).toBe("2026-11-21");
    expect(day(parseDateWord("parīt", TODAY))).toBe("2026-11-22");
  });

  it("takes the coming weekday, next week when it is today", () => {
    expect(day(parseDateWord("pirmdien", TODAY))).toBe("2026-11-23");
    expect(day(parseDateWord("trešdien", TODAY))).toBe("2026-11-25");
    expect(day(parseDateWord("piektdien", TODAY))).toBe("2026-11-27");
  });

  it("reads dd.mm and rolls a past date to next year", () => {
    expect(day(parseDateWord("25.11", TODAY))).toBe("2026-11-25");
    expect(day(parseDateWord("25.11.", TODAY))).toBe("2026-11-25");
    expect(day(parseDateWord("05.01", TODAY))).toBe("2027-01-05");
    expect(day(parseDateWord("03.02.2027", TODAY))).toBe("2027-02-03");
    expect(parseDateWord("31.02", TODAY)).toBeNull();
    expect(parseDateWord("PVN", TODAY)).toBeNull();
  });
});

describe("parseQuickTask", () => {
  it("picks the date, the client and keeps the rest", () => {
    const r = parseQuickTask("Zvanīt Letex par bankas izrakstu rīt", input);
    expect(r.text).toBe("Zvanīt Letex par bankas izrakstu");
    expect(day(r.dueDate)).toBe("2026-11-21");
    expect(r.clientId).toBe("letex");
    expect(r.assigneeId).toBeNull();
  });

  it("hands the task to a colleague with @name", () => {
    const r = parseQuickTask("@Jānis pārbaudīt Kipu PVN piektdien", input);
    expect(r.assigneeId).toBe("janis");
    expect(r.clientId).toBe("kipu");
    expect(r.text).toBe("pārbaudīt Kipu PVN");
    expect(day(r.dueDate)).toBe("2026-11-27");
  });

  it("drops 'līdz' before a date", () => {
    const r = parseQuickTask("Nosūtīt aktu līdz 25.11", input);
    expect(r.text).toBe("Nosūtīt aktu");
    expect(day(r.dueDate)).toBe("2026-11-25");
  });

  it("ignores very short client names that would match anything", () => {
    expect(parseQuickTask("Labot kabata", input).clientId).toBeNull();
  });

  it("leaves a task without date or client as is", () => {
    expect(parseQuickTask("Iztīrīt galdu", input)).toEqual({
      text: "Iztīrīt galdu",
      dueDate: null,
      clientId: null,
      assigneeId: null,
    });
  });
});
