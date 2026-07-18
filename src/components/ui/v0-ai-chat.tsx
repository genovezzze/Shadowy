"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  ArrowUpIcon,
  Clock3,
  LoaderCircle,
  Maximize2,
  MessageCircleQuestion,
  Mic,
  Minimize2,
  Shuffle,
  Square,
  Target,
  Zap,
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

const rotatingPrompts = [
  "Kas šodien pārtrauca tavu fokusu?",
  "Kas traucēja pabeigt pamatdarbu?",
  "Vai bija atkārtoti jautājumi?",
  "Vai gaidīji informāciju?",
];

const quickActions = [
  {
    icon: MessageCircleQuestion,
    label: "Pārtrauca ar jautājumiem",
    text: "Kolēģi pārtrauca ar jautājumiem ",
  },
  {
    icon: Clock3,
    label: "Gaidīju informāciju",
    text: "Gaidīju nepieciešamo informāciju ",
  },
  {
    icon: Zap,
    label: "Negaidīts steidzams uzdevums",
    text: "Nācās veikt negaidītu steidzamu uzdevumu ",
  },
  {
    icon: Shuffle,
    label: "Pārslēdzos uz citu uzdevumu",
    text: "Nācās pārslēgties uz citu uzdevumu ",
  },
  {
    icon: Target,
    label: "Nevarēju pabeigt dziļo darbu",
    text: "Nevarēju pabeigt dziļo darbu ",
  },
];

// Isolated so its 60ms timer re-renders don't propagate to the parent.
function TypewriterPlaceholder() {
  const [typedText, setTypedText] = useState("");
  const [cursorOn, setCursorOn] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const charIndexRef = useRef(0);
  const promptIdxRef = useRef(0);

  useEffect(() => {
    function erase() {
      charIndexRef.current--;
      setTypedText(rotatingPrompts[promptIdxRef.current].slice(0, charIndexRef.current));
      if (charIndexRef.current <= 0) {
        promptIdxRef.current = (promptIdxRef.current + 1) % rotatingPrompts.length;
        timerRef.current = setTimeout(tick, 500);
      } else {
        timerRef.current = setTimeout(erase, 38);
      }
    }
    function tick() {
      const current = rotatingPrompts[promptIdxRef.current];
      charIndexRef.current++;
      setTypedText(current.slice(0, charIndexRef.current));
      if (charIndexRef.current >= current.length) {
        timerRef.current = setTimeout(erase, 8000);
      } else {
        timerRef.current = setTimeout(tick, 60);
      }
    }
    timerRef.current = setTimeout(tick, 400);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setCursorOn((v) => !v), 530);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 px-4 py-4 [backface-visibility:hidden] [contain:paint] [transform:translateZ(0)]"
    >
      <span className="font-accent text-lg font-light leading-7 tracking-[0.01em] text-neutral-500">
        {typedText}
        <span
          className={cn(
            "ml-[1px] inline-block h-[1.2em] w-[1.5px] translate-y-[0.1em] bg-neutral-500 transition-opacity duration-75",
            cursorOn ? "opacity-100" : "opacity-0"
          )}
        />
      </span>
    </div>
  );
}

interface QuickButtonsProps {
  disabled?: boolean;
  // eslint-disable-next-line no-unused-vars
  onAction: (text: string) => void;
  scrollable: boolean;
}

