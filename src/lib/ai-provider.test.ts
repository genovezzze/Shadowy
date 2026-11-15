import { describe, expect, it } from "vitest";
import { aiProvider, responsesTarget, transcriptionTarget } from "./ai-provider";

const azure = {
  AI_PROVIDER: "azure",
  AZURE_OPENAI_ENDPOINT: "https://shadowy-openai.openai.azure.com/",
  AZURE_OPENAI_API_KEY: "az-key",
  AZURE_OPENAI_PARSE_DEPLOYMENT: "shadowy-parse",
  AZURE_OPENAI_TRANSCRIBE_DEPLOYMENT: "shadowy-transcribe",
  OPENAI_API_KEY: "oa-key",
};

describe("aiProvider", () => {
  it("defaults to OpenAI and only switches on an explicit azure", () => {
    expect(aiProvider({})).toBe("openai");
    expect(aiProvider({ AI_PROVIDER: "Azure " })).toBe("azure");
    expect(aiProvider({ AI_PROVIDER: "something" })).toBe("openai");
  });
});

describe("responsesTarget", () => {
  it("uses the OpenAI API with a bearer key by default", () => {
    const t = responsesTarget({ OPENAI_API_KEY: "oa-key" });
    expect(t?.url).toBe("https://api.openai.com/v1/responses");
    expect(t?.headers).toEqual({ Authorization: "Bearer oa-key" });
    expect(t?.model).toBe("gpt-5.4-mini");
  });

  it("uses the Azure v1 endpoint, api-key header and deployment name", () => {
    const t = responsesTarget(azure);
    expect(t?.url).toBe("https://shadowy-openai.openai.azure.com/openai/v1/responses");
    expect(t?.headers).toEqual({ "api-key": "az-key" });
    expect(t?.model).toBe("shadowy-parse");
  });

  it("never falls back to OpenAI when Azure is chosen but incomplete", () => {
    expect(responsesTarget({ ...azure, AZURE_OPENAI_API_KEY: "" })).toBeNull();
    expect(responsesTarget({ ...azure, AZURE_OPENAI_PARSE_DEPLOYMENT: undefined })).toBeNull();
  });
});

describe("transcriptionTarget", () => {
  it("sends the model and the English hint to OpenAI", () => {
    const t = transcriptionTarget({ OPENAI_API_KEY: "oa-key" });
    expect(t?.url).toBe("https://api.openai.com/v1/audio/transcriptions");
    expect(t?.sendModel).toBe(true);
    expect(t?.model).toBe("gpt-4o-transcribe");
  });

  it("addresses the Azure deployment in the URL with a Latvian hint", () => {
    const t = transcriptionTarget(azure);
    expect(t?.url).toBe(
      "https://shadowy-openai.openai.azure.com/openai/deployments/shadowy-transcribe/audio/transcriptions?api-version=2024-06-01",
    );
    expect(t?.headers).toEqual({ "api-key": "az-key" });
    expect(t?.sendModel).toBe(false);
    expect(t?.prompt).toMatch(/PVN/);
  });

  it("never falls back to OpenAI when Azure is chosen but incomplete", () => {
    expect(transcriptionTarget({ ...azure, AZURE_OPENAI_ENDPOINT: undefined })).toBeNull();
  });
});
