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

/** Reloads the page once per tab session if this looks like a stale-chunk error. */
export function recoverFromChunkLoadError(error: Error): void {
  if (typeof window === "undefined" || !isChunkLoadError(error)) return;
  if (window.sessionStorage.getItem(RELOAD_GUARD_KEY)) return;
  window.sessionStorage.setItem(RELOAD_GUARD_KEY, "1");
  window.location.reload();
}
