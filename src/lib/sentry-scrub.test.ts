import { describe, it, expect } from "vitest";
import { scrubEvent, scrubText } from "./sentry-scrub";

// Client names, entry texts and e-mails must never reach Sentry (a US
// processor) through Prisma's verbose error messages.

const PRISMA_ERROR = `Invalid \`prisma.invisibleWorkEntry.create()\` invocation:

{
  data: {
    title: "Zvans SIA Letex par PVN",
    clientName: "SIA Letex",
    description: "Klients atsūtīja izrakstu pa e-pastu janis@letex.lv"
  }
}

Unique constraint failed on the fields: (\`id\`)`;

describe("scrubText", () => {
  it("keeps which query failed and drops the values", () => {
    const out = scrubText(PRISMA_ERROR)!;
    expect(out).toContain("Invalid `prisma.invisibleWorkEntry.create()` invocation");
    expect(out).not.toContain("Letex");
    expect(out).not.toContain("PVN");
  });

  it("masks e-mail addresses anywhere", () => {
    expect(scrubText("send failed for janis@letex.lv")).toBe("send failed for [email]");
  });

  it("leaves ordinary messages alone", () => {
    expect(scrubText("Cannot read properties of undefined")).toBe("Cannot read properties of undefined");
  });
});

describe("scrubEvent", () => {
  it("cleans the exception, the message, breadcrumbs and extra", () => {
    const event = scrubEvent({
      message: PRISMA_ERROR,
      exception: { values: [{ value: PRISMA_ERROR }] },
      breadcrumbs: [
        { message: PRISMA_ERROR },
        { message: "console", data: { arguments: [PRISMA_ERROR, { clientName: "SIA Letex" }] } },
      ],
      extra: { body: "SIA Letex" },
    });
    const json = JSON.stringify(event);
    expect(json).not.toContain("Letex");
    expect(json).toContain("invocation");
    expect(event.extra).toEqual({});
  });
});
