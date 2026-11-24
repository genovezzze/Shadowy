import { describe, it, expect } from "vitest";
import { activeOn, checkAbsence, overlaps, type AbsenceLike } from "./absences";
import { utcDay } from "./team-tasks";

// The rules that keep a vacation from leaving work uncovered.

const names = new Map([
  ["ilze", "Ilze"],
  ["janis", "Jānis"],
  ["zane", "Zane"],
]);

function a(over: Partial<AbsenceLike> = {}): AbsenceLike {
  return {
    userId: "ilze",
    substituteId: "janis",
    type: "vacation",
    startDate: utcDay(2026, 12, 1),
    endDate: utcDay(2026, 12, 5),
    ...over,
  };
}

const errors = (list: ReturnType<typeof checkAbsence>) => list.filter((i) => i.kind === "error");
const warnings = (list: ReturnType<typeof checkAbsence>) => list.filter((i) => i.kind === "warning");

describe("dates", () => {
  it("overlap includes the edge days", () => {
    expect(overlaps(a(), a({ startDate: utcDay(2026, 12, 5), endDate: utcDay(2026, 12, 9) }))).toBe(true);
    expect(overlaps(a(), a({ startDate: utcDay(2026, 12, 6), endDate: utcDay(2026, 12, 9) }))).toBe(false);
  });

  it("is active on the first and last day", () => {
    expect(activeOn(a(), utcDay(2026, 12, 1))).toBe(true);
    expect(activeOn(a(), utcDay(2026, 12, 5))).toBe(true);
    expect(activeOn(a(), utcDay(2026, 12, 6))).toBe(false);
  });
});

describe("checkAbsence", () => {
  it("accepts a normal vacation with a free substitute", () => {
    expect(checkAbsence(a(), [], names)).toEqual([]);
  });

  it("requires a substitute for vacation and sick leave, not for busy", () => {
    expect(errors(checkAbsence(a({ substituteId: null }), [], names))).toHaveLength(1);
    expect(errors(checkAbsence(a({ type: "sick", substituteId: null }), [], names))).toHaveLength(1);
    expect(checkAbsence(a({ type: "busy", substituteId: null }), [], names)).toEqual([]);
  });

  it("rejects substituting oneself and reversed dates", () => {
    expect(errors(checkAbsence(a({ substituteId: "ilze" }), [], names))).toHaveLength(1);
    expect(errors(checkAbsence(a({ startDate: utcDay(2026, 12, 9) }), [], names))).toHaveLength(1);
  });

  it("rejects a substitute who is away at the same time", () => {
    const janisAway = a({ userId: "janis", substituteId: "zane" });
    const issues = checkAbsence(a(), [janisAway], names);
    expect(errors(issues)[0].message).toContain("Jānis");
  });

  it("only warns when the substitute already covers someone else", () => {
    const zaneAway = a({ userId: "zane", substituteId: "janis" });
    const issues = checkAbsence(a(), [zaneAway], names);
    expect(errors(issues)).toEqual([]);
    expect(warnings(issues)[0].message).toContain("Zane");
  });

  it("warns when the person is themselves someone's substitute then", () => {
    const zaneAway = a({ userId: "zane", substituteId: "ilze" });
    expect(warnings(checkAbsence(a(), [zaneAway], names))).toHaveLength(1);
  });

  it("rejects a second absence of the same person on the same days", () => {
    expect(errors(checkAbsence(a(), [a({ id: "other" })], names))).toHaveLength(1);
  });
});
