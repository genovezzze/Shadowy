import { describe, it, expect } from "vitest";
import { buildClientMatrix } from "./client-matrix";
import { buildClientLookup, normalizeClientName } from "./client-name";
import { resolveClientMonth, yearMonthKey } from "./client-month";
import { formatDurationLV } from "./utils";

// These tests pin the per-client hours a firm sees on its dashboards and client
// reports. The dangerous classes of bug here are: hours silently dropped when a
// free-typed client name stops matching, a limit overrun computed over the wrong
// period, and an unregistered name turning into its own client row.

const LETEX = { id: "c-letex", name: 'SIA "Letex"', freeMinutesPerMonth: 60 };
const VKK = {
  id: "c-vkk",
  name: "Ventspils Kērlinga Klubs",
  freeMinutesPerMonth: 60,
  aliases: [{ normalized: normalizeClientName("VKK") }],
};
const NO_LIMIT = { id: "c-free", name: "Ganrī", freeMinutesPerMonth: null };

function entry(
  over: Partial<{
    clientId: string | null;
    clientName: string | null;
    employeeId: string;
    employeeName: string;
    durationMinutes: number;
    workDate: Date;
  }>,
) {
  return {
    clientId: null,
    clientName: null,
    employeeId: "e-anna",
    employeeName: "Anna",
    durationMinutes: 30,
    workDate: new Date(Date.UTC(2026, 9, 15)),
    ...over,
  };
}

describe("normalizeClientName", () => {
  it("treats SIA prefixes, quotes, diacritics and spacing as the same client", () => {
    const key = normalizeClientName("Letex");
    for (const variant of ['SIA "Letex"', "SIA''Letex''", "SIA“Letex”", '"Letex" SIA', " letex "]) {
      expect(normalizeClientName(variant)).toBe(key);
    }
    expect(normalizeClientName("Ganrī")).toBe(normalizeClientName("Ganri"));
    expect(normalizeClientName("Tech Gym")).toBe(normalizeClientName("Techgym"));
  });
});

describe("buildClientLookup", () => {
  it("lets a real client name win over another client's alias", () => {
    const realGym = { name: "Techgym" };
    const other = { name: "Other", aliases: [{ normalized: normalizeClientName("Tech Gym") }] };
    expect(buildClientLookup([other, realGym]).get(normalizeClientName("TECH GYM"))).toBe(realGym);
  });
});

