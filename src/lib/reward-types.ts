export type RewardType =
  | "PAID_DAY_OFF"
  | "FLEXIBLE_HOURS"
  | "REMOTE_DAY"
  | "OFFICIAL_RECOGNITION"
  | "THANK_YOU_MESSAGE"
  | "GIFT_CARD"
  | "WORKLOAD_REVIEW";

export type PeriodType = "WEEK" | "TWO_WEEKS" | "MONTH" | "QUARTER";

export type BonusRequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "RETURNED";

export const REWARD_LABELS: Record<RewardType, string> = {
  PAID_DAY_OFF: "Apmaksāta brīvdiena",
  FLEXIBLE_HOURS: "Elastīgas apmaksātas stundas",
  REMOTE_DAY: "Papildu attālinātā darba diena",
  OFFICIAL_RECOGNITION: "Oficiāla atzinība",
  THANK_YOU_MESSAGE: "Pateicības ziņojums",
  GIFT_CARD: "Dāvanu karte",
  WORKLOAD_REVIEW: "Darba slodzes pārskatīšana",
};

export const PERIOD_LABELS: Record<PeriodType, string> = {
  WEEK: "Nedēļa",
  TWO_WEEKS: "2 nedēļas",
  MONTH: "Mēnesis",
  QUARTER: "Ceturksnis",
};

export const BONUS_STATUS_LABELS: Record<BonusRequestStatus, string> = {
  PENDING: "Gaida izskatīšanu",
  APPROVED: "Apstiprināts",
  REJECTED: "Noraidīts",
  RETURNED: "Nosūtīts atpakaļ",
};

export const BONUS_STATUS_TONE: Record<
  BonusRequestStatus,
  "default" | "success" | "destructive" | "muted"
> = {
  PENDING: "default",
  APPROVED: "success",
  REJECTED: "destructive",
  RETURNED: "muted",
};

export const REWARD_TYPES = Object.keys(REWARD_LABELS) as RewardType[];
export const PERIOD_TYPES = Object.keys(PERIOD_LABELS) as PeriodType[];
