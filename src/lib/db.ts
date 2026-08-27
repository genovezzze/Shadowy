import { Prisma, PrismaClient } from "@prisma/client";

/**
 * Neon suspends the compute instance after a few minutes of inactivity. The
 * first query afterwards has to wait for it to wake up and can exceed Prisma's
 * connect timeout, which surfaces as "Can't reach database server" — on the
 * very first request of the day, in the middle of the session check.
 *
 * These are connection-level failures, so the query never reached the server
 * and repeating it is safe.
 */
const RETRYABLE_BEFORE_EXECUTION = new Set([
  "P1001", // can't reach database server
  "P1002", // server reached but timed out
  "P1008", // operation timed out
  "P2024", // timed out fetching a connection from the pool
]);

/** Raised when an idle connection was closed underneath us. */
const CONNECTION_CLOSED = "P1017";

const READ_OPERATIONS = new Set([
  "findUnique",
  "findUniqueOrThrow",
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "count",
  "aggregate",
  "groupBy",
]);

const RETRY_DELAYS_MS = [300, 900, 2000];

function errorCode(error: unknown): string | undefined {
  if (error instanceof Prisma.PrismaClientInitializationError) return error.errorCode;
  if (error instanceof Prisma.PrismaClientKnownRequestError) return error.code;
  return undefined;
}

/** Connection failures that callers may safely turn into a temporary-service
 * response. Authentication must fail closed when this returns true. */
export function isDatabaseUnavailableError(error: unknown): boolean {
  const code = errorCode(error);
  return (
    error instanceof Prisma.PrismaClientInitializationError ||
    (code !== undefined &&
      (RETRYABLE_BEFORE_EXECUTION.has(code) || code === CONNECTION_CLOSED))
  );
}

function isRetryable(error: unknown, operation: string): boolean {
  const code = errorCode(error);
  if (!code) {
    // Initialization failures do not always carry a code, but by definition
    // nothing was executed yet.
    return error instanceof Prisma.PrismaClientInitializationError;
  }
  if (RETRYABLE_BEFORE_EXECUTION.has(code)) return true;
  // A dropped connection can happen mid-flight, so only reads are repeated —
  // a write might already have been applied.
  return code === CONNECTION_CLOSED && READ_OPERATIONS.has(operation);
}

function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  return client.$extends({
    query: {
      async $allOperations({ args, query, operation }) {
        let lastError: unknown;

        for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
          try {
            return await query(args);
          } catch (error) {
            if (!isRetryable(error, operation)) throw error;
            lastError = error;
            if (attempt === RETRY_DELAYS_MS.length) break;
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
          }
        }

        throw lastError;
      },
    },
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
