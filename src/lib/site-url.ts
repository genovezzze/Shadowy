const DEFAULT_SITE_URL = "https://shadowy.lv";

export function getSiteUrl(fallback = DEFAULT_SITE_URL): string {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!configuredUrl) {
    return fallback;
  }

  try {
    return new URL(configuredUrl).origin;
  } catch {
    return fallback;
  }
}
