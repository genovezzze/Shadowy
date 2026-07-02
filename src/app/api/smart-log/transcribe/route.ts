import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import {
  getClientIp,
  isActionRateLimited,
  recordActionHit,
} from "@/lib/rate-limit";

export const runtime = "nodejs";

const MAX_AUDIO_BYTES = 12 * 1024 * 1024;
const ALLOWED_AUDIO_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/wav",
  "audio/x-wav",
  "audio/webm",
  "video/webm",
]);

const transcriptionSchema = z.object({
  text: z.string().trim().min(1).max(4000),
});

type OpenAIErrorBody = {
  error?: { message?: string };
};

function extensionForType(type: string) {
  if (type.includes("mp4")) return "m4a";
  if (type.includes("wav")) return "wav";
  if (type.includes("mpeg") || type.includes("mp3")) return "mp3";
  return "webm";
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "EMPLOYEE") {
    return NextResponse.json({ error: "Nav atļauts." }, { status: 401 });
  }

  const ip = getClientIp();
  const rateLimitKey = `smart-log-transcribe:${session.userId}`;
  if (await isActionRateLimited(rateLimitKey, ip, 12, 15)) {
    return NextResponse.json(
      { error: "Pārāk daudz pieprasījumu. Lūdzu, mēģini vēlreiz vēlāk." },
      { status: 429 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Neizdevās nolasīt audio ierakstu." },
      { status: 400 }
    );
  }

  const audio = formData.get("audio");
  if (!(audio instanceof File)) {
    return NextResponse.json(
      { error: "Audio ieraksts nav atrasts." },
      { status: 400 }
    );
  }
  if (audio.size === 0 || audio.size > MAX_AUDIO_BYTES) {
    return NextResponse.json(
      { error: "Audio ieraksts ir tukšs vai pārāk liels." },
      { status: 400 }
    );
  }

  const normalizedType = audio.type.split(";")[0].toLowerCase();
  if (!ALLOWED_AUDIO_TYPES.has(normalizedType)) {
    return NextResponse.json(
      { error: "Šis audio formāts netiek atbalstīts." },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Balss ievade vēl nav konfigurēta. Lūdzu, sazinies ar administratoru.",
      },
      { status: 503 }
    );
  }

  await recordActionHit(rateLimitKey, ip, 15);

  const upstreamForm = new FormData();
  upstreamForm.append(
    "file",
    audio,
    `shadowy-voice.${extensionForType(normalizedType)}`
  );
  upstreamForm.append(
    "model",
    process.env.OPENAI_TRANSCRIBE_MODEL ?? "gpt-4o-mini-transcribe"
  );
  upstreamForm.append("language", "lv");
  upstreamForm.append("response_format", "json");
  upstreamForm.append(
    "prompt",
    "Latviešu valodas darba dienas apraksts. Shadowy, kolēģis, vadītājs, neredzamais darbs, papildu uzdevums, ievadīšana darbā."
  );

  try {
    const response = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: upstreamForm,
        signal: AbortSignal.timeout(45_000),
      }
    );

    const body = (await response.json()) as unknown;
    if (!response.ok) {
      const errorBody = body as OpenAIErrorBody;
      console.error("Smart log transcription failed", {
        status: response.status,
        message: errorBody.error?.message,
      });
      if (response.status === 429) {
        return NextResponse.json(
          {
            error:
              "OpenAI API kontam nav pieejamas kvotas. Lūdzu, pārbaudi API norēķinu iestatījumus.",
          },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: "Neizdevās pārvērst balsi tekstā. Lūdzu, mēģini vēlreiz." },
        { status: 502 }
      );
    }

    const parsed = transcriptionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Neizdevās pārvērst balsi tekstā. Lūdzu, mēģini vēlreiz." },
        { status: 502 }
      );
    }

    return NextResponse.json(parsed.data);
  } catch (error) {
    console.error("Smart log transcription request failed", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return NextResponse.json(
      { error: "Neizdevās pārvērst balsi tekstā. Lūdzu, mēģini vēlreiz." },
      { status: 502 }
    );
  }
}
