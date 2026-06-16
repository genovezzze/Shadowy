const TRIAL_DAYS = 30;

export function trialEndsAtDate(): Date {
  return new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
}

// Dates more than 365 days away are treated as "unlimited" - no banner shown.
const MAX_TRIAL_DISPLAY_DAYS = 365;

export function getTrialDaysLeft(trialEndsAt: Date | null | undefined): number | null {
  if (!trialEndsAt) return null;
  const msLeft = trialEndsAt.getTime() - Date.now();
  const days = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
  if (days > MAX_TRIAL_DISPLAY_DAYS) return null;
  return days;
}

export function isTrialExpired(trialEndsAt: Date | null | undefined): boolean {
  if (!trialEndsAt) return false;
  return trialEndsAt.getTime() < Date.now();
}
