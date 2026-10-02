import { describe, it, expect } from "vitest";
import {
  GRAMATVEZU_PALIGS_CATEGORIES,
  GRAMATVEDIS_CATEGORIES,
  SMART_LOG_CATEGORIES,
  LEGACY_SMART_LOG_CATEGORIES,
  CATEGORY_LABEL_ALIASES,
  SMART_LOG_CATEGORY_LABELS,
  categoriesForWorkRole,
  categoryDisplay,
  buildCategoryGuidance,
  buildSmartLogJsonSchema,
  SMART_LOG_JSON_SCHEMA,
  smartLogCategorySchema,
  smartLogResponseSchema,
} from "./smart-log";
import { normalizeCategoryKey, categoryLabel } from "./work-insights";

// These tests pin the role-based category system. The dangerous classes of bug
// here are: an employee being offered the wrong role's categories, a historical
// entry losing its human label in the reports (grouping on an orphaned key), and
// the AI being allowed to return a category the role can't log.

const ALL_CATEGORIES = [...SMART_LOG_CATEGORIES, ...LEGACY_SMART_LOG_CATEGORIES];

describe("categoriesForWorkRole", () => {
  it("gives a bookkeeping assistant the assistant set", () => {
    for (const name of [
      "Grāmatvežu palīgs",
      "grāmatvežu palīgs",
      "GRĀMATVEŽU PALĪGS",
      "Galvenā grāmatveža palīgs",
      "paligs", // no diacritics
    ]) {
      expect(categoriesForWorkRole(name)).toBe(GRAMATVEZU_PALIGS_CATEGORIES);
    }
  });

  it("gives an accountant / chief accountant the accountant set", () => {
    for (const name of [
      "Grāmatvedis",
      "galvenais grāmatvedis",
      "Galvenais grāmatvedis",
      "Vecākais grāmatvedis",
    ]) {
      expect(categoriesForWorkRole(name)).toBe(GRAMATVEDIS_CATEGORIES);
    }
  });

  it("does NOT misread 'galvenais grāmatvedis' as an assistant", () => {
    // Regression guard: the only signal is the substring "palīg"; a chief
    // accountant must never fall into the assistant branch.
    expect(categoriesForWorkRole("galvenais grāmatvedis")).toBe(
      GRAMATVEDIS_CATEGORIES,
    );
  });

  it("defaults to the accountant set for unknown, empty or missing roles", () => {
    expect(categoriesForWorkRole(null)).toBe(GRAMATVEDIS_CATEGORIES);
    expect(categoriesForWorkRole(undefined)).toBe(GRAMATVEDIS_CATEGORIES);
    expect(categoriesForWorkRole("")).toBe(GRAMATVEDIS_CATEGORIES);
    expect(categoriesForWorkRole("Jurists")).toBe(GRAMATVEDIS_CATEGORIES);
  });
});

describe("assistant category set", () => {
  it("has exactly the 8 current assistant tasks", () => {
    expect(GRAMATVEZU_PALIGS_CATEGORIES.map((c) => c.value)).toEqual([
      "bookkeeping_invoices",
      "bookkeeping_receipts",
      "bookkeeping_cash",
      "bookkeeping_advances",
      "bookkeeping_bank",
      "payroll_calculation",
      "invoicing",
      "payment_preparation",
    ]);
  });

  it("no longer offers the retired assistant categories", () => {
    const values = GRAMATVEZU_PALIGS_CATEGORIES.map((c) => c.value);
    for (const retired of [
      "reconciliation",
      "statistics_reports",
      "annual_report",
    ]) {
      expect(values).not.toContain(retired);
    }
  });

  it("is shown as a single group (no second tab for the assistant)", () => {
    const groups = new Set(GRAMATVEZU_PALIGS_CATEGORIES.map((c) => c.group));
    expect([...groups]).toEqual(["Grāmatvežu palīgs"]);
  });
});

describe("category set integrity", () => {
  it("has no duplicate value across the selectable sets", () => {
    const values = SMART_LOG_CATEGORIES.map((c) => c.value);
    expect(new Set(values).size).toBe(values.length);
  });

  it("does not share a value between selectable and legacy sets", () => {
    const current = new Set(SMART_LOG_CATEGORIES.map((c) => c.value));
    for (const legacy of LEGACY_SMART_LOG_CATEGORIES) {
      expect(current.has(legacy.value)).toBe(false);
    }
  });

  it("keeps the retired assistant categories only in the legacy set", () => {
    const legacyValues = LEGACY_SMART_LOG_CATEGORIES.map((c) => c.value);
    for (const retired of [
      "reconciliation",
      "statistics_reports",
      "annual_report",
    ]) {
      expect(legacyValues).toContain(retired);
    }
  });

  it("numbers each selectable group sequentially from 01", () => {
    for (const set of [GRAMATVEZU_PALIGS_CATEGORIES, GRAMATVEDIS_CATEGORIES]) {
      const codes = set.map((c) => c.code);
      expect(codes).toEqual(
        set.map((_, i) => String(i + 1).padStart(2, "0")),
      );
    }
  });

  it("gives every selectable category a hint for the AI prompt", () => {
    for (const c of SMART_LOG_CATEGORIES) {
      expect(c.hint && c.hint.length).toBeTruthy();
    }
  });
});

