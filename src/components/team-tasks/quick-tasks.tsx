"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { Check, CornerDownLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { METRIC_SURFACE } from "@/components/dashboard/apple";
import type { QuickTaskView } from "@/lib/team-extras-server";
import { addQuickTask, deleteQuickTask, toggleQuickTask } from "./quick-actions";

const LATE = "text-[#D70015] dark:text-[#FF6961]";

function dm(iso: string): string {
  return `${iso.slice(8, 10)}.${iso.slice(5, 7)}`;
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return new Date(d.getTime() + days * 86_400_000).toISOString().slice(0, 10);
}

type Group = { key: string; title: string; items: QuickTaskView[] };

/**
 * Small to-dos in one line, faster than a note on paper: the date word, an
 * @colleague and a known client are picked out of the text automatically.
 */
export function QuickTasks({ initial, todayIso }: { initial: QuickTaskView[]; todayIso: string }) {
  const [tasks, setTasks] = useState(initial);
  const [value, setValue] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDone, setShowDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // Server data wins after each refresh; optimistic edits fill the gap.
  const [seen, setSeen] = useState(initial);
  if (seen !== initial) {
    setSeen(initial);
    setTasks(initial);
  }

  const tomorrow = addDaysIso(todayIso, 1);
  const groups: Group[] = useMemo(() => {
    const open = tasks.filter((t) => !t.done);
    const by = (pred: (t: QuickTaskView) => boolean) => open.filter(pred);
    return [
      // Unfinished to-dos from earlier days roll over to today instead of piling
      // up as "late"; the line keeps the day they were first planned for.
      { key: "late", title: "Nepadarītie uzdevumi - pārcelti uz šodienu", items: by((t) => !!t.dueDate && t.dueDate < todayIso) },
      { key: "today", title: "Šodien", items: by((t) => t.dueDate === todayIso) },
      { key: "tomorrow", title: "Rīt", items: by((t) => t.dueDate === tomorrow) },
      { key: "later", title: "Vēlāk", items: by((t) => !!t.dueDate && t.dueDate > tomorrow) },
      { key: "none", title: "Bez termiņa", items: by((t) => !t.dueDate) },
    ].filter((g) => g.items.length > 0);
  }, [tasks, todayIso, tomorrow]);
  const done = tasks.filter((t) => t.done);

  function submit() {
    const text = value.trim();
    if (!text) return;
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await addQuickTask(text);
      if (result.ok) {
        setValue("");
        setMessage(result.summary ?? null);
        inputRef.current?.focus();
      } else setError(result.error);
    });
  }

  function toggle(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
    startTransition(async () => {
      const result = await toggleQuickTask(id);
      if (!result.ok) {
        setError(result.error);
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
      }
    });
  }

  function remove(id: string) {
    const before = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    startTransition(async () => {
      const result = await deleteQuickTask(id);
      if (!result.ok) {
        setError(result.error);
        setTasks(before);
      }
    });
  }

  return (
    <section className={cn(METRIC_SURFACE, "p-4")}>
      <div className="mb-2 font-display text-[15px] font-medium">Mani darbi</div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="relative"
      >
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={300}
          placeholder="Piem.: Zvanīt Letex par izrakstu rīt · @Jānis pārbaudīt Kipu PVN piektdien"
          aria-label="Jauns darbs"
          className="h-11 w-full rounded-xl border border-input bg-background pl-3.5 pr-11 text-[14px] focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={pending || !value.trim()}
          className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-black/[0.05] hover:text-foreground disabled:opacity-40 dark:hover:bg-white/[0.08]"
          aria-label="Pievienot"
        >
          <CornerDownLeft className="h-4 w-4" />
        </button>
      </form>
      <p className="mt-1.5 text-[12px] text-muted-foreground">
        {error ? (
          <span className="text-destructive">{error}</span>
        ) : (
          message ?? "Termiņu saprot no vārdiem šodien, rīt, parīt, pirmdien...svētdien vai 25.11. @Vārds nodod kolēģim."
        )}
      </p>

      {groups.length === 0 && done.length === 0 && (
        <p className="mt-3 text-sm text-muted-foreground">Nekā nav. Ierakstiet pirmo darbu augšā.</p>
      )}

      <div className="mt-3 space-y-3">
        {groups.map((group) => (
          <div key={group.key}>
            <div className={cn("mb-1 text-[12px] font-medium", group.key === "late" ? LATE : "text-muted-foreground")}>
              {group.title} ({group.items.length})
            </div>
            <ul className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
              {group.items.map((t) => (
                <TaskLine key={t.id} task={t} late={group.key === "late"} onToggle={toggle} onRemove={remove} />
              ))}
            </ul>
          </div>
        ))}
        {done.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setShowDone((v) => !v)}
              className="text-[12px] text-muted-foreground underline-offset-4 hover:underline"
            >
              {showDone ? "Paslēpt pabeigtos" : `Pabeigti pēdējās 7 dienās (${done.length})`}
            </button>
            {showDone && (
              <ul className="mt-1 divide-y divide-black/[0.06] dark:divide-white/[0.06]">
                {done.map((t) => (
                  <TaskLine key={t.id} task={t} late={false} onToggle={toggle} onRemove={remove} />
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function TaskLine({
  task,
  late,
  onToggle,
  onRemove,
}: {
  task: QuickTaskView;
  late: boolean;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <li className="group flex items-center gap-3 py-1.5">
      <button
        type="button"
        onClick={() => onToggle(task.id)}
        aria-pressed={task.done}
        aria-label={task.done ? `Atzīmēt kā nepabeigtu: ${task.text}` : `Atzīmēt kā pabeigtu: ${task.text}`}
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
          task.done
            ? "border-foreground bg-foreground text-background"
            : "border-black/[0.2] text-transparent hover:border-foreground hover:text-foreground dark:border-white/[0.25]",
        )}
      >
        <Check className="h-3 w-3" />
      </button>
      <div className={cn("min-w-0 flex-1 text-[14px]", task.done && "text-muted-foreground line-through")}>
        <span className="break-words">{task.text}</span>
        <span className="ml-2 text-[12px] text-muted-foreground">
          {task.clientName && <span className="mr-2">· {task.clientName}</span>}
          {task.toName && <span className="mr-2">→ {task.toName}</span>}
          {task.fromName && <span className="mr-2">no {task.fromName}</span>}
        </span>
      </div>
      {task.dueDate && (
        <span
          className={cn("shrink-0 text-[12px] tabular-nums", late ? LATE : "text-muted-foreground")}
          title={late ? `Sākotnēji plānots ${dm(task.dueDate)}` : undefined}
        >
          {late ? `no ${dm(task.dueDate)}` : dm(task.dueDate)}
        </span>
      )}
      <button
        type="button"
        onClick={() => onRemove(task.id)}
        className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 hover:text-foreground focus:opacity-100 group-hover:opacity-100"
        aria-label={`Dzēst: ${task.text}`}
        title="Dzēst"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}
