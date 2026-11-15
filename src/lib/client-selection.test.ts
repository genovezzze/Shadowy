import { describe, expect, it } from "vitest";
import { resolveClientSelection } from "./client-name";

const clients = [
  { id: "c1", name: "SIA Baltija", aliases: [] },
  { id: "c2", name: "Ventspils Kērlinga Klubs", aliases: [{ normalized: "vkk" }] },
];

describe("resolveClientSelection", () => {
  it("attaches an explicit pick from the firm's own list", () => {
    expect(resolveClientSelection({ clientId: "c1", clientName: "whatever" }, clients)).toEqual({
      ok: true,
      clientId: "c1",
      clientName: "SIA Baltija",
    });
  });

  it("rejects a client id from outside the firm (tenant isolation)", () => {
    expect(resolveClientSelection({ clientId: "other-org-client" }, clients).ok).toBe(false);
  });

  it("resolves names and aliases to the registered client", () => {
    expect(resolveClientSelection({ clientName: "Baltija" }, clients)).toMatchObject({ ok: true, clientId: "c1" });
    expect(resolveClientSelection({ clientName: "VKK" }, clients)).toMatchObject({
      ok: true,
      clientId: "c2",
      clientName: "Ventspils Kērlinga Klubs",
    });
  });

  it("refuses a misheard name that is not on the list", () => {
    expect(resolveClientSelection({ clientName: "SIA Balta" }, clients)).toEqual({
      ok: false,
      unknownName: "SIA Balta",
    });
  });

  it("allows no client at all", () => {
    expect(resolveClientSelection({ clientName: null }, clients)).toEqual({
      ok: true,
      clientId: null,
      clientName: null,
    });
  });

  it("keeps free-typed names when the firm has no client list yet", () => {
    expect(resolveClientSelection({ clientName: "SIA Balta" }, [])).toEqual({
      ok: true,
      clientId: null,
      clientName: "SIA Balta",
    });
  });
});
