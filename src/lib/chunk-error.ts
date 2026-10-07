/**
 * Detects webpack/Next.js chunk-loading errors that happen when a browser tab
 * stays open across a deploy and requests a JS chunk whose hash no longer
 * exists on the server. These are not application bugs - a single reload
 * fetches the current build and resolves them.
 */
export function isChunkLoadError(error: Error): boolean {
  const message = error.message || "";
  return (
    error.name === "ChunkLoadError" ||
    /Loading chunk [\d]+ failed/i.test(message) ||
    /Failed to fetch dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message) ||
    /Cannot read properties of undefined \(reading 'call'\)/i.test(message)
  );
}

const RELOAD_GUARD_KEY = "shadowy-chunk-reload";
/** How many cache-busting reloads to attempt before giving up and showing the error UI. */
const MAX_ATTEMPTS = 2;
/**
 * If the previous recovery attempt was longer ago than this, the app had been
 * running fine, so a new chunk error is treated as fresh (counter reset) rather
 * than part of a reload loop.
 */
const RESET_AFTER_MS = 30_000;

type Guard = { n: number; t: number };

function readGuard(): Guard {
  try {
    const raw = window.sessionStorage.getItem(RELOAD_GUARD_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Guard>;
      return { n: Number(parsed.n) || 0, t: Number(parsed.t) || 0 };
    }
  } catch {
    // sessionStorage unavailable (private mode / blocked) - fall through.
  }
  return { n: 0, t: 0 };
}

async function clearBrowserCaches(): Promise<void> {
  try {
    if (typeof caches !== "undefined") {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch {
    // Cache API may be unavailable or blocked - best effort only.
  }
}

/**
 * Reloads with a cache-busting query param so the browser fetches fresh HTML
 * (and therefore the current chunk filenames) instead of re-serving the stale
 * cached document that caused the error. A plain reload can keep serving the
 * same cached page, which is what leaves users on a blank screen after a deploy.
 */
function hardReloadBustingCache(): void {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set("_r", Date.now().toString(36));
    window.location.replace(url.toString());
  } catch {
    window.location.reload();
  }
}

/**
 * Recovers from a stale-chunk error by clearing caches and reloading with a
 * cache buster, up to MAX_ATTEMPTS times per tab, so a deploy that changes chunk
 * hashes does not leave the user on a blank page. Note: this can only run once
 * the app's JS has loaded - if the very first bundle is served stale and fails,
 * no recovery code runs and the user must hard-reload or clear the site once.
 */
export function recoverFromChunkLoadError(error: Error): void {
  if (typeof window === "undefined" || !isChunkLoadError(error)) return;

  const now = Date.now();
  const guard = readGuard();
  const attempts = now - guard.t > RESET_AFTER_MS ? 0 : guard.n;
  if (attempts >= MAX_ATTEMPTS) return; // stop looping; let the error UI show.

  try {
    window.sessionStorage.setItem(
      RELOAD_GUARD_KEY,
      JSON.stringify({ n: attempts + 1, t: now } satisfies Guard),
    );
  } catch {
    // If we cannot persist the guard we still reload once; without the guard a
    // loop is still bounded because a successful load never calls this.
  }

  void clearBrowserCaches().finally(hardReloadBustingCache);
}
