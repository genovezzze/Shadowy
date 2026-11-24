import { describe, expect, it } from "vitest";
import {
  comparisonWindows,
  customTrendBuckets,
  rangeFilter,
  resolveDateRange,
  sumIntoBuckets,
} from "./date-range";

const NOW = new Date("2026-11-24T10:00:00Z");

describe("resolveDateRange", () => {
  it("keeps the quick presets as rolling windows", () => {
    const r = resolveDateRange({ period: "7d" }, { defaultKey: "30d", now: NOW });
    expect(r.key).toBe("7d");
    expect(r.start?.toISOString()).toBe("2026-11-17T10:00:00.000Z");
    expect(r.end).toBeUndefined();
    expect(r.badge).toBe("7 d.");
  });

  it("falls back to the page default for a missing or unknown period", () => {
    expect(resolveDateRange(undefined, { defaultKey: "30d", now: NOW }).key).toBe("30d");
    expect(resolveDateRange({ period: "5y" }, { defaultKey: "all", now: NOW }).key).toBe("all");
  });

  it("all time has no bounds", () => {
    const r = resolveDateRange({ period: "all" }, { defaultKey: "30d", now: NOW });
    expect(rangeFilter(r)).toBeUndefined();
    expect(r.badge).toBe("Viss");
  });

  it("a custom range includes both picked days", () => {
    const r = resolveDateRange({ period: "custom", from: "2026-04-01", to: "2026-12-30" }, { defaultKey: "30d", now: NOW });
    expect(r.key).toBe("custom");
    expect(r.start?.toISOString()).toBe("2026-04-01T00:00:00.000Z");
    expect(r.end?.toISOString()).toBe("2026-12-31T00:00:00.000Z");
    expect(r.label).toBe("01.04.2026 - 30.12.2026");
    expect(r.badge).toBe("01.04.-30.12.2026");
    const f = rangeFilter(r)!;
    // Both stored forms of the last day are inside; the next day is not.
    for (const d of ["2026-12-30T00:00:00Z", "2026-12-30T12:00:00Z", "2026-04-01T00:00:00Z"]) {
      expect(new Date(d) >= f.gte! && new Date(d) < f.lt!).toBe(true);
    }
    expect(new Date("2026-12-31T00:00:00Z") < f.lt!).toBe(false);
  });

  it("swaps a reversed range and handles a single day", () => {
    const r = resolveDateRange({ period: "custom", from: "2026-05-10", to: "2026-05-01" }, { defaultKey: "30d", now: NOW });
    expect(r.from).toBe("2026-05-01");
    expect(r.to).toBe("2026-05-10");
    expect(r.days).toBe(10);
    const one = resolveDateRange({ period: "custom", from: "2026-05-01", to: "2026-05-01" }, { defaultKey: "30d", now: NOW });
    expect(one.days).toBe(1);
    expect(one.label).toBe("01.05.2026");
  });

  it("ignores a broken custom range", () => {
    for (const p of [
      { period: "custom", from: "2026-02-30", to: "2026-03-01" },
      { period: "custom", from: "2026-01-01" },
      { period: "custom", from: "x", to: "y" },
    ]) {
      expect(resolveDateRange(p, { defaultKey: "30d", now: NOW }).key).toBe("30d");
    }
  });
});

describe("comparisonWindows", () => {
  it("compares a custom range with the equally long range before it", () => {
    const r = resolveDateRange({ period: "custom", from: "2026-11-01", to: "2026-11-10" }, { defaultKey: "30d", now: NOW });
    const w = comparisonWindows(r, NOW);
    expect(w.current.start.toISOString()).toBe("2026-11-01T00:00:00.000Z");
    expect(w.previous.start.toISOString()).toBe("2026-10-22T00:00:00.000Z");
    expect(w.previous.end.toISOString()).toBe("2026-11-01T00:00:00.000Z");
    expect(w.label).toBe("pret iepr. 10 d.");
  });

  it("uses 30 days for all time", () => {
    const r = resolveDateRange({ period: "all" }, { defaultKey: "30d", now: NOW });
    expect(comparisonWindows(r, NOW).label).toBe("pret iepr. 30 d.");
  });
});

describe("customTrendBuckets", () => {
  const range = (from: string, to: string) =>
    resolveDateRange({ period: "custom", from, to }, { defaultKey: "30d", now: NOW });

  it("uses days for up to a month", () => {
    const r = range("2026-11-01", "2026-11-30");
    const b = customTrendBuckets(r.start!, r.end!);
    expect(b).toHaveLength(30);
    expect(b[0].label).toBe("01.11");
  });

  it("uses weeks up to half a year, clipped to the range", () => {
    const r = range("2026-09-02", "2026-11-30"); // starts on a Wednesday
    const b = customTrendBuckets(r.start!, r.end!);
    expect(b[0].start.toISOString()).toBe("2026-09-02T00:00:00.000Z");
    expect(b[0].label).toBe("31.08");
    expect(b.at(-1)!.end.toISOString()).toBe("2026-12-01T00:00:00.000Z");
  });

  it("uses months for longer ranges", () => {
    const r = range("2026-04-01", "2026-12-30");
    const b = customTrendBuckets(r.start!, r.end!);
    expect(b.map((x) => x.label)).toEqual(["Apr", "Mai", "Jūn", "Jūl", "Aug", "Sep", "Okt", "Nov", "Dec"]);
  });

  it("sums minutes into the right bucket and drops what is outside", () => {
    const r = range("2026-11-01", "2026-11-03");
    const b = customTrendBuckets(r.start!, r.end!);
    const items = [
      { d: new Date("2026-11-01T12:00:00Z"), m: 90 },
      { d: new Date("2026-11-03T00:00:00Z"), m: 30 },
      { d: new Date("2026-11-04T00:00:00Z"), m: 600 },
    ];
    expect(sumIntoBuckets(b, items, (i) => i.d, (i) => i.m).map((x) => x.value)).toEqual([1.5, 0, 0.5]);
  });
});
