"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Pencil,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VercelV0Chat } from "@/components/ui/v0-ai-chat";
import {
  SMART_LOG_CATEGORIES,
  SMART_LOG_CATEGORY_LABELS,
  type SmartLogCategory,
  type SmartLogDraft,
  smartLogResponseSchema,
} from "@/lib/smart-log";
import {
  saveConfirmedSmartLogTickets,
  type ConfirmedSmartLogTicket,
} from "@/app/employee/smart-log/actions";
import { normalizeClientName } from "@/lib/client-name";

interface ClientOption {
  id: string;
  name: string;
}

type ReviewTicket = SmartLogDraft & {
  id: string;
  workDate: string;
  confirmed: boolean;
  editing: boolean;
  client_id: string | null;
};

const today = new Date().toISOString().slice(0, 10);

function roleLabel(value: boolean | null) {
  if (value === true) return "Ārpus lomas";
  if (value === false) return "Saistīts ar lomu";
  return "Saistība ar lomu nav skaidra";
}

export function SmartWorkLog({
  clients = [],
  preview = false,
}: {
  clients?: ClientOption[];
  preview?: boolean;
}) {
  const [description, setDescription] = useState("");
  const [inputSource, setInputSource] = useState<"text" | "voice">("text");
  const [tickets, setTickets] = useState<ReviewTicket[]>([]);
  const [parsedInput, setParsedInput] = useState("");
  const [parsedSource, setParsedSource] = useState<"text" | "voice">("text");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const [hasParsed, setHasParsed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingLimitRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const confirmedCount = tickets.filter((ticket) => ticket.confirmed).length;
  const hasResults = tickets.length > 0 || hasParsed;

  useEffect(() => {
    return () => {
      if (recordingLimitRef.current) clearTimeout(recordingLimitRef.current);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      const recorder = recorderRef.current;
      if (recorder) {
        recorder.ondataavailable = null;
        recorder.onstop = null;
        if (recorder.state !== "inactive") recorder.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  function stopMediaTracks() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (recordingLimitRef.current) clearTimeout(recordingLimitRef.current);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    recordingLimitRef.current = null;
    recordingTimerRef.current = null;
  }

  async function transcribeAudio(audio: Blob) {
    if (audio.size === 0) {
      setError("Audio ieraksts ir tukšs. Lūdzu, mēģini vēlreiz.");
      return;
    }

    setTranscribing(true);
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData();
      const extension = audio.type.includes("mp4") ? "m4a" : "webm";
      formData.append("audio", audio, `shadowy-voice.${extension}`);

      const response = await fetch("/api/smart-log/transcribe", {
        method: "POST",
        body: formData,
      });
      const body = (await response.json()) as unknown;
      if (!response.ok) {
        const apiError =
          typeof body === "object" &&
          body !== null &&
          "error" in body &&
          typeof body.error === "string"
            ? body.error
            : "Neizdevās pārvērst balsi tekstā. Lūdzu, mēģini vēlreiz.";
        setError(apiError);
        return;
      }

      if (
        typeof body !== "object" ||
        body === null ||
        !("text" in body) ||
        typeof body.text !== "string"
      ) {
        setError("Neizdevās pārvērst balsi tekstā. Lūdzu, mēģini vēlreiz.");
        return;
      }

      setDescription(body.text);
      setInputSource("voice");
      setTickets([]);
      setHasParsed(false);
      setSuccess("Pārbaudi tekstu pirms ierakstu izveides.");
    } catch {
      setError("Neizdevās pārvērst balsi tekstā. Lūdzu, mēģini vēlreiz.");
    } finally {
      setTranscribing(false);
    }
  }

  async function startRecording() {
    setError(null);
    setSuccess(null);

    if (
      typeof window === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      !window.MediaRecorder
    ) {
      if (typeof window !== "undefined" && !window.isSecureContext) {
        setError("Balss ierakstīšana darbojas tikai ar drošu savienojumu (HTTPS).");
      } else {
        setError("Šī pārlūkprogramma neatbalsta balss ierakstīšanu.");
      }
      return;
    }

    // Pre-check permission state so we can give actionable guidance
    try {
      const permStatus = await navigator.permissions.query({ name: "microphone" as PermissionName });
      if (permStatus.state === "denied") {
        setError(
          "Mikrofons ir bloķēts šai vietnei. Noklikšķini uz slēdzenes ikonas adreses joslā → Vietnes iestatījumi → Mikrofons → Atļaut, tad atjauno lapu."
        );
        return;
      }
    } catch {
      // permissions API not supported - fall through to getUserMedia
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: { ideal: 16000 },
        },
      });
      streamRef.current = stream;

      const preferredTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
      ];
      const mimeType = preferredTypes.find((type) =>
        MediaRecorder.isTypeSupported(type)
      );
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      );
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        stopMediaTracks();
        setRecording(false);
        void transcribeAudio(blob);
      };

      recorder.start(1000);
      setRecordingSeconds(0);
      setRecording(true);
      recordingTimerRef.current = setInterval(
        () => setRecordingSeconds((seconds) => seconds + 1),
        1000
      );
      recordingLimitRef.current = setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, 180_000);
    } catch (recordingError) {
      stopMediaTracks();
      setRecording(false);
      if (recordingError instanceof DOMException) {
        if (recordingError.name === "NotAllowedError") {
          setError(
            "Pārlūkprogramma liedza piekļuvi mikrofonam. Noklikšķini uz slēdzenes ikonas adreses joslā → Vietnes iestatījumi → Mikrofons → Atļaut, tad atjauno lapu."
          );
        } else if (recordingError.name === "NotFoundError") {
          setError("Mikrofons nav atrasts. Pārliec, ka ierīcei ir pievienots mikrofons.");
        } else {
          setError("Neizdevās sākt audio ierakstu. Lūdzu, mēģini vēlreiz.");
        }
      } else {
        setError("Neizdevās sākt audio ierakstu. Lūdzu, mēģini vēlreiz.");
      }
    }
  }

  function stopRecording() {
    const recorder = recorderRef.current;
    if (recorder?.state === "recording") recorder.stop();
  }

  function updateTicket(id: string, patch: Partial<ReviewTicket>) {
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === id
          ? {
              ...ticket,
              ...patch,
              confirmed:
                patch.confirmed ?? (patch.editing ? ticket.confirmed : false),
            }
          : ticket
      )
    );
  }

  async function createDrafts() {
    setError(null);
    setSuccess(null);
    setHasParsed(false);

    const cleanDescription = description.trim();
    if (cleanDescription.length < 10) {
      setError("Apraksti situāciju nedaudz detalizētāk.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/smart-log/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanDescription }),
      });
      const body = (await response.json()) as unknown;

      if (!response.ok) {
        const apiError =
          typeof body === "object" &&
          body !== null &&
          "error" in body &&
          typeof body.error === "string"
            ? body.error
            : "Neizdevās izveidot ierakstus. Lūdzu, mēģini vēlreiz.";
        setError(apiError);
        setTickets([]);
        return;
      }

      const parsed = smartLogResponseSchema.safeParse(body);
      if (!parsed.success) {
        setError("Neizdevās izveidot ierakstus. Lūdzu, mēģini vēlreiz.");
        setTickets([]);
        return;
      }

      const clientNameMap = new Map(
        clients.map((c) => [normalizeClientName(c.name), c.id])
      );
      setTickets(
        parsed.data.tickets.map((ticket, index) => ({
          ...ticket,
          id: `${Date.now()}-${index}`,
          workDate: ticket.work_date ?? today,
          confirmed: ticket.estimated_time_minutes !== null,
          editing: false,
          client_id: ticket.client_name
            ? (clientNameMap.get(normalizeClientName(ticket.client_name)) ?? null)
            : null,
        }))
      );
      setParsedInput(cleanDescription);
      setParsedSource(inputSource);
      setHasParsed(true);
    } catch {
      setError("Neizdevās izveidot ierakstus. Lūdzu, mēģini vēlreiz.");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }

  function confirmTicket(ticket: ReviewTicket) {
    if (ticket.estimated_time_minutes === null) {
      updateTicket(ticket.id, { editing: true });
      setError("Pirms iekļaušanas precizē aptuveno laiku.");
      return;
    }
    const newConfirmed = !ticket.confirmed;
    if (newConfirmed && ticket.client_name === null) {
      setError(
        "Ieteicams norādīt klientu/uzņēmumu - tas ļauj analizēt laiku pa klientiem. Vari iekļaut arī bez klienta."
      );
    } else {
      setError(null);
    }
    updateTicket(ticket.id, { confirmed: newConfirmed, editing: false });
  }

  function saveConfirmed() {
    setError(null);
    setSuccess(null);

    const confirmedTickets: ConfirmedSmartLogTicket[] = tickets
      .filter(
        (ticket) =>
          ticket.confirmed && ticket.estimated_time_minutes !== null
      )
      .map((ticket) => ({
        title: ticket.title,
        category: ticket.category,
        description: ticket.description,
        work_date: ticket.work_date,
        client_name: ticket.client_name,
        estimated_time_minutes: ticket.estimated_time_minutes!,
        is_outside_role: ticket.is_outside_role,
        role_relation: ticket.role_relation,
        business_impact: ticket.business_impact,
        confidence_score: ticket.confidence_score,
        workDate: ticket.workDate,
        confirmed: true,
      }));

    if (confirmedTickets.length === 0) {
      setError("Iekļauj vismaz vienu ierakstu.");
      return;
    }

    startSaving(async () => {
      const result = await saveConfirmedSmartLogTickets({
        originalInput: parsedInput,
        source: parsedSource,
        tickets: confirmedTickets,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSuccess("Ieraksti veiksmīgi saglabāti.");
      setTickets([]);
      setDescription("");
      setInputSource("text");
      setParsedInput("");
      setParsedSource("text");
      setHasParsed(false);
    });
  }

  return (
    <div className="space-y-8">
      <section
        className={
          hasResults
            ? "mx-auto w-full max-w-4xl pt-2"
            : preview
              ? "mx-auto flex min-h-[580px] w-full flex-col items-center justify-center"
            : "w-full sm:mx-auto sm:flex sm:min-h-[calc(100vh-4rem)] sm:flex-col sm:items-center sm:justify-center"
        }
      >
        <VercelV0Chat
          value={description}
          onValueChange={(value) => {
            if (description.length === 0 && value.length > 0) {
              setInputSource("text");
            }
            setDescription(value);
          }}
          onSubmit={createDrafts}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          disabled={loading || saving || transcribing}
          isSubmitting={loading}
          isRecording={recording}
          isTranscribing={transcribing}
          recordingSeconds={recordingSeconds}
          compact={hasResults}
        />

        {loading ? (
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Shadowy analizē aprakstu un veido ierakstus...
          </div>
        ) : null}
        {error ? (
          <div className="mt-3 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            {success}
          </div>
        ) : null}
      </section>

      {hasParsed && tickets.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Sparkles className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              Netika atrasti skaidri neredzamā darba ieraksti. Pamēģini
              aprakstīt situāciju konkrētāk.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {tickets.length > 0 ? (
        <section aria-labelledby="smart-log-review-title">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                id="smart-log-review-title"
                className="text-xl font-semibold tracking-tight"
              >
                Pārskati izveidotos ierakstus
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pirms saglabāšanas pārbaudi, vai ieraksti ir pareizi. Tu vari
                tos rediģēt vai dzēst.
              </p>
            </div>
            <Badge variant={confirmedCount > 0 ? "success" : "muted"}>
              Iekļauti {confirmedCount} no {tickets.length}
            </Badge>
          </div>

          <div className="space-y-4">
            {tickets.map((ticket, index) => (
              <Card
                key={ticket.id}
                className={
                  ticket.confirmed
                    ? "border-emerald-500/30 dark:border-emerald-400/25"
                    : undefined
                }
              >
                <CardContent className="p-5 sm:p-6">
                  <div className="mb-5 flex flex-wrap items-center gap-2">
                    <Badge variant="muted">Melnraksts {index + 1}</Badge>
                    {ticket.confirmed ? (
                      <Badge variant="success">
                        <Check className="mr-1 h-3 w-3" />
                        Iekļauts
                      </Badge>
                    ) : null}
                    {ticket.estimated_time_minutes === null ? (
                      <Badge variant="warning">
                        <Clock3 className="mr-1 h-3 w-3" />
                        Nepieciešams precizēt laiku
                      </Badge>
                    ) : null}
                    {ticket.confidence_score < 0.7 ? (
                      <Badge variant="warning">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Nepieciešama pārbaude
                      </Badge>
                    ) : null}
                    {!ticket.client_name ? (
                      <Badge variant="outline" className="border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400">
                        Norādīt klientu
                      </Badge>
                    ) : null}
                  </div>

                  {ticket.editing ? (
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor={`title-${ticket.id}`}>Nosaukums</Label>
                        <Input
                          id={`title-${ticket.id}`}
                          value={ticket.title}
                          maxLength={120}
                          onChange={(event) =>
                            updateTicket(ticket.id, {
                              title: event.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 [&>*]:min-w-0">
                        <div className="col-span-2 sm:col-span-1 grid gap-2">
                          <Label htmlFor={`category-${ticket.id}`}>
                            Kategorija
                          </Label>
                          <select
                            id={`category-${ticket.id}`}
                            value={ticket.category}
                            onChange={(event) =>
                              updateTicket(ticket.id, {
                                category: event.target
                                  .value as SmartLogCategory,
                              })
                            }
                            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                          >
                            {SMART_LOG_CATEGORIES.map((category) => (
                              <option key={category.value} value={category.value}>
                                {category.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`date-${ticket.id}`}>Datums</Label>
                          <Input
                            id={`date-${ticket.id}`}
                            type="date"
                            max={today}
                            value={ticket.workDate}
                            onChange={(event) =>
                              updateTicket(ticket.id, {
                                workDate: event.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`time-${ticket.id}`}>
                            Aptuvenais laiks (min.)
                          </Label>
                          <Input
                            id={`time-${ticket.id}`}
                            type="number"
                            min={1}
                            max={1440}
                            value={ticket.estimated_time_minutes ?? ""}
                            onChange={(event) =>
                              updateTicket(ticket.id, {
                                estimated_time_minutes: event.target.value
                                  ? Number(event.target.value)
                                  : null,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor={`client-${ticket.id}`}>Klients</Label>
                        {clients.length > 0 ? (
                          <>
                            <select
                              id={`client-${ticket.id}`}
                              value={ticket.client_id ?? "__none__"}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "__none__") {
                                  updateTicket(ticket.id, { client_id: null, client_name: null });
                                } else {
                                  const found = clients.find((c) => c.id === val);
                                  updateTicket(ticket.id, {
                                    client_id: val,
                                    client_name: found?.name ?? null,
                                  });
                                }
                              }}
                              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                            >
                              <option value="__none__">Nav klienta</option>
                              {clients.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                            {ticket.client_name && !ticket.client_id && (
                              <p className="text-xs text-amber-500">
                                Atpazīts klients: &ldquo;{ticket.client_name}&rdquo; - nav sarakstā. Izvēlies vai atstāj bez klienta.
                              </p>
                            )}
                          </>
                        ) : (
                          <Input
                            id={`client-${ticket.id}`}
                            value={ticket.client_name ?? ""}
                            maxLength={120}
                            placeholder="Nav norādīts"
                            onChange={(e) =>
                              updateTicket(ticket.id, {
                                client_name: e.target.value || null,
                                client_id: null,
                              })
                            }
                          />
                        )}
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor={`description-${ticket.id}`}>
                          Apraksts
                        </Label>
                        <Textarea
                          id={`description-${ticket.id}`}
                          value={ticket.description}
                          maxLength={2000}
                          onChange={(event) =>
                            updateTicket(ticket.id, {
                              description: event.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor={`role-${ticket.id}`}>
                            Saistība ar lomu
                          </Label>
                          <Input
                            id={`role-${ticket.id}`}
                            value={ticket.role_relation}
                            maxLength={300}
                            onChange={(event) =>
                              updateTicket(ticket.id, {
                                role_relation: event.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`impact-${ticket.id}`}>
                            Ietekme uz darbu
                          </Label>
                          <Input
                            id={`impact-${ticket.id}`}
                            value={ticket.business_impact}
                            maxLength={500}
                            onChange={(event) =>
                              updateTicket(ticket.id, {
                                business_impact: event.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-semibold">{ticket.title}</h3>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                        <span>
                          {SMART_LOG_CATEGORY_LABELS[ticket.category]}
                        </span>
                        <span>
                          {ticket.estimated_time_minutes !== null
                            ? `${ticket.estimated_time_minutes} min.`
                            : "Laiks nav norādīts"}
                        </span>
                        <span>{roleLabel(ticket.is_outside_role)}</span>
                        {ticket.client_name ? (
                          <span>Klients: {ticket.client_name}</span>
                        ) : null}
                        <span>
                          Pārliecības līmenis{" "}
                          {Math.round(ticket.confidence_score * 100)}%
                        </span>
                      </div>
                      <p className="mt-4 text-sm leading-6">
                        {ticket.description}
                      </p>
                      {ticket.business_impact ? (
                        <div className="mt-4 rounded-lg bg-muted/50 px-4 py-3">
                          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Ietekme uz darbu
                          </div>
                          <p className="mt-1 text-sm leading-6">
                            {ticket.business_impact}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-border pt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        updateTicket(ticket.id, {
                          editing: !ticket.editing,
                        })
                      }
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      {ticket.editing ? "Pabeigt rediģēšanu" : "Rediģēt"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() =>
                        setTickets((current) =>
                          current.filter((item) => item.id !== ticket.id)
                        )
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Dzēst
                    </Button>
                    <Button
                      type="button"
                      variant={ticket.confirmed ? "success" : "outline"}
                      size="sm"
                      onClick={() => confirmTicket(ticket)}
                    >
                      {ticket.confirmed ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Iekļauts
                        </>
                      ) : (
                        "Iekļaut"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span>
                Ar vienu pogu tiks saglabāti visi iekļautie ieraksti.
              </span>
            </div>
            <Button
              type="button"
              onClick={saveConfirmed}
              disabled={saving || confirmedCount === 0}
            >
              {saving ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving
                ? "Saglabā ierakstus..."
                : "Saglabāt visus iekļautos ierakstus"}
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
