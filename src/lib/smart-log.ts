import { z } from "zod";

/**
 * The categories that were missing - bookkeeping, document handling and checks -
 * are what made "palīdzība kolēģim" swallow ~29% of all entries: routine work
 * had no bucket of its own, so it was dropped into the first plausible one.
 *
 * "Helping a colleague" is no longer among them. It describes *why* the work
 * counted as invisible, not what was done, so it lives as its own flag - see
 * WORK_NATURE_FLAGS in @/lib/work-nature.
 */
export const CATEGORY_GROUPS = [
  "Grāmatvedība",
  "Dokumenti",
  "Klienti un komunikācija",
  "Cits",
] as const;

export type CategoryGroup = (typeof CATEGORY_GROUPS)[number];

export type SmartLogCategoryDef = {
  value: string;
  label: string;
  group: string;
  /** Short hint for the AI prompt, describing what belongs in the category. */
  hint?: string;
  /**
   * Display-only ordering number shown in the picker (e.g. "01"). It is NOT
   * part of the category label or the stored value - only a visual aid to find
   * the right row quickly.
   */
  code?: string;
};

/** The label shown in a picker: the ordering number (if any) plus the label. */
export function categoryDisplay(c: SmartLogCategoryDef): string {
  return c.code ? `${c.code} | ${c.label}` : c.label;
}

/**
 * Categories are role-based. The selectable set depends on the employee's work
 * role (see `categoriesForWorkRole`): a bookkeeping assistant ("grāmatvežu
 * palīgs") logs the specific bookkeeping task; an accountant or chief accountant
 * ("grāmatvedis" / "galvenais grāmatvedis") logs the accounting area the work
 * belongs to. General non-bookkeeping categories were retired from the
 * selectable list (they live in LEGACY_SMART_LOG_CATEGORIES so past entries
 * still label and group correctly in the reports). "Helping a colleague" is not
 * a category - it is a separate flag, see WORK_NATURE_FLAGS.
 */
export const GRAMATVEZU_PALIGS_CATEGORIES: readonly SmartLogCategoryDef[] = [
  { value: "bookkeeping_invoices", code: "01", label: "rēķinu un pavadzīmju grāmatošana", group: "Grāmatvežu palīgs", hint: "rēķinu, pavadzīmju, kreditoru un debitoru grāmatošana, ievade programmā" },
  { value: "bookkeeping_receipts", code: "02", label: "čeku grāmatošana", group: "Grāmatvežu palīgs", hint: "čeku grāmatošana, apstrāde, līmēšana" },
  { value: "bookkeeping_cash", code: "03", label: "kases operāciju grāmatošana", group: "Grāmatvežu palīgs", hint: "kase, kases žurnāls, Z atskaites, kases orderi" },
  { value: "bookkeeping_advances", code: "04", label: "avansa norēķinu grāmatošana", group: "Grāmatvežu palīgs", hint: "avansa norēķinu grāmatošana" },
  { value: "bookkeeping_bank", code: "05", label: "bankas operāciju grāmatošana", group: "Grāmatvežu palīgs", hint: "bankas izraksti, bankas datu ievade, karšu maksājumi" },
  { value: "payroll_calculation", code: "06", label: "darba algas aprēķini un grāmatošana", group: "Grāmatvežu palīgs", hint: "darba algas aprēķini un algu grāmatošana" },
  { value: "invoicing", code: "07", label: "rēķinu izrakstīšana", group: "Grāmatvežu palīgs", hint: "rēķinu vai kvīšu izrakstīšana klientam (NEVIS saņemtu rēķinu grāmatošana)" },
  { value: "payment_preparation", code: "08", label: "maksājumu sagatavošana", group: "Grāmatvežu palīgs", hint: "maksājumu sagatavošana" },
  { value: "document_scanning", code: "09", label: "skenēšana", group: "Grāmatvežu palīgs", hint: "dokumentu skenēšana un digitalizēšana" },
  { value: "document_archiving", code: "10", label: "arhivēšana", group: "Grāmatvežu palīgs", hint: "dokumentu arhivēšana un sakārtošana" },
  { value: "other", code: "11", label: "cits", group: "Grāmatvežu palīgs", hint: "citi darbi, kas neietilpst pārējās kategorijās" },
];

