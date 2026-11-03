"use client";

import * as React from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Native <input type="date"> renders in the viewer's OS/browser locale, so an
// en-US machine shows MM/DD/YYYY with Sunday first. This field always shows
// dd.mm.yyyy with a Monday-first Latvian calendar, while the submitted value
// stays ISO yyyy-mm-dd (via a hidden input) so forms and the server don't change.

const MONTHS = [
  "Janvāris", "Februāris", "Marts", "Aprīlis", "Maijs", "Jūnijs",
  "Jūlijs", "Augusts", "Septembris", "Oktobris", "Novembris", "Decembris",
];
const WEEKDAYS = ["P", "O", "T", "C", "Pk", "S", "Sv"];

const pad = (n: number) => String(n).padStart(2, "0");
const toIso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

/** Today's date in the viewer's local time zone, as yyyy-mm-dd. */
export function localToday() {
  const now = new Date();
  return toIso(now.getFullYear(), now.getMonth(), now.getDate());
}

function isoToDisplay(iso: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : "";
}

/** Accepts d.m.yyyy, dd.mm.yy, with . / - or space separators. */
function parseDisplay(text: string): string | null {
  const m = /^\s*(\d{1,2})[./\-\s](\d{1,2})[./\-\s](\d{2}|\d{4})\s*$/.exec(text);
  if (!m) return null;
  const d = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
  const date = new Date(y, mo, d);
  if (date.getFullYear() !== y || date.getMonth() !== mo || date.getDate() !== d) return null;
  return toIso(y, mo, d);
}

export interface DateInputProps {
  id?: string;
  name?: string;
  /** Controlled value, yyyy-mm-dd or "". */
  value?: string;
  /** Uncontrolled initial value, yyyy-mm-dd or "". Restored on form reset. */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Latest selectable date, yyyy-mm-dd. */
  max?: string;
  min?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function DateInput({
  id,
  name,
  value: controlled,
  defaultValue = "",
  onChange,
  max,
  min,
  required,
  disabled,
  className,
}: DateInputProps) {
  const [internal, setInternal] = React.useState(defaultValue);
  const value = controlled ?? internal;
  const [text, setText] = React.useState(isoToDisplay(value));
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const textRef = React.useRef<HTMLInputElement>(null);

  const initialView = () => {
    const base = value || (max && max < localToday() ? max : localToday());
    return { y: Number(base.slice(0, 4)), m: Number(base.slice(5, 7)) - 1 };
  };
  const [view, setView] = React.useState(initialView);

  // Keep the typed text in sync when the value changes from outside.
  React.useEffect(() => {
    setText(isoToDisplay(value));
  }, [value]);

  function commit(next: string) {
    if (controlled === undefined) setInternal(next);
    setText(isoToDisplay(next));
    onChange?.(next);
  }

  const outOfRange = (iso: string) => (max && iso > max) || (min && iso < min);

  // form.reset() doesn't touch React state, so restore the default ourselves.
  React.useEffect(() => {
    const form = containerRef.current?.closest("form");
    if (!form || controlled !== undefined) return;
    const onReset = () => {
      setInternal(defaultValue);
      setText(isoToDisplay(defaultValue));
    };
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, [controlled, defaultValue]);

  React.useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  function handleTextCommit() {
    if (!text.trim()) {
      if (value) commit("");
      return;
    }
    const parsed = parseDisplay(text);
    if (parsed && !outOfRange(parsed)) commit(parsed);
    else setText(isoToDisplay(value));
  }

  function toggle() {
    if (!open) setView(initialView());
    setOpen((o) => !o);
  }

  function shiftMonth(delta: number) {
    setView(({ y, m }) => {
      const d = new Date(y, m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  }

  // Monday-first grid: getDay() is 0 for Sunday, so shift by 6.
  const firstWeekday = (new Date(view.y, view.m, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const today = localToday();
  const nextMonth = new Date(view.y, view.m + 1, 1);
  const nextDisabled = !!max && toIso(nextMonth.getFullYear(), nextMonth.getMonth(), 1) > max;
  const prevDisabled = !!min && toIso(view.y, view.m, 1) <= min;

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={textRef}
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="dd.mm.gggg"
        required={required}
        disabled={disabled}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleTextCommit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleTextCommit();
          } else if (e.key === "ArrowDown" && e.altKey) {
            e.preventDefault();
            toggle();
          }
        }}
        data-slot="field"
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 pr-10 text-sm tabular-nums placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 transition-shadow shadow-sm",
          "dark:border-white/[0.08] dark:bg-white/[0.03] dark:ring-offset-transparent dark:focus-visible:border-white/20 dark:focus-visible:ring-white/20",
          className,
          "pr-10"
        )}
      />
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <button
        type="button"
        aria-label="Atvērt kalendāru"
        aria-expanded={open}
        disabled={disabled}
        onClick={toggle}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none"
      >
        <CalendarDays className="h-4 w-4" />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Kalendārs"
          className="absolute left-0 top-full z-50 mt-1.5 w-[17.5rem] rounded-xl border border-border bg-card p-3 text-foreground shadow-lg"
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              aria-label="Iepriekšējais mēnesis"
              disabled={prevDisabled}
              onClick={() => shiftMonth(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium">
              {MONTHS[view.m]} {view.y}
            </span>
            <button
              type="button"
              aria-label="Nākamais mēnesis"
              disabled={nextDisabled}
              onClick={() => shiftMonth(1)}
              className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center">
            {WEEKDAYS.map((w) => (
              <span key={w} className="py-1 text-xs font-medium text-muted-foreground">
                {w}
              </span>
            ))}
            {cells.map((day, i) => {
              if (day === null) return <span key={`e${i}`} />;
              const iso = toIso(view.y, view.m, day);
              const selected = iso === value;
              const isToday = iso === today;
              const off = !!outOfRange(iso);
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={off}
                  onClick={() => {
                    commit(iso);
                    setOpen(false);
                    textRef.current?.focus();
                  }}
                  className={cn(
                    "h-8 rounded-md text-sm tabular-nums transition-colors",
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted",
                    isToday && !selected && "font-semibold underline underline-offset-4",
                    off && "pointer-events-none opacity-30"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-sm">
            {!required && value ? (
              <button
                type="button"
                onClick={() => {
                  commit("");
                  setOpen(false);
                }}
                className="rounded-md px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Notīrīt
              </button>
            ) : (
              <span />
            )}
            {!outOfRange(today) ? (
              <button
                type="button"
                onClick={() => {
                  commit(today);
                  setOpen(false);
                  textRef.current?.focus();
                }}
                className="rounded-md px-2 py-1 font-medium hover:bg-muted"
              >
                Šodien
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
