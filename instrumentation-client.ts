import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  ignoreErrors: [
    // Microsoft's link scanner (Outlook / Exchange Safe Links) opens links
    // from e-mails in a headless browser and its own injected script fails
    // with this. Not our code and no real visitor is affected.
    /Object Not Found Matching Id:\d+, MethodName:\w+, ParamCount:\d+/,
  ],
});

export const onRouterTransitionStart =
  Sentry.captureRouterTransitionStart;
