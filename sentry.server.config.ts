import * as Sentry from "@sentry/nextjs";
import { scrubEvent } from "./src/lib/sentry-scrub";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  enabled: !!process.env.SENTRY_DSN,
  // Prisma errors print the failed query with its values (client names, entry
  // texts); strip them before anything leaves for Sentry.
  beforeSend: (event) => scrubEvent(event),
  beforeBreadcrumb: (crumb) => scrubEvent({ breadcrumbs: [crumb] }).breadcrumbs![0],
});
