import { describe, expect, it } from "vitest";
import { previousReportWeek, rigaDate } from "./report-week";

const inWeek = (d: Date, w: { start: Date; end: Date }) => d >= w.start && d < w.end;

describe("previousReportWeek", () => {
  it("covers last Monday to Sunday when sent Monday morning (the cron time)", () => {
    // Monday 23.11.2026 06:15 UTC = 08:15 Riga.
    const w = previousReportWeek(new Date("2026-11-23T06:15:00Z"));
    expect(w.start.toISOString()).toBe("2026-11-16T00:00:00.000Z");
    expect(w.end.toISOString()).toBe("2026-11-23T00:00:00.000Z");
    expect(w.prevStart.toISOString()).toBe("2026-11-09T00:00:00.000Z");
    expect(w.label).toBe("16.-22. novembris");
  });

  it("keeps last Monday's entries, whichever way the work date was stored", () => {
    const w = previousReportWeek(new Date("2026-11-23T06:15:00Z"));
    expect(inWeek(new Date("2026-11-16T00:00:00Z"), w)).toBe(true); // entry form
    expect(inWeek(new Date("2026-11-16T12:00:00Z"), w)).toBe(true); // smart log
    expect(inWeek(new Date("2026-11-22T12:00:00Z"), w)).toBe(true); // Sunday
    expect(inWeek(new Date("2026-11-23T00:00:00Z"), w)).toBe(false); // this Monday
    expect(inWeek(new Date("2026-11-15T12:00:00Z"), w)).toBe(false); // week before
  });

  it("gives the same week on any day of the following week", () => {
    for (const now of ["2026-11-24T10:00:00Z", "2026-11-29T21:00:00Z"]) {
      expect(previousReportWeek(new Date(now)).start.toISOString()).toBe("2026-11-16T00:00:00.000Z");
    }
  });

  it("uses the Riga day, not the UTC day, around midnight", () => {
    // Sunday 22:30 UTC is already Monday 00:30 in Riga (winter, UTC+2).
    expect(rigaDate(new Date("2026-11-22T22:30:00Z")).toISOString()).toBe("2026-11-23T00:00:00.000Z");
    expect(previousReportWeek(new Date("2026-11-22T22:30:00Z")).start.toISOString()).toBe(
      "2026-11-16T00:00:00.000Z",
    );
  });

  it("labels a week that spans two months", () => {
    expect(previousReportWeek(new Date("2026-12-07T06:15:00Z")).label).toBe("30. novembris - 6. decembris");
  });
});
