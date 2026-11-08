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
  LoaderCircle,
  Maximize2,
  Mic,
  Minimize2,
  Square,
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
  "Kuram klientam šodien strādāji?",
  "Ko sagatavoji vai nosūtīji klientam?",
  "Kādus klientu jautājumus atrisināji?",
  "Cik ilgi tas aizņēma?",
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
      className="pointer-events-none absolute inset-0 px-5 py-4 [backface-visibility:hidden] [contain:paint] [transform:translateZ(0)]"
    >
      <span className="text-[16px] leading-7 text-muted-foreground">
        {typedText}
        <span
          className={cn(
            "ml-[1px] inline-block h-[1.2em] w-[1.5px] translate-y-[0.1em] bg-muted-foreground transition-opacity duration-75",
            cursorOn ? "opacity-100" : "opacity-0"
          )}
        />
      </span>
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
  /** The worker's clients, offered as one-tap chips that name the client in the text. */
  clients?: { id: string; name: string }[];
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
  clients = [],
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

  function insertClient(name: string) {
    const lead = `Klientam ${name}: `;
    const nextValue = value.trim() ? `${value.trim()}\n${lead}` : lead;
    onValueChange(nextValue);
    requestAnimationFrame(() => {
      adjustHeight();
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    });
  }

  // ── Input box ──────────────────────────────────────────────────────────────
  const inputBox = (
    <div className="relative overflow-hidden rounded-[22px] border border-black/[0.08] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-colors focus-within:border-black/[0.16] dark:border-white/[0.08] dark:bg-card dark:shadow-none dark:focus-within:border-white/[0.16]">
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
          data-slot="composer"
          ref={textareaRef}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={4000}
          disabled={disabled || isRecording}
          placeholder=""
          className={cn(
            "min-h-[76px] w-full resize-none rounded-none border-none bg-transparent px-5 py-4 text-[16px] leading-7 shadow-none",
            // The base Textarea paints its own dark fill; the composer card provides it.
            "dark:border-none dark:bg-transparent",
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

      <div className="isolate relative z-10 flex items-center justify-between gap-3 px-3 pb-3 pt-1 [backface-visibility:hidden] [transform:translateZ(0)]">
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={isRecording ? onStopRecording : onStartRecording}
            disabled={disabled && !isRecording}
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-full px-3 text-[14px] text-muted-foreground transition-colors hover:bg-black/[0.04] hover:text-foreground dark:hover:bg-white/[0.06]",
              "disabled:pointer-events-none disabled:opacity-50",
              isRecording && "bg-red-500/10 text-red-500 hover:bg-red-500/15 hover:text-red-500"
            )}
            aria-label={isRecording ? "Pabeigt ierakstu" : "Ierunāt aprakstu"}
          >
            {isRecording ? (
              <Square className="h-4 w-4 fill-current" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
            <span className="whitespace-nowrap">
              {isRecording ? "Pabeigt" : "Ierunāt"}
            </span>
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="text-[12px] tabular-nums text-muted-foreground">
            {value.length}/4000
          </span>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
              canSubmit
                ? "bg-[#007AFF] text-white hover:bg-[#0062CC] dark:bg-[#0A84FF] dark:hover:bg-[#0A74E0]"
                : "bg-black/[0.05] text-muted-foreground dark:bg-white/[0.08]",
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

  // ── Full layout (phone and desktop) ──────────────────────────────────────
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
              className="flex-1 resize-none bg-transparent px-4 py-2 text-[16px] leading-7 focus:outline-none"
            />

            <div className="flex items-center justify-between px-4 pb-10 pt-3 border-t border-border/30">
              <button
                type="button"
                onClick={isRecording ? onStopRecording : onStartRecording}
                disabled={disabled && !isRecording}
                className={cn(
                  "flex h-9 items-center gap-1.5 rounded-full px-3 text-[14px] text-muted-foreground transition-colors hover:bg-black/[0.04] hover:text-foreground dark:hover:bg-white/[0.06]",
                  "disabled:pointer-events-none disabled:opacity-50",
                  isRecording && "bg-red-500/10 text-red-500 hover:bg-red-500/15 hover:text-red-500"
                )}
              >
                {isRecording ? (
                  <Square className="h-4 w-4 fill-current" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
                <span>
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
                    ? "bg-[#007AFF] text-white hover:bg-[#0062CC] dark:bg-[#0A84FF] dark:hover:bg-[#0A74E0]"
                    : "bg-black/[0.05] text-muted-foreground dark:bg-white/[0.08]",
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

        <div className="relative mx-auto flex min-h-[calc(100dvh-8rem)] w-full max-w-5xl flex-col sm:min-h-0">
          {/* Soft light behind the heading, dark theme only */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 hidden h-72 w-[36rem] -translate-x-1/2 rounded-full bg-[#0A84FF]/[0.08] blur-3xl dark:block"
          />
          <div className="relative mx-auto w-full max-w-2xl pt-4 text-center sm:pt-0">
            <h1 className="text-balance font-display text-[28px] font-medium leading-[1.15] text-foreground sm:whitespace-nowrap sm:text-[40px]">
              Pieraksti šodienas darbu
            </h1>
            <p className="mx-auto mt-3 text-balance text-[15px] leading-7 text-muted-foreground sm:text-[17px] sm:whitespace-nowrap">
              Apraksti paveikto darbu ar klientu saviem vārdiem vai ierunā to
            </p>
          </div>

          <div className="relative mx-auto mt-auto w-full max-w-2xl pb-4 pt-8 sm:mt-10 sm:pb-0 sm:pt-0">
            {inputBox}

            {clients.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 px-1 text-[13px] text-muted-foreground">Tavi klienti</div>
                <div className="flex flex-wrap gap-1.5">
                  {clients.slice(0, 8).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        insertClient(c.name);
                      }}
                      disabled={disabled}
                      className="h-8 max-w-[220px] truncate rounded-full bg-black/[0.04] px-3.5 text-[13px] font-medium text-foreground/85 transition-colors hover:bg-black/[0.07] hover:text-foreground disabled:opacity-50 dark:bg-white/[0.06] dark:hover:bg-white/[0.1]"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
    </>
    );
  }

  // ── Compact mode ──────────────────────────────────────────────────────────
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 sm:px-6 space-y-5">
      <div className="w-full">{inputBox}</div>
    </div>
  );
}