describe("categoryDisplay", () => {
  it("prefixes the ordering number when present", () => {
    expect(
      categoryDisplay({
        value: "x",
        label: "Kase",
        group: "Grāmatvedis",
        code: "09",
      }),
    ).toBe("09 | Kase");
  });

  it("falls back to the bare label without a code", () => {
    expect(
      categoryDisplay({ value: "x", label: "Kase", group: "Grāmatvedis" }),
    ).toBe("Kase");
  });
});

describe("report label round-trip (historical data must not orphan)", () => {
  it("resolves every current and legacy label back to its key", () => {
    for (const c of ALL_CATEGORIES) {
      expect(normalizeCategoryKey(c.label)).toBe(c.value);
      // case-insensitive, trimmed
      expect(normalizeCategoryKey(`  ${c.label.toUpperCase()}  `)).toBe(c.value);
    }
  });

  it("leaves a canonical key untouched", () => {
    for (const c of ALL_CATEGORIES) {
      expect(normalizeCategoryKey(c.value)).toBe(c.value);
    }
  });

  it("resolves legacy label aliases to the canonical key", () => {
    for (const [alias, key] of Object.entries(CATEGORY_LABEL_ALIASES)) {
      expect(normalizeCategoryKey(alias)).toBe(key);
      expect(normalizeCategoryKey(alias.toUpperCase())).toBe(key);
    }
  });

  it("gives every key a human label", () => {
    for (const c of ALL_CATEGORIES) {
      expect(categoryLabel(c.value)).toBe(c.label);
    }
  });

  it("returns the raw value for a truly unknown category", () => {
    expect(normalizeCategoryKey("totally_unknown_key")).toBe(
      "totally_unknown_key",
    );
    expect(categoryLabel("totally_unknown_key")).toBe("totally_unknown_key");
  });
});

describe("buildCategoryGuidance", () => {
  it("lists one `value: hint` line per category", () => {
    const guidance = buildCategoryGuidance(GRAMATVEDIS_CATEGORIES);
    const lines = guidance.split("\n");
    expect(lines).toHaveLength(GRAMATVEDIS_CATEGORIES.length);
    expect(lines[0]).toBe("  - gl_vg_zo: VG un ZO");
    // the number/code never leaks into the AI guidance
    expect(guidance).not.toContain("01");
  });
});

describe("buildSmartLogJsonSchema", () => {
  it("constrains the category enum to the given set", () => {
    const schema = buildSmartLogJsonSchema(
      GRAMATVEZU_PALIGS_CATEGORIES.map((c) => c.value),
    );
    expect(schema.properties.tickets.items.properties.category.enum).toEqual(
      GRAMATVEZU_PALIGS_CATEGORIES.map((c) => c.value),
    );
  });

  it("the default schema exposes every selectable value", () => {
    expect(
      SMART_LOG_JSON_SCHEMA.properties.tickets.items.properties.category.enum,
    ).toEqual(SMART_LOG_CATEGORIES.map((c) => c.value));
  });
});

describe("smartLogCategorySchema (zod validation of AI output)", () => {
  it("accepts every currently-selectable value", () => {
    for (const c of SMART_LOG_CATEGORIES) {
      expect(smartLogCategorySchema.safeParse(c.value).success).toBe(true);
    }
  });

  it("rejects a legacy-only / retired value", () => {
    for (const v of ["reconciliation", "statistics_reports", "annual_report", "cits"]) {
      expect(smartLogCategorySchema.safeParse(v).success).toBe(false);
    }
  });
});

describe("smartLogResponseSchema", () => {
  const ticket = {
    title: "Iegrāmatoju čekus",
    category: "bookkeeping_receipts",
    description: "Sakārtoju un iegrāmatoju čekus",
    work_date: "2026-10-02",
    client_name: null,
    estimated_time_minutes: 30,
    is_outside_role: null,
    is_helping_colleague: false,
    helped_colleague_name: null,
    role_relation: "",
    business_impact: "",
    confidence_score: 0.8,
  };

  it("accepts a well-formed set of tickets", () => {
    expect(
      smartLogResponseSchema.safeParse({ tickets: [ticket] }).success,
    ).toBe(true);
  });

  it("accepts an empty tickets array", () => {
    expect(smartLogResponseSchema.safeParse({ tickets: [] }).success).toBe(true);
  });

  it("rejects more than 8 tickets", () => {
    const many = Array.from({ length: 9 }, () => ticket);
    expect(smartLogResponseSchema.safeParse({ tickets: many }).success).toBe(
      false,
    );
  });
});

describe("SMART_LOG_CATEGORY_LABELS map", () => {
  it("covers every current and legacy value exactly once", () => {
    for (const c of ALL_CATEGORIES) {
      expect(SMART_LOG_CATEGORY_LABELS[c.value]).toBe(c.label);
    }
  });
});