// Defined at module level so its identity is stable across parent re-renders.
function QuickButtons({ disabled, onAction, scrollable }: QuickButtonsProps) {
  return (
    <div
      className={cn(
        "flex gap-2",
        scrollable
          ? "overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          : "flex-wrap items-center justify-center"
      )}
    >
      {quickActions.map(({ icon: Icon, label, text }) => (
        <button
          key={label}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onAction(text);
          }}
          disabled={disabled}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5",
            "transition-[background-color,color,border-color] duration-150",
            "border-neutral-200 bg-neutral-50 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800",
            "dark:border-white/10 dark:bg-white/[0.05] dark:text-white/50",
            "dark:hover:bg-white/[0.11] dark:hover:text-white/80 dark:hover:border-white/[0.18]",
            "disabled:pointer-events-none disabled:opacity-50 focus:outline-none"
          )}
        >
          <Icon className="h-3.5 w-3.5 shrink-0" />
          <span className="whitespace-nowrap text-xs font-light tracking-[0.01em]">
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}

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
  const [maxHeight, setMaxHeight] = useState(220);
  const [isExpanded, setIsExpanded] = useState(false);
  const expandedTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    function update() {
      if (window.innerWidth < 640) {
        setMaxHeight(window.innerHeight - 64 - 120);
      } else {
        setMaxHeight(220);
      }
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (isExpanded && expandedTextareaRef.current) {
      const el = expandedTextareaRef.current;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }, [isExpanded]);

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 76,
    maxHeight,
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

  // ── Input box ──────────────────────────────────────────────────────────────
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

      <div className="relative overflow-y-auto">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={4000}
          disabled={disabled || isRecording}
          placeholder=""
          className={cn(
            "min-h-[76px] w-full resize-none border-none bg-transparent px-4 py-4 text-lg leading-7 shadow-none",
            "font-accent font-light tracking-[0.01em]",
            "focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
          )}
          style={{ overflowY: "auto" }}
        />

        {/* Typewriter placeholder */}
        {!value && !isRecording && !isTranscribing && (
          <TypewriterPlaceholder />
        )}

        {/* Expand to full-screen (mobile only) */}
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/50 hover:text-muted-foreground transition-colors sm:hidden"
            aria-label="Paplašināt"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="isolate relative z-10 flex items-center justify-between gap-3 p-3 pt-1 [backface-visibility:hidden] [transform:translateZ(0)]">
        <div className="flex w-[96px] shrink-0 items-center">
          <button
            type="button"
            onClick={isRecording ? onStopRecording : onStartRecording}
            disabled={disabled && !isRecording}
            className={cn(
              "group flex h-9 w-full items-center justify-start gap-2 rounded-lg px-2.5 text-sm transition-colors",
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
            <span className="block w-[56px] whitespace-nowrap text-left text-sm font-light tracking-[0.01em]">
              {isRecording ? "Pabeigt" : "Ierunāt"}
            </span>
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-3">
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

  // ── MOBILE layout ──────────────────────────────────────────────────────────
  if (!compact) {
    return (
      <>
        {/* Full-screen expand overlay (mobile only) */}
        {isExpanded && (
          <div className="fixed inset-0 z-50 flex flex-col bg-background sm:hidden">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <span className="text-xs tabular-nums text-muted-foreground/60">
                {value.length}/4000
              </span>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Samazināt"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            </div>

            <textarea
              ref={expandedTextareaRef}
              value={value}
              onChange={(e) => onValueChange(e.target.value)}
              maxLength={4000}
              disabled={disabled}
              className="flex-1 resize-none bg-transparent px-4 py-2 text-lg leading-7 font-accent font-light tracking-[0.01em] focus:outline-none"
            />

            <div className="flex items-center justify-between px-4 pb-10 pt-3 border-t border-border/30">
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

              <button
                type="button"
                onClick={() => { setIsExpanded(false); onSubmit(); }}
                disabled={!canSubmit}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                  canSubmit
                    ? "bg-white text-black hover:bg-neutral-200"
                    : "bg-neutral-800 text-neutral-500",
                  "disabled:pointer-events-none"
                )}
                aria-label="Izveidot melnraksta ierakstus"
              >
                {isSubmitting ? (
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                ) : (
                  <ArrowUpIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        )}

        <>
        <div
          className="flex sm:hidden flex-col -mx-4 -mt-4 font-accent bg-background"
          style={{ height: "calc(100dvh - 4rem)" }}
        >
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col items-center justify-center px-6 text-center">
            <h1 className="text-balance text-3xl font-bold leading-[1.15] tracking-[0.015em] text-foreground [font-synthesis:weight]">
              Pastāsti, kas šodien aizņēma papildu laiku
            </h1>
            <p className="mt-3 text-sm font-light leading-6 tracking-[0.01em] text-muted-foreground">
              Raksti vai ierunā situāciju saviem vārdiem. Ja darbs bija saistīts ar klientu — piemin klienta nosaukumu un aptuveno laiku.
            </p>
          </div>

          <div className="px-4 pb-5 pt-2 bg-background border-t border-border/30">
            {inputBox}
            <p className="mt-2 text-center text-[11px] text-muted-foreground/50">
              Ieraksts tiks saglabāts tikai pēc tavas apstiprināšanas
            </p>
          </div>
        </div>

        {/* DESKTOP layout */}
        <div
          className={cn(
            "hidden sm:flex mx-auto w-full max-w-4xl flex-col items-center px-6 font-accent",
            "space-y-8"
          )}
        >
          <div className="w-full space-y-4 text-center">
            <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-[0.015em] text-foreground [font-synthesis:weight] lg:text-[42px]">
              Pastāsti, kas šodien aizņēma papildu laiku
            </h1>
            <p className="mx-auto max-w-none text-xl font-light leading-7 tracking-[0.01em] text-muted-foreground">
              Apraksti situāciju saviem vārdiem vai ierunā to. Shadowy izveidos
              melnraksta ierakstus pārskatīšanai
            </p>
          </div>

          <div className="w-full">
            {inputBox}

            <div className="mt-4">
              <QuickButtons scrollable={false} disabled={disabled} onAction={applySuggestion} />
            </div>
            <div className="mt-5 space-y-1 text-center text-sm font-light tracking-[0.01em] text-muted-foreground">
              <p>Ieraksti tiek sagatavoti vienā reizē un saglabāti ar vienu pogu</p>
              <p>Fiksē tikai darba laiku un darba uzdevumus - privātā dzīve netiek analizēta</p>
            </div>
          </div>
        </div>
      </>
    </>
    );
  }

  // ── Compact mode ──────────────────────────────────────────────────────────
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 font-accent sm:px-6 space-y-5">
      <div className="w-full">{inputBox}</div>
    </div>
  );
}