describe("buildClientMatrix", () => {
  it("attaches entries by id, by free-typed name and by alias", () => {
    const { rows } = buildClientMatrix(
      [
        entry({ clientId: LETEX.id, durationMinutes: 40 }),
        entry({ clientName: "letex", durationMinutes: 20 }),
        entry({ clientName: "VKK", durationMinutes: 15 }),
      ],
      [LETEX, VKK],
    );
    const byId = Object.fromEntries(rows.map((r) => [r.clientId, r]));
    expect(byId[LETEX.id].totalMinutes).toBe(60);
    expect(byId[VKK.id].totalMinutes).toBe(15);
  });

  it("never creates a row for an unregistered name or a deleted client", () => {
    const { rows } = buildClientMatrix(
      [
        entry({ clientName: "Visi klienti" }),
        entry({ clientId: "c-deleted" }),
        entry({ clientId: null, clientName: null }),
      ],
      [LETEX],
    );
    expect(rows).toEqual([]);
  });

  it("splits a client's minutes per employee", () => {
    const { rows, employees } = buildClientMatrix(
      [
        entry({ clientId: LETEX.id, employeeId: "e-anna", employeeName: "Anna", durationMinutes: 30 }),
        entry({ clientId: LETEX.id, employeeId: "e-ilze", employeeName: "Ilze", durationMinutes: 90 }),
        entry({ clientId: LETEX.id, employeeId: "e-anna", employeeName: "Anna", durationMinutes: 15 }),
      ],
      [LETEX],
    );
    expect(rows[0].byEmployee).toEqual({ "e-anna": 45, "e-ilze": 90 });
    expect(employees.map((e) => e.id)).toEqual(["e-ilze", "e-anna"]);
  });

  it("compares the total against the limit when the period is one month", () => {
    const { rows } = buildClientMatrix(
      [entry({ clientId: LETEX.id, durationMinutes: 100 })],
      [LETEX],
    );
    expect(rows[0].overrunMinutes).toBe(40);
  });

  it("applies the limit per calendar month when resetLimitMonthly is set", () => {
    // 50 min in September and 50 min in October: 100 min in total, but each
    // month stays inside its own 60 min limit, so nothing is overrun.
    const inside = buildClientMatrix(
      [
        entry({ clientId: LETEX.id, durationMinutes: 50, workDate: new Date(Date.UTC(2026, 8, 10)) }),
        entry({ clientId: LETEX.id, durationMinutes: 50, workDate: new Date(Date.UTC(2026, 9, 10)) }),
      ],
      [LETEX],
      { resetLimitMonthly: true },
    );
    expect(inside.rows[0].totalMinutes).toBe(100);
    expect(inside.rows[0].overrunMinutes).toBe(0);
    expect(inside.rows[0].monthlyMinutes).toEqual([
      { month: "2026-09", minutes: 50 },
      { month: "2026-10", minutes: 50 },
    ]);

    const over = buildClientMatrix(
      [
        entry({ clientId: LETEX.id, durationMinutes: 90, workDate: new Date(Date.UTC(2026, 8, 10)) }),
        entry({ clientId: LETEX.id, durationMinutes: 70, workDate: new Date(Date.UTC(2026, 9, 10)) }),
      ],
      [LETEX],
      { resetLimitMonthly: true },
    );
    expect(over.rows[0].overrunMinutes).toBe(30 + 10);
  });

  it("refuses a monthly limit calculation without work dates", () => {
    expect(() =>
      buildClientMatrix(
        [{ ...entry({ clientId: LETEX.id }), workDate: undefined }],
        [LETEX],
        { resetLimitMonthly: true },
      ),
    ).toThrow(/workDate is required/);
  });

  it("reports no overrun for a client without a limit", () => {
    const { rows } = buildClientMatrix(
      [entry({ clientId: NO_LIMIT.id, durationMinutes: 600 })],
      [NO_LIMIT],
    );
    expect(rows[0].freeMinutes).toBeNull();
    expect(rows[0].overrunMinutes).toBe(0);
  });

  it("sorts clients by total minutes, largest first", () => {
    const { rows } = buildClientMatrix(
      [
        entry({ clientId: LETEX.id, durationMinutes: 20 }),
        entry({ clientId: VKK.id, durationMinutes: 80 }),
      ],
      [LETEX, VKK],
    );
    expect(rows.map((r) => r.clientId)).toEqual([VKK.id, LETEX.id]);
  });
});

describe("resolveClientMonth", () => {
  const now = new Date(Date.UTC(2026, 10, 11));

  it("covers exactly one UTC calendar month", () => {
    const m = resolveClientMonth("2026-10", now);
    expect(m.start).toEqual(new Date(Date.UTC(2026, 9, 1)));
    expect(m.end).toEqual(new Date(Date.UTC(2026, 10, 1)));
    expect(m.isCurrent).toBe(false);
  });

  it("falls back to the current month for a missing or malformed value", () => {
    for (const raw of [undefined, "2026-13", "oktobris", "2026-1"]) {
      expect(resolveClientMonth(raw, now).key).toBe(yearMonthKey(now));
    }
  });

  it("returns an unbounded period for 'all'", () => {
    const m = resolveClientMonth("all", now);
    expect(m.isAll).toBe(true);
    expect(m.start).toBeNull();
    expect(m.end).toBeNull();
  });
});

describe("formatDurationLV", () => {
  it("formats minutes the way reports show them", () => {
    expect(formatDurationLV(45)).toBe("45 min");
    expect(formatDurationLV(60)).toBe("1 h");
    expect(formatDurationLV(135)).toBe("2 h 15 min");
  });
});
