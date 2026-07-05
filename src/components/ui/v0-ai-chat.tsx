"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type KeyboardEvent,
} from "react";
import {
  ArrowUpIcon,
  Clock3,
  HandHelping,
  LoaderCircle,
  Mic,
  MessageCircleQuestion,
  Square,
  UserPlus,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      textarea.style.height = `${minHeight}px`;
      if (reset) return;

      textarea.style.height = `${Math.max(
        minHeight,
        Math.min(
          textarea.scrollHeight,
          maxHeight ?? Number.POSITIVE_INFINITY
        )
      )}px`;
    },
    [maxHeight, minHeight]
  );

  useEffect(() => {
    adjustHeight();
  }, [adjustHeight]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

const suggestions = [
  {
    icon: HandHelping,
    label: "Palīdzēju kolēģim",
    text: "Šodien palīdzēju kolēģim ",
  },
  {
    icon: UserPlus,
    label: "Ievadīju darbinieku",
    text: "Šodien palīdzēju jaunam darbiniekam ",
  },
  {
    icon: Clock3,
    label: "Gaidīju informāciju",
    text: "Šodien gaidīju darbam nepieciešamo informāciju ",
  },
  {
    icon: MessageCircleQuestion,
    label: "Atbildēju uz jautājumiem",
    text: "Šodien atbildēju uz kolēģu jautājumiem ",
  },
];

interface VercelV0ChatProps {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  disabled?: boolean;
  isSubmitting?: boolean;
  isRecording?: boolean;
  isTranscribing?: boolean;
  recordingSeconds?: number;
  compact?: boolean;
}

export function VercelV0Chat({
  value,
  onValueChange,
  onSubmit,
  onStartRecording,
  onStopRecording,
  disabled = false,
  isSubmitting = false,
  isRecording = false,
  isTranscribing = false,
  recordingSeconds = 0,
  compact = false,
}: VercelV0ChatProps) {
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 76,
    maxHeight: 220,
  });
  const canSubmit = value.trim().length >= 10 && !disabled;

  useEffect(() => {
    adjustHeight();
  }, [adjustHeight, value]);

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (canSubmit) onSubmit();
    }
  }

  function applySuggestion(text: string) {
    const nextValue = value.trim() ? `${value.trim()} ${text}` : text;
    onValueChange(nextValue);
    requestAnimationFrame(() => {
      adjustHeight();
      textareaRef.current?.focus();
    });
  }

  // ── Input box (shared between mobile and desktop) ──────────────────────────
  const inputBox = (
    <div className="relative rounded-2xl border border-neutral-200 bg-neutral-50 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      {isRecording ? (
        <div className="mx-3 mt-3 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-500">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          Notiek ieraksts
          <span className="tabular-nums">
            {Math.floor(recordingSeconds / 60)}:
            {String(recordingSeconds % 60).padStart(2, "0")}
          </span>
        </div>
      ) : null}

      {isTranscribing ? (
        <div className="mx-3 mt-3 flex items-center gap-2 rounded-xl border border-border bg-background/50 px-3 py-2 text-sm text-muted-foreground">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Shadowy pārvērš balsi tekstā...
        </div>
      ) : null}

      <div className="overflow-y-auto">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={4000}
          disabled={disabled || isRecording}
          placeholder="Apraksti, kas šodien notika..."
          className={cn(
            "min-h-[76px] w-full resize-none border-none bg-transparent px-4 py-4 text-lg leading-7 shadow-none",
            "font-accent font-light tracking-[0.01em]",
            "focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
            "placeholder:text-neutral-500"
          )}
          style={{ overflow: "hidden" }}
        />
      </div>

      <div className="flex items-center justify-between gap-3 p-3 pt-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={isRecording ? onStopRecording : onStartRecording}
            disabled={disabled && !isRecording}
            className={cn(
              "group flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm transition-colors",
              "hover:bg-neutral-200 disabled:pointer-events-none disabled:opacity-50",
              "dark:hover:bg-neutral-800",
              isRecording && "bg-red-500/10 text-red-500"
            )}
            aria-label={isRecording ? "Pabeigt ierakstu" : "Ierunāt aprakstu"}
          >
            {isRecording ? (
              <Square className="h-4 w-4 fill-current" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
            <span className="text-sm font-light tracking-[0.01em]">
              {isRecording ? "Pabeigt" : "Ierunāt"}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm tabular-nums text-muted-foreground">
            {value.length}/4000
          </span>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg border transition-colors",
              canSubmit
                ? "border-white bg-white text-black hover:bg-neutral-200"
                : "border-neutral-300 text-neutral-400 dark:border-neutral-700 dark:text-neutral-500",
              "disabled:pointer-events-none"
            )}
            aria-label="Izveidot melnraksta ierakstus"
          >
            {isSubmitting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUpIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // ── MOBILE layout (hidden on sm+) ──────────────────────────────────────────
  if (!compact) {
    return (
      <>
        {/* MOBILE: full-screen ChatGPT-style — escape parent container padding */}
        <div
          className="flex sm:hidden flex-col -mx-4 -mt-4 font-accent bg-background"
          style={{ height: "calc(100dvh - 4rem)" }}
        >
          {/* Heading */}
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <h1 className="text-balance text-3xl font-bold leading-[1.15] tracking-[0.015em] text-foreground [font-synthesis:weight]">
              Pastāsti, kas šodien aizņēma papildu laiku
            </h1>
            <p className="mt-3 text-sm font-light leading-6 tracking-[0.01em] text-muted-foreground">
              Apraksti situāciju saviem vārdiem vai ierunā to. Shadowy izveidos melnraksta ierakstus pārskatīšanai
            </p>
          </div>

          {/* Input pinned to bottom */}
          <div className="px-4 pb-5 pt-2 bg-background border-t border-border/30">
            {inputBox}
            <p className="mt-2 text-center text-[11px] text-muted-foreground/50">
              Ieraksts tiks saglabāts tikai pēc tavas apstiprināšanas
            </p>
          </div>
        </div>

        {/* DESKTOP: current centered layout */}
        <div
          className={cn(
            "hidden sm:flex mx-auto w-full max-w-4xl flex-col items-center px-6 font-accent",
            "space-y-8"
          )}
        >
          <div className="w-full text-center">
            <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-[0.015em] text-foreground [font-synthesis:weight] lg:text-[42px]">
              Pastāsti, kas šodien aizņēma papildu laiku
            </h1>
            <p className="mx-auto mt-4 max-w-none text-xl font-light leading-7 tracking-[0.01em] text-muted-foreground">
              Apraksti situāciju saviem vārdiem vai ierunā to. Shadowy izveidos
              melnraksta ierakstus pārskatīšanai
            </p>
          </div>

          <div className="w-full">
            {inputBox}

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {suggestions.map(({ icon: Icon, label, text }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => applySuggestion(text)}
                  disabled={disabled}
                  className="flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-foreground disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-light tracking-[0.01em]">{label}</span>
                </button>
              ))}
            </div>
            <div className="mt-5 space-y-1 text-center text-sm font-light tracking-[0.01em] text-muted-foreground">
              <p>Ieraksti tiek sagatavoti vienā reizē un saglabāti ar vienu pogu</p>
              <p>Fiksē tikai darba laiku un darba uzdevumus - privātā dzīve netiek analizēta</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Compact mode (when results are showing) — same on all screens ──────────
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 font-accent sm:px-6 space-y-5">
      <div className="w-full">{inputBox}</div>
    </div>
  );
}
