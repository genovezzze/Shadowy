// Where the smart log's AI calls go. AI_PROVIDER=azure sends text parsing and
// voice transcription to our Azure OpenAI resource in Sweden Central (regional
// "Standard" deployments, so prompts and audio are processed in the EU).
// Anything else, or a missing Azure setting, keeps the original OpenAI API.
// There is deliberately no automatic fallback from Azure to OpenAI: that would
// quietly move customer data out of the EU.

export type AiProvider = "azure" | "openai";

type Env = Record<string, string | undefined>;

export function aiProvider(env: Env = process.env): AiProvider {
  return env.AI_PROVIDER?.trim().toLowerCase() === "azure" ? "azure" : "openai";
}

function azureBase(env: Env) {
  const endpoint = env.AZURE_OPENAI_ENDPOINT?.trim().replace(/\/+$/, "");
  const apiKey = env.AZURE_OPENAI_API_KEY?.trim();
  return endpoint && apiKey ? { endpoint, apiKey } : null;
}

export type AiRequestTarget = {
  url: string;
  headers: Record<string, string>;
  /** Model name for OpenAI, deployment name for Azure. */
  model: string;
};

/** Target for the Responses API (structured smart-log parsing). */
export function responsesTarget(env: Env = process.env): AiRequestTarget | null {
  if (aiProvider(env) === "azure") {
    const base = azureBase(env);
    const deployment = env.AZURE_OPENAI_PARSE_DEPLOYMENT?.trim();
    if (!base || !deployment) return null;
    return {
      url: `${base.endpoint}/openai/v1/responses`,
      headers: { "api-key": base.apiKey },
      model: deployment,
    };
  }
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return {
    url: "https://api.openai.com/v1/responses",
    headers: { Authorization: `Bearer ${apiKey}` },
    model: env.OPENAI_MODEL ?? "gpt-5.4-mini",
  };
}

// Whisper takes its prompt as a style and vocabulary hint in the spoken
// language; an English prompt can nudge it towards translating.
const LATVIAN_TRANSCRIBE_PROMPT =
  "Grāmatvedes darba ieraksts: iegrāmatoju čekus un rēķinus, PVN deklarācija, VID, algas aprēķins, avansa norēķini, bankas izraksti, SIA klients, sazināšanās ar klientu, palīdzēju kolēģei.";

const OPENAI_TRANSCRIBE_PROMPT =
  "Audio is in Latvian. It is an employee describing their work for Shadowy: bookkeeping and posting entries, scanning and archiving documents, invoicing, payments, payroll, checks and reconciliation, client communication, and also extra work such as helping colleagues, urgent tasks or work outside their role. Transcribe clearly in Latvian. Do not translate.";

/** Target and extra form fields for audio transcription. */
export function transcriptionTarget(
  env: Env = process.env,
): (AiRequestTarget & { prompt: string; sendModel: boolean }) | null {
  if (aiProvider(env) === "azure") {
    const base = azureBase(env);
    const deployment = env.AZURE_OPENAI_TRANSCRIBE_DEPLOYMENT?.trim();
    if (!base || !deployment) return null;
    return {
      url: `${base.endpoint}/openai/deployments/${encodeURIComponent(deployment)}/audio/transcriptions?api-version=2024-06-01`,
      headers: { "api-key": base.apiKey },
      model: deployment,
      prompt: LATVIAN_TRANSCRIBE_PROMPT,
      // The deployment in the URL already names the model.
      sendModel: false,
    };
  }
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return {
    url: "https://api.openai.com/v1/audio/transcriptions",
    headers: { Authorization: `Bearer ${apiKey}` },
    model: env.OPENAI_TRANSCRIBE_MODEL ?? "gpt-4o-transcribe",
    prompt: OPENAI_TRANSCRIBE_PROMPT,
    sendModel: true,
  };
}