export const GRAMATVEDIS_CATEGORIES: readonly SmartLogCategoryDef[] = [
  { value: "gl_vg_zo", code: "01", label: "VG un ZO", group: "Grāmatvedis", hint: "VG un ZO" },
  { value: "tax_vid_pvn_uin", code: "02", label: "VID, PVN, UIN, citas (izņemot algas)", group: "Grāmatvedis", hint: "VID, PVN, UIN un citas deklarācijas un nodokļi, izņemot algas" },
  { value: "payroll_area", code: "03", label: "Algas", group: "Grāmatvedis", hint: "algas un ar algām saistītais darbs" },
  { value: "debtors", code: "04", label: "Debitori", group: "Grāmatvedis", hint: "debitoru uzskaite" },
  { value: "creditors", code: "05", label: "Kreditori", group: "Grāmatvedis", hint: "kreditoru uzskaite" },
  { value: "advances_area", code: "06", label: "Avansa norēķini", group: "Grāmatvedis", hint: "avansa norēķini" },
  { value: "fixed_assets", code: "07", label: "Pamatlīdzekļu nolietojums", group: "Grāmatvedis", hint: "pamatlīdzekļu uzskaite un nolietojums" },
  { value: "bank_area", code: "08", label: "Banka", group: "Grāmatvedis", hint: "bankas operācijas un izraksti" },
  { value: "cash_area", code: "09", label: "Kase", group: "Grāmatvedis", hint: "kases operācijas" },
  { value: "contracts", code: "10", label: "Līgumi", group: "Grāmatvedis", hint: "līgumu sagatavošana un uzskaite" },
  { value: "annual_report_area", code: "11", label: "Gada pārskats", group: "Grāmatvedis", hint: "gada pārskata sastādīšana" },
  { value: "other_work", code: "12", label: "Citi darbi", group: "Grāmatvedis", hint: "citi darbi, kas neietilpst pārējās kategorijās" },
];

/**
 * Every currently-selectable category across both roles. Used where the viewer
 * is not a single employee (managers, admins, history filters) and for building
 * the label map and the validation enum.
 */
export const SMART_LOG_CATEGORIES: readonly SmartLogCategoryDef[] = [
  ...GRAMATVEZU_PALIGS_CATEGORIES,
  ...GRAMATVEDIS_CATEGORIES,
];

/**
 * Picks the selectable category set for an employee from their work-role name.
 * A name containing "palīgs" (assistant) gets the detailed bookkeeping tasks;
 * "grāmatvedis" / "galvenais grāmatvedis" and anything else get the accounting
 * areas.
 */
export function categoriesForWorkRole(
  workRoleName: string | null | undefined,
): readonly SmartLogCategoryDef[] {
  const n = (workRoleName ?? "").toLowerCase();
  // A bookkeeping assistant sees their own detailed "Grāmatvežu palīgs" tasks.
  // A plain accountant / chief accountant sees the accountant areas.
  if (n.includes("palīg") || n.includes("palig")) {
    return GRAMATVEZU_PALIGS_CATEGORIES;
  }
  return GRAMATVEDIS_CATEGORIES;
}

/** The category guidance block for the AI prompt, built from a category set. */
export function buildCategoryGuidance(categories: readonly SmartLogCategoryDef[]): string {
  return categories.map((c) => `  - ${c.value}: ${c.hint ?? c.label}`).join("\n");
}

/**
 * No longer selectable, but entries already carry these. Kept so historical
 * rows render a human label instead of a raw key. `bookkeeping` and
 * `document_processing` were the coarse buckets that the split above replaced.
 */
export const LEGACY_SMART_LOG_CATEGORIES = [
  { value: "helping_colleague", label: "palīdzība kolēģim" },
  { value: "bookkeeping", label: "grāmatvedības uzskaite" },
  { value: "document_processing", label: "dokumentu apstrāde un arhivēšana" },
  // Retired from the selectable list but kept here so past entries still carry
  // a human label and fold into the right key in the reports (parskats).
  { value: "legal_documents", label: "juridisko dokumentu sagatavošana" },
  { value: "client_communication", label: "saziņa ar klientu" },
  { value: "client_meeting", label: "klātienes tikšanās ar klientiem" },
  { value: "hortus_digital_communication", label: "saziņa ar Hortus Digital" },
  { value: "vid_communication", label: "saziņa ar VID" },
  { value: "onboarding", label: "ievadīšana darbā" },
  { value: "repeated_questions", label: "atkārtoti jautājumi" },
  { value: "urgent_extra_task", label: "steidzams papildu uzdevums" },
  { value: "work_outside_role", label: "darbs ārpus lomas" },
  { value: "fixing_mistakes", label: "kļūdu labošana" },
  // Retired from the assistant set but kept so past entries keep their label
  // and still fold into the right key in the reports.
  { value: "reconciliation", label: "pārbaudes un saskaņošana" },
  { value: "statistics_reports", label: "statistikas pārskatu sagatavošana" },
  { value: "annual_report", label: "gada pārskatu sastādīšana" },
] as const;

