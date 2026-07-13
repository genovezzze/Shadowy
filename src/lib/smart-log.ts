import { z } from "zod";

export const SMART_LOG_CATEGORIES = [
  { value: "helping_colleague", label: "palīdzība kolēģim" },
  { value: "onboarding", label: "ievadīšana darbā" },
  { value: "urgent_extra_task", label: "steidzams papildu uzdevums" },
  { value: "work_outside_role", label: "darbs ārpus lomas" },
  { value: "fixing_mistakes", label: "kļūdu labošana" },
  { value: "repeated_questions", label: "atkārtoti jautājumi" },
  { value: "statistics_reports", label: "statistikas pārskatu sagatavošana" },
  { value: "payroll_calculation", label: "darba algas aprēķini" },
  { value: "payment_preparation", label: "maksājumu sagatavošana" },
  { value: "invoicing", label: "rēķinu izrakstīšana" },
  { value: "legal_documents", label: "juridisko dokumentu sagatavošana" },
  { value: "client_communication", label: "saziņa ar klientu" },
  { value: "client_meeting", label: "klātienes tikšanās ar klientiem" },
  { value: "hortus_digital_communication", label: "saziņa ar Hortus Digital" },
  { value: "other", label: "cits" },
] as const;

export const smartLogCategorySchema = z.enum([
  "helping_colleague",
  "onboarding",
  "urgent_extra_task",
  "work_outside_role",
  "fixing_mistakes",
  "repeated_questions",
  "statistics_reports",
  "payroll_calculation",
  "payment_preparation",
  "invoicing",
  "legal_documents",
  "client_communication",
  "client_meeting",
  "hortus_digital_communication",
  "other",
]);

export type SmartLogCategory = z.infer<typeof smartLogCategorySchema>;

export const SMART_LOG_CATEGORY_LABELS = Object.fromEntries(
  SMART_LOG_CATEGORIES.map((category) => [category.value, category.label])
) as Record<SmartLogCategory, string>;

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
          "role_relation",
          "business_impact",
          "confidence_score",
        ],
      },
    },
  },
  required: ["tickets"],
} as const;
