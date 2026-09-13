/**
 * Safety gate for schema-changing Prisma commands (`db push`).
 *
 * The pilot's data lives on a shared Neon database, and a local `.env` has
 * historically pointed straight at it — so a stray `db push` from a laptop can
 * rewrite production. This gate prints the exact host you are about to modify
 * and refuses to touch a protected host unless you confirm it by name.
 *
 * Configure in the environment (never commit real hosts):
 *   PROTECTED_DB_HOST=ep-xxxx.eu-central-1.aws.neon.tech   # the prod host
 *   CONFIRM_DB_PUSH=ep-xxxx.eu-central-1.aws.neon.tech     # set only when you really mean it
 */
function hostOf(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

const host = hostOf(process.env.DATABASE_URL);
const protectedHost = process.env.PROTECTED_DB_HOST?.trim();
const confirmHost = process.env.CONFIRM_DB_PUSH?.trim();

if (!host) {
  console.error("✖ DATABASE_URL is missing or unparseable — refusing to run.");
  process.exit(1);
}

console.log(`→ Target database host: ${host}`);

if (protectedHost && host.includes(protectedHost)) {
  if (confirmHost !== host) {
    console.error(
      `\n✖ Refusing to modify the protected database "${host}".\n` +
        `  This looks like production. Point DATABASE_URL at a dev branch or a\n` +
        `  local Postgres instead. If you truly mean it, re-run with:\n` +
        `    CONFIRM_DB_PUSH="${host}" npm run db:push\n`,
    );
    process.exit(1);
  }
  console.warn(`⚠ Confirmed write to protected host "${host}". Proceeding.`);
}
