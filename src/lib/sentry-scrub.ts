/**
 * Keeps client data out of Sentry (a US processor). Prisma's error messages
 * print the whole failed query, values included - client names, entry texts,
 * e-mails - after the line "Invalid `prisma.x.y()` invocation". Only that first
 * line is kept: it says which query failed, which is all debugging needs.
 *
 * Pure and dependency-free so it can run in the server, edge and test runtimes.
 */

const PRISMA_INVOCATION = /(Invalid `[^`]*` invocation)[\s\S]*/;
const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

export function scrubText(text: string | undefined | null): string | undefined {
  if (text == null) return undefined;
  return text.replace(PRISMA_INVOCATION, "$1 [query details removed]").replace(EMAIL, "[email]");
}

type Scrubbable = {
  message?: string;
  exception?: { values?: { value?: string }[] };
  breadcrumbs?: { message?: string; data?: Record<string, unknown> }[];
  extra?: Record<string, unknown>;
};

/** Sentry `beforeSend`: scrub messages, exception values and breadcrumbs. */
export function scrubEvent<T extends Scrubbable>(event: T): T {
  if (event.message) event.message = scrubText(event.message);
  for (const ex of event.exception?.values ?? []) {
    if (ex.value) ex.value = scrubText(ex.value);
  }
  for (const crumb of event.breadcrumbs ?? []) {
    if (crumb.message) crumb.message = scrubText(crumb.message);
    // Console breadcrumbs carry the logged arguments too.
    if (crumb.data && Array.isArray(crumb.data.arguments)) {
      crumb.data.arguments = (crumb.data.arguments as unknown[]).map((arg) =>
        typeof arg === "string" ? scrubText(arg) : "[removed]",
      );
    }
  }
  // Extra context is free-form; drop it rather than guess what is inside.
  if (event.extra) event.extra = {};
  return event;
}
