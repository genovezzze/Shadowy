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

/**
 * Bookkeeping is split by the object being posted (invoices, receipts, cash,
 * advances, bank) rather than kept as one "accounting" bucket. A single
 * `bookkeeping` category still hid the answer a manager needs - 60 of the 117
 * misfiled entries landed in it, and "60 entries of bookkeeping" is not
 * something anyone can act on, whereas "23 invoice postings, 16 receipt
 * postings" points at what to automate first.
 */
export const SMART_LOG_CATEGORIES = [
  { value: "bookkeeping_invoices", label: "rēķinu un pavadzīmju grāmatošana", group: "Grāmatvedība" },
  { value: "bookkeeping_receipts", label: "čeku grāmatošana", group: "Grāmatvedība" },
  { value: "bookkeeping_cash", label: "kases operāciju grāmatošana", group: "Grāmatvedība" },
  { value: "bookkeeping_advances", label: "avansa norēķinu grāmatošana", group: "Grāmatvedība" },
  { value: "bookkeeping_bank", label: "bankas operāciju grāmatošana", group: "Grāmatvedība" },
  { value: "payroll_calculation", label: "darba algas aprēķini un grāmatošana", group: "Grāmatvedība" },
  { value: "reconciliation", label: "pārbaudes un saskaņošana", group: "Grāmatvedība" },
  { value: "invoicing", label: "rēķinu izrakstīšana", group: "Grāmatvedība" },
  { value: "payment_preparation", label: "maksājumu sagatavošana", group: "Grāmatvedība" },
  { value: "statistics_reports", label: "statistikas pārskatu sagatavošana", group: "Grāmatvedība" },
  { value: "document_scanning", label: "dokumentu skenēšana un digitalizēšana", group: "Dokumenti" },
  { value: "document_archiving", label: "dokumentu arhivēšana un sakārtošana", group: "Dokumenti" },
  { value: "legal_documents", label: "juridisko dokumentu sagatavošana", group: "Dokumenti" },
  { value: "client_communication", label: "saziņa ar klientu", group: "Klienti un komunikācija" },
  { value: "client_meeting", label: "klātienes tikšanās ar klientiem", group: "Klienti un komunikācija" },
  { value: "hortus_digital_communication", label: "saziņa ar Hortus Digital", group: "Klienti un komunikācija" },
  { value: "onboarding", label: "ievadīšana darbā", group: "Cits" },
  { value: "repeated_questions", label: "atkārtoti jautājumi", group: "Cits" },
  { value: "urgent_extra_task", label: "steidzams papildu uzdevums", group: "Cits" },
  { value: "work_outside_role", label: "darbs ārpus lomas", group: "Cits" },
  { value: "fixing_mistakes", label: "kļūdu labošana", group: "Cits" },
  { value: "other", label: "cits", group: "Cits" },
] as const;

/**
 * No longer selectable, but entries already carry these. Kept so historical
 * rows render a human label instead of a raw key. `bookkeeping` and
 * `document_processing` were the coarse buckets that the split above replaced.
 */
export const LEGACY_SMART_LOG_CATEGORIES = [
  { value: "helping_colleague", label: "palīdzība kolēģim" },
  { value: "bookkeeping", label: "grāmatvedības uzskaite" },
  { value: "document_processing", label: "dokumentu apstrāde un arhivēšana" },
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
};

export const smartLogCategorySchema = z.enum([
  "bookkeeping_invoices",
  "bookkeeping_receipts",
  "bookkeeping_cash",
  "bookkeeping_advances",
  "bookkeeping_bank",
  "payroll_calculation",
  "reconciliation",
  "invoicing",
  "payment_preparation",
  "statistics_reports",
  "document_scanning",
  "document_archiving",
  "legal_documents",
  "client_communication",
  "client_meeting",
  "hortus_digital_communication",
  "onboarding",
  "repeated_questions",
  "urgent_extra_task",
  "work_outside_role",
  "fixing_mistakes",
  "other",
]);

export type SmartLogCategory = z.infer<typeof smartLogCategorySchema>;

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

export const SMART_LOG_JSON_SCHEMA = {
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
            enum: SMART_LOG_CATEGORIES.map((category) => category.value),
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