/**
 * Older label spellings that must still resolve to their canonical key.
 *
 * Renaming a label silently orphans every historical row storing the old text -
 * grouping matches on the label, so the rows split into a second chart line
 * that renders identically. "darba algas aprēķini" alone covers 59 live rows.
 *
 * Keys must be lowercase; lookup lowercases the incoming value.
 */
export const CATEGORY_LABEL_ALIASES: Record<string, string> = {
  // Relabelled when payroll posting was folded into this category.
  "darba algas aprēķini": "payroll_calculation",
  // Plural spelling used by some entries.
  "palīdzība kolēģiem": "helping_colleague",
  // Shortened when these became assistant categories (skenēšana / arhivēšana).
  "dokumentu skenēšana un digitalizēšana": "document_scanning",
  "dokumentu arhivēšana un sakārtošana": "document_archiving",
};

const ALL_CATEGORY_VALUES = SMART_LOG_CATEGORIES.map((c) => c.value);

// Accepts any currently-selectable category from either role. The AI is further
// constrained to one role's set by the per-request JSON schema.
export const smartLogCategorySchema = z.enum(
  ALL_CATEGORY_VALUES as [string, ...string[]],
);

export type SmartLogCategory = string;

/** Labels for every category ever written to the DB, current and retired. */
export const SMART_LOG_CATEGORY_LABELS = Object.fromEntries(
  [...SMART_LOG_CATEGORIES, ...LEGACY_SMART_LOG_CATEGORIES].map((category) => [
    category.value,
    category.label,
  ])
) as Record<string, string>;

export const smartLogDraftSchema = z.object({
  title: z.string().trim().min(3).max(120),
  category: smartLogCategorySchema,
  description: z.string().trim().min(3).max(2000),
  work_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  client_name: z.string().trim().max(120).nullable(),
  estimated_time_minutes: z.number().int().min(1).max(1440).nullable(),
  is_outside_role: z.boolean().nullable(),
  is_helping_colleague: z.boolean(),
  helped_colleague_name: z.string().trim().max(120).nullable(),
  role_relation: z.string().trim().max(300),
  business_impact: z.string().trim().max(500),
  confidence_score: z.number().min(0).max(1),
});

export const smartLogResponseSchema = z.object({
  tickets: z.array(smartLogDraftSchema).max(8),
});

export type SmartLogDraft = z.infer<typeof smartLogDraftSchema>;

/**
 * Builds the response JSON schema for a specific category set, so the AI can
 * only pick a category that is valid for the logging employee's role.
 */
export function buildSmartLogJsonSchema(categoryValues: readonly string[]) {
  return {
  type: "object",
  additionalProperties: false,
  properties: {
    tickets: {
      type: "array",
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string", minLength: 3, maxLength: 120 },
          category: {
            type: "string",
            enum: [...categoryValues],
          },
          description: { type: "string", minLength: 3, maxLength: 2000 },
          work_date: {
            anyOf: [
              {
                type: "string",
                pattern: "^\\d{4}-\\d{2}-\\d{2}$",
              },
              { type: "null" },
            ],
          },
          client_name: {
            anyOf: [
              { type: "string", maxLength: 120 },
              { type: "null" },
            ],
          },
          estimated_time_minutes: {
            anyOf: [
              { type: "integer", minimum: 1, maximum: 1440 },
              { type: "null" },
            ],
          },
          is_outside_role: {
            anyOf: [{ type: "boolean" }, { type: "null" }],
          },
          is_helping_colleague: { type: "boolean" },
          helped_colleague_name: {
            anyOf: [
              { type: "string", maxLength: 120 },
              { type: "null" },
            ],
          },
          role_relation: { type: "string", maxLength: 300 },
          business_impact: { type: "string", maxLength: 500 },
          confidence_score: { type: "number", minimum: 0, maximum: 1 },
        },
        required: [
          "title",
          "category",
          "description",
          "work_date",
          "client_name",
          "estimated_time_minutes",
          "is_outside_role",
          "is_helping_colleague",
          "helped_colleague_name",
          "role_relation",
          "business_impact",
          "confidence_score",
        ],
      },
    },
  },
  required: ["tickets"],
  } as const;
}

export const SMART_LOG_JSON_SCHEMA = buildSmartLogJsonSchema(ALL_CATEGORY_VALUES);
