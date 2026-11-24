"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import type { TaskStatus } from "@prisma/client";
import { AlertCircle, Check, Clock, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { METRIC_SURFACE, APPLE_FILL } from "@/components/dashboard/apple";
import type { AttentionItem, BoardCell, BoardColumn, BoardData, BoardRow } from "@/lib/team-tasks-board";
import { setClientMonthNote, setTaskCell, setTaskComment, setTaskStatus } from "./actions";
import { TeamDashboard } from "./team-dashboard";

type Mode = "mine" | "team";

const STATUS_LABEL: Record<TaskStatus, string> = {
  NOT_STARTED: "Nav sākts",
  IN_PROGRESS: "Procesā",
  DONE: "Pabeigts",
};

/** "2026-11-09" -> "09.11" */
function dm(iso: string): string {
  return `${iso.slice(8, 10)}.${iso.slice(5, 7)}`;
}

function completedDm(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const day = new Intl.DateTimeFormat("lv-LV", { timeZone: "Europe/Riga", day: "2-digit", month: "2-digit" }).format(d);
  return day.replace(/\.$/, "");
}

type LiveCell = BoardCell & { late: boolean };

type Override = { status: TaskStatus; completedAt: string | null; comment?: string | null };

function liveCell(cell: BoardCell, o: Override | undefined, todayIso: string): LiveCell {
  const status = o?.status ?? cell.status;
  return {
    ...cell,
    status,
    completedAt: o ? o.completedAt : cell.completedAt,
    comment: o && o.comment !== undefined ? o.comment : cell.comment,
    late: cell.hasDeadline && status !== "DONE" && cell.dueDate < todayIso,
  };
}

/** Today's date in Riga as YYYY-MM-DD, for the date field's default. */
function rigaIsoDay(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Riga" }).format(d);
}

export function TaskBoard({
  data,
  mode,
  period,
  todayIso,
}: {
  data: BoardData;
  mode: Mode;
  period: string;
  todayIso: string;
}) {
  // Optimistic status per task, so a tick shows instantly.
  const [overrides, setOverrides] = useState<Record<string, Override>>({});
  const [editing, setEditing] = useState<{ cell: LiveCell; column: string; client: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openClientId, setOpenClientId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const cellOf = (cell: BoardCell): LiveCell => {
    return liveCell(cell, overrides[cell.taskId], todayIso);
  };

  function changeStatus(taskId: string, current: TaskStatus, next: TaskStatus) {
    setError(null);
    setOverrides((prev) => ({
      ...prev,
      [taskId]: { ...prev[taskId], status: next, completedAt: next === "DONE" ? new Date().toISOString() : null },
    }));
    startTransition(async () => {
      const result = await setTaskStatus(taskId, next);
      if (!result.ok) {
        setError(result.error);
        setOverrides((prev) => ({ ...prev, [taskId]: { ...prev[taskId], status: current, completedAt: null } }));
      }
    });
  }

  /** The cell editor: text, done and its date in one go. */
  function saveCell(cell: LiveCell, value: { text: string; done: boolean; date: string | null }) {
    setError(null);
    const before: Override = { status: cell.status, completedAt: cell.completedAt, comment: cell.comment };
    setOverrides((prev) => ({
      ...prev,
      [cell.taskId]: {
        status: value.done ? "DONE" : cell.status === "DONE" ? "NOT_STARTED" : cell.status,
        completedAt: value.done ? (value.date ? `${value.date}T10:00:00.000Z` : new Date().toISOString()) : null,
        comment: value.text.trim() || null,
      },
    }));
    startTransition(async () => {
      const result = await setTaskCell(cell.taskId, value);
      if (!result.ok) {
        setError(result.error);
        setOverrides((prev) => ({ ...prev, [cell.taskId]: before }));
      }
    });
  }

  /** One click: finished <-> not finished. "Procesā" lives in the client card. */
  function toggle(cell: LiveCell) {
    changeStatus(cell.taskId, cell.status, cell.status === "DONE" ? "NOT_STARTED" : "DONE");
  }

  const openRow = data.rows.find((r) => r.clientId === openClientId) ?? null;
  const doneCount = useMemo(
    () =>
      data.rows.reduce(
        (sum, row) => sum + Object.values(row.cells).filter((c) => cellOf(c).status === "DONE").length,
        0,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.rows, overrides],
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">
          {error}
        </div>
      )}

      {mode === "team" ? (
        <TeamDashboard
          dashboard={data.dashboard}
          totals={{ all: data.totals.all, done: doneCount }}
          load={data.load}
          period={period}
          doneIds={new Set(Object.entries(overrides).filter(([, o]) => o.status === "DONE").map(([id]) => id))}
          onDone={(item) => changeStatus(item.taskId, item.status, "DONE")}
        />
      ) : (
        <AttentionLists
          overdue={data.overdue}
          dueSoon={data.dueSoon}
          mode={mode}
          overrides={overrides}
          onDone={(item) => changeStatus(item.taskId, item.status, "DONE")}
        />
      )}

      <section className={cn(METRIC_SURFACE, "overflow-hidden")}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.07] px-4 py-3 dark:border-white/[0.07]">
          <div className="font-display text-[15px] font-medium">{mode === "team" ? "Atskaišu tabula" : "Atskaites"}</div>
          <div className="text-[13px] text-muted-foreground tabular-nums">
            Pabeigtas {doneCount} no {data.totals.all}
          </div>
        </div>

        {data.rows.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            {mode === "mine"
              ? "Šim mēnesim jums nav atskaišu. Pārbaudiet, vai “Mana tabula” ir atzīmētas vajadzīgās atskaites."
              : "Šim mēnesim nav atskaišu. Atzīmējiet tās sadaļā Klienti → Atskaites un termiņi, un uzdevumi izveidosies paši."}
          </div>
        ) : (
          <>
            <Matrix
              columns={data.columns}
              rows={data.rows}
              mode={mode}
              cellOf={cellOf}
              onToggle={toggle}
              onEdit={(cell, column, client) => setEditing({ cell, column, client })}
              onOpenClient={setOpenClientId}
              period={period}
            />
            <MobileList
              columns={data.columns}
              rows={data.rows}
              cellOf={cellOf}
              onToggle={toggle}
              onOpenClient={setOpenClientId}
            />
          </>
        )}
        <Legend />
      </section>

      <CellEditor
        target={editing}
        onClose={() => setEditing(null)}
        onSave={(value) => {
          if (editing) saveCell(editing.cell, value);
          setEditing(null);
        }}
      />

      <ClientDialog
        row={openRow}
        columns={data.columns}
        mode={mode}
        period={period}
        cellOf={cellOf}
        onStatus={changeStatus}
        onEditCell={(cell, column, client) => setEditing({ cell, column, client })}
        onClose={() => setOpenClientId(null)}
      />
    </div>
  );
}

// ── Attention ──────────────────────────────────────────────────────────────

function AttentionLists({
  overdue,
  dueSoon,
  mode,
  overrides,
  onDone,
}: {
  overdue: AttentionItem[];
  dueSoon: AttentionItem[];
  mode: Mode;
  overrides: Record<string, { status: TaskStatus }>;
  onDone: (item: AttentionItem) => void;
}) {
  const open = (items: AttentionItem[]) => items.filter((i) => overrides[i.taskId]?.status !== "DONE");
  const late = open(overdue);
  const soon = open(dueSoon);
  if (late.length === 0 && soon.length === 0) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {late.length > 0 && (
        <AttentionCard
          title={`Nokavētās atskaites (${late.length})`}
          icon={<AlertCircle className="h-4 w-4 text-[#FF3B30] dark:text-[#FF453A]" />}
          items={late}
          mode={mode}
          onDone={onDone}
          late
        />
      )}
      {soon.length > 0 && (
        <AttentionCard
          title={`Termiņš tuvākajās 3 dienās (${soon.length})`}
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          items={soon}
          mode={mode}
          onDone={onDone}
        />
      )}
    </div>
  );
}

function AttentionCard({
  title,
  icon,
  items,
  mode,
  onDone,
  late,
}: {
  title: string;
  icon: React.ReactNode;
  items: AttentionItem[];
  mode: Mode;
  onDone: (item: AttentionItem) => void;
  late?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? items : items.slice(0, 6);
  return (
    <section className={cn(METRIC_SURFACE, "p-4")}>
      <div className="mb-2 flex items-center gap-2 font-display text-[14px] font-medium">
        {icon}
        {title}
      </div>
      <ul className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
        {shown.map((item) => (
          <li key={item.taskId} className="flex items-center gap-3 py-2">
            <button
              type="button"
              onClick={() => onDone(item)}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-black/[0.15] text-transparent transition-colors hover:border-foreground hover:text-foreground dark:border-white/[0.2]"
              aria-label={`Atzīmēt kā pabeigtu: ${item.clientName} ${item.reportName}`}
              title="Atzīmēt kā pabeigtu"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <div className="min-w-0 flex-1 text-[14px]">
              <span className="font-medium">{item.clientName}</span>
              <span className="text-muted-foreground"> · {item.reportName}</span>
              {mode === "team" ? (
                <span className="block truncate text-[12px] text-muted-foreground">
                  {item.assigneeName ?? "Nav atbildīgā"}
                </span>
              ) : (
                !item.mine && (
                  <span className="block truncate text-[12px] text-muted-foreground">
                    aizvietojot: {item.assigneeName ?? "kolēģi"}
                  </span>
                )
              )}
            </div>
            <div
              className={cn(
                "shrink-0 text-right text-[12px] tabular-nums",
                late ? "text-[#FF3B30] dark:text-[#FF453A]" : "text-muted-foreground",
              )}
            >
              {dm(item.dueDate)}
              {late && <span className="block">{item.daysLate} d.</span>}
            </div>
          </li>
        ))}
      </ul>
      {items.length > 6 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-[13px] text-muted-foreground underline-offset-4 hover:underline"
        >
          {expanded ? "Rādīt mazāk" : `Rādīt visus (${items.length})`}
        </button>
      )}
    </section>
  );
}

// ── Workload ───────────────────────────────────────────────────────────────

function LoadStrip({ load }: { load: BoardData["load"] }) {
  return (
    <section className={cn(METRIC_SURFACE, "p-4")}>
      <div className="mb-1 font-display text-[14px] font-medium">Slodze šomēnes</div>
      <p className="mb-3 text-[12px] text-muted-foreground">
        Lai redzētu, kur vajag palīdzību vai pārdalīt darbu. Nav salīdzinājums starp kolēģiem.
      </p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {load.map((item) => (
          <div key={item.userId ?? "none"} className={cn(APPLE_FILL, "rounded-xl px-3 py-2.5")}>
            <div className="truncate text-[14px] font-medium">{item.name}</div>
            <div className="mt-0.5 text-[12px] tabular-nums text-muted-foreground">
              Atvērti {item.open} · Pabeigti {item.done}
              {item.overdue > 0 && <> · Nokavēti {item.overdue}</>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Matrix (desktop) ───────────────────────────────────────────────────────

function cellClasses(cell: LiveCell): string {
  if (cell.status === "DONE") return "bg-white text-foreground dark:bg-transparent";
  if (cell.late) return "bg-[#FF3B30]/10 text-[#D70015] dark:bg-[#FF453A]/15 dark:text-[#FF6961]";
  return "bg-white dark:bg-transparent";
}

function cellTitle(cell: LiveCell, columnName: string, clientName: string, mode: Mode): string {
  const parts = [
    `${clientName} · ${columnName}`,
    STATUS_LABEL[cell.status],
    cell.hasDeadline ? `Termiņš ${dm(cell.dueDate)}` : "Bez termiņa",
  ];
  if (cell.late) parts.push("Nokavēts");
  if (mode === "team") parts.push(`Atbild: ${cell.assigneeName ?? "nav norādīts"}`);
  if (cell.comment) parts.push(`Teksts: ${cell.comment}`);
  parts.push("Klikšķis - pabeigts / atcelt, zīmulis - teksts un datums");
  return parts.join("\n");
}

function CellContent({ cell }: { cell: LiveCell }) {
  const text = cell.comment ? (
    <span className="block max-w-full truncate px-1 text-[11px] italic leading-tight">{cell.comment}</span>
  ) : null;
  if (cell.status === "DONE") {
    return (
      <span className="flex min-w-0 flex-col items-center leading-tight">
        {text ?? <span className="text-[17px] font-semibold">+</span>}
        <span className="text-[10px] tabular-nums text-muted-foreground">
          {text ? "+ " : ""}
          {completedDm(cell.completedAt)}
        </span>
      </span>
    );
  }
  if (text) {
    return (
      <span className="flex min-w-0 flex-col items-center leading-tight">
        {text}
        {cell.late && <span className="text-[10px] font-medium tabular-nums">{dm(cell.dueDate)}</span>}
      </span>
    );
  }
  if (cell.status === "IN_PROGRESS") {
    return <span className="text-[12px] font-medium">Procesā</span>;
  }
  if (cell.late) return <span className="text-[11px] font-medium tabular-nums">{dm(cell.dueDate)}</span>;
  return null;
}

function Matrix({
  columns,
  rows,
  mode,
  cellOf,
  onToggle,
  onEdit,
  onOpenClient,
  period,
}: {
  columns: BoardColumn[];
  rows: BoardRow[];
  mode: Mode;
  cellOf: (c: BoardCell) => LiveCell;
  onToggle: (c: LiveCell) => void;
  onEdit: (c: LiveCell, column: string, client: string) => void;
  onOpenClient: (id: string) => void;
  period: string;
}) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 min-w-[180px] border-b border-r border-black/[0.08] bg-white px-3 py-2 text-left font-medium text-muted-foreground dark:border-white/[0.08] dark:bg-card">
              Klients
            </th>
            {columns.map((col) => (
              <th
                key={col.id}
                className="min-w-[64px] border-b border-r border-black/[0.08] px-1.5 py-2 text-center text-[12px] font-medium leading-tight text-muted-foreground dark:border-white/[0.08]"
              >
                {col.name}
              </th>
            ))}
            <th className="min-w-[160px] border-b border-black/[0.08] px-3 py-2 text-left text-[12px] font-medium text-muted-foreground dark:border-white/[0.08]">
              Info
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.clientId}>
              <th
                scope="row"
                className="sticky left-0 z-10 border-b border-r border-black/[0.08] bg-white p-0 text-left font-medium dark:border-white/[0.08] dark:bg-card"
              >
                <button
                  type="button"
                  onClick={() => onOpenClient(row.clientId)}
                  className="block w-full px-3 py-2 text-left hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                  title="Atvērt klienta kartīti"
                >
                  <span className="block truncate">{row.clientName}</span>
                  {mode === "team" && row.responsibleName && (
                    <span className="block truncate text-[11px] font-normal text-muted-foreground">
                      {row.responsibleName}
                    </span>
                  )}
                </button>
              </th>
              {columns.map((col) => {
                const raw = row.cells[col.id];
                if (!raw) {
                  return (
                    <td
                      key={col.id}
                      className="border-b border-r border-black/[0.08] bg-black/[0.12] dark:border-white/[0.08] dark:bg-white/[0.12]"
                      aria-label="Nav nepieciešams"
                    />
                  );
                }
                const cell = cellOf(raw);
                return (
                  <td key={col.id} className="group relative border-b border-r border-black/[0.08] p-0 dark:border-white/[0.08]">
                    <button
                      type="button"
                      onClick={() => onToggle(cell)}
                      title={cellTitle(cell, col.name, row.clientName, mode)}
                      aria-label={`${row.clientName} ${col.name}: ${STATUS_LABEL[cell.status]}${cell.late ? ", nokavēts" : ""}`}
                      aria-pressed={cell.status === "DONE"}
                      className={cn(
                        "relative flex h-11 w-full items-center justify-center transition-colors hover:ring-2 hover:ring-inset hover:ring-[#007AFF]/40",
                        cellClasses(cell),
                      )}
                    >
                      <CellContent cell={cell} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(cell, col.name, row.clientName)}
                      className="absolute right-0.5 top-0.5 hidden rounded p-0.5 text-muted-foreground hover:bg-black/[0.06] hover:text-foreground focus:block group-hover:block dark:hover:bg-white/[0.1]"
                      aria-label={`${row.clientName} ${col.name}: teksts un datums`}
                      title="Teksts un datums"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  </td>
                );
              })}
              <td className="border-b border-black/[0.08] p-0 dark:border-white/[0.08]">
                <InfoCell key={`${row.clientId}-${period}`} clientId={row.clientId} clientName={row.clientName} period={period} initial={row.note} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── List (phone) ───────────────────────────────────────────────────────────

function MobileList({
  columns,
  rows,
  cellOf,
  onToggle,
  onOpenClient,
}: {
  columns: BoardColumn[];
  rows: BoardRow[];
  cellOf: (c: BoardCell) => LiveCell;
  onToggle: (c: LiveCell) => void;
  onOpenClient: (id: string) => void;
}) {
  return (
    <ul className="divide-y divide-black/[0.07] md:hidden dark:divide-white/[0.07]">
      {rows.map((row) => (
        <li key={row.clientId} className="px-4 py-3">
          <button
            type="button"
            onClick={() => onOpenClient(row.clientId)}
            className="mb-2 block w-full text-left text-[15px] font-medium"
          >
            {row.clientName}
            {row.note && <span className="block truncate text-[12px] font-normal text-muted-foreground">{row.note}</span>}
          </button>
          <div className="flex flex-wrap gap-1.5">
            {columns.map((col) => {
              const raw = row.cells[col.id];
              if (!raw) return null;
              const cell = cellOf(raw);
              const done = cell.status === "DONE";
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => onToggle(cell)}
                  aria-pressed={done}
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[13px]",
                    done
                      ? "border-black/[0.1] bg-black/[0.04] text-muted-foreground line-through dark:border-white/[0.1] dark:bg-white/[0.06]"
                      : cell.late
                        ? "border-[#FF3B30]/40 bg-[#FF3B30]/10 text-[#D70015] dark:text-[#FF6961]"
                        : "border-black/[0.12] dark:border-white/[0.14]",
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : null}
                  {col.name}
                  {!done && cell.hasDeadline && <span className="text-[11px] tabular-nums opacity-70">{dm(cell.dueDate)}</span>}
                </button>
              );
            })}
          </div>
        </li>
      ))}
    </ul>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-black/[0.07] px-4 py-2.5 text-[12px] text-muted-foreground dark:border-white/[0.07]">
      <span className="hidden md:inline">Klikšķis uz šūnas - pabeigts / atcelt, zīmulis - teksts un datums.</span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-3 w-3 rounded-sm bg-black/[0.12] dark:bg-white/[0.12]" /> Nav nepieciešams
      </span>
      <span className="flex items-center gap-1.5">
        <span className="font-semibold text-foreground">+</span> Pabeigts (datums)
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-3 w-3 rounded-sm bg-[#FF3B30]/20" /> Nokavēts
      </span>
      <span>Klienta nosaukums - statuss, komentārs, piezīme.</span>
    </div>
  );
}

// ── Client card ────────────────────────────────────────────────────────────

function ClientDialog({
  row,
  columns,
  mode,
  period,
  cellOf,
  onStatus,
  onEditCell,
  onClose,
}: {
  row: BoardRow | null;
  columns: BoardColumn[];
  mode: Mode;
  period: string;
  cellOf: (c: BoardCell) => LiveCell;
  onStatus: (taskId: string, current: TaskStatus, next: TaskStatus) => void;
  onEditCell: (cell: LiveCell, column: string, client: string) => void;
  onClose: () => void;
}) {
  return (
    <Dialog.Root open={!!row} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] overflow-y-auto rounded-t-2xl border border-border bg-background p-5 shadow-xl focus:outline-none sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl">
          {row && (
            <ClientDialogBody
              key={row.clientId}
              row={row}
              columns={columns}
              mode={mode}
              period={period}
              cellOf={cellOf}
              onStatus={onStatus}
              onEditCell={onEditCell}
            />
          )}
          <Dialog.Close
            className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-black/[0.05] hover:text-foreground"
            aria-label="Aizvērt"
          >
            <X className="h-4 w-4" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ClientDialogBody({
  row,
  columns,
  mode,
  period,
  cellOf,
  onStatus,
  onEditCell,
}: {
  row: BoardRow;
  columns: BoardColumn[];
  mode: Mode;
  period: string;
  cellOf: (c: BoardCell) => LiveCell;
  onStatus: (taskId: string, current: TaskStatus, next: TaskStatus) => void;
  onEditCell: (cell: LiveCell, column: string, client: string) => void;
}) {
  const [note, setNote] = useState(row.note ?? "");
  const [savedNote, setSavedNote] = useState(row.note ?? "");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function saveNote() {
    if (note.trim() === savedNote.trim()) return;
    startTransition(async () => {
      const result = await setClientMonthNote(row.clientId, period, note);
      if (result.ok) {
        setSavedNote(note);
        setMessage("Piezīme saglabāta.");
      } else setMessage(result.error);
    });
  }

  const cells = columns.flatMap((col) => (row.cells[col.id] ? [{ col, cell: cellOf(row.cells[col.id]) }] : []));

  return (
    <>
      <Dialog.Title className="pr-8 font-display text-lg font-medium">{row.clientName}</Dialog.Title>
      <Dialog.Description className="mb-4 text-[13px] text-muted-foreground">
        {mode === "team" && row.responsibleName ? `Atbildīgais: ${row.responsibleName}` : "Šī mēneša atskaites"}
      </Dialog.Description>

      <ul className="space-y-3">
        {cells.map(({ col, cell }) => (
          <TaskRow
            key={cell.taskId}
            name={col.name}
            cell={cell}
            mode={mode}
            onStatus={onStatus}
            onEdit={() => onEditCell(cell, col.name, row.clientName)}
          />
        ))}
      </ul>

      <div className="mt-5">
        <label htmlFor="client-note" className="mb-1.5 block text-[13px] font-medium">
          Info (piezīme šim mēnesim)
        </label>
        <textarea
          id="client-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={saveNote}
          maxLength={500}
          rows={2}
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="Piem., gaidām bankas izrakstu"
        />
        {(pending || message) && (
          <p className="mt-1 text-[12px] text-muted-foreground">{pending ? "Saglabā..." : message}</p>
        )}
      </div>
    </>
  );
}

function TaskRow({
  name,
  cell,
  mode,
  onStatus,
  onEdit,
}: {
  name: string;
  cell: LiveCell;
  mode: Mode;
  onStatus: (taskId: string, current: TaskStatus, next: TaskStatus) => void;
  onEdit: () => void;
}) {
  const [comment, setComment] = useState(cell.comment ?? "");
  const [saved, setSaved] = useState(cell.comment ?? "");
  const [pending, startTransition] = useTransition();
  const [showComment, setShowComment] = useState(!!cell.comment);

  function saveComment() {
    if (comment.trim() === saved.trim()) return;
    startTransition(async () => {
      const result = await setTaskComment(cell.taskId, comment);
      if (result.ok) setSaved(comment);
    });
  }

  const moved = cell.originalDueDate !== cell.dueDate;

  return (
    <li className={cn(APPLE_FILL, "rounded-xl p-3")}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-[14px] font-medium">{name}</div>
          <div
            className={cn(
              "text-[12px] tabular-nums",
              cell.late ? "text-[#D70015] dark:text-[#FF6961]" : "text-muted-foreground",
            )}
          >
            {cell.hasDeadline ? `Termiņš ${dm(cell.dueDate)}` : "Bez termiņa"}
            {cell.hasDeadline && moved && ` (sākotnēji ${dm(cell.originalDueDate)})`}
            {cell.late && " · nokavēts"}
            {cell.status === "DONE" && cell.completedAt && ` · pabeigts ${completedDm(cell.completedAt)}`}
            {mode === "team" && ` · ${cell.assigneeName ?? "nav atbildīgā"}`}
          </div>
        </div>
        <div className="flex rounded-full bg-black/[0.05] p-0.5 dark:bg-white/[0.08]" role="group" aria-label={`${name} statuss`}>
          {(["NOT_STARTED", "IN_PROGRESS", "DONE"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => s !== cell.status && onStatus(cell.taskId, cell.status, s)}
              aria-pressed={cell.status === s}
              className={cn(
                "h-7 rounded-full px-2.5 text-[12px] transition-colors",
                cell.status === s
                  ? "bg-white font-medium text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.08)] dark:bg-white/[0.14]"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px]">
        <button type="button" onClick={onEdit} className="text-muted-foreground underline-offset-4 hover:underline">
          Teksts un datums
        </button>
        {!showComment && !cell.comment && (
          <button
            type="button"
            onClick={() => setShowComment(true)}
            className="text-muted-foreground underline-offset-4 hover:underline"
          >
            Pievienot komentāru
          </button>
        )}
        {mode === "mine" && (
          <Link
            href={`/employee/new-entry?task=${cell.taskId}`}
            className="text-muted-foreground underline-offset-4 hover:underline"
          >
            Pierakstīt laiku
          </Link>
        )}
      </div>
      {showComment && (
        <div className="mt-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onBlur={saveComment}
            maxLength={500}
            rows={2}
            aria-label={`${name} komentārs`}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="Komentārs"
          />
          {pending && <p className="text-[11px] text-muted-foreground">Saglabā...</p>}
        </div>
      )}
    </li>
  );
}

// ── Cell editor ────────────────────────────────────────────────────────────

/**
 * What a cell of the Excel sheet holds: any text ("XXX", "Nom.līg.",
 * "Sw.0001"), done or not, and the date it was done.
 */
function CellEditor({
  target,
  onClose,
  onSave,
}: {
  target: { cell: LiveCell; column: string; client: string } | null;
  onClose: () => void;
  onSave: (value: { text: string; done: boolean; date: string | null }) => void;
}) {
  return (
    <Dialog.Root open={!!target} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/40" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-[60] rounded-t-2xl border border-border bg-background p-5 shadow-xl focus:outline-none sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-sm sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl">
          {target && <CellEditorBody key={target.cell.taskId} target={target} onSave={onSave} onClose={onClose} />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CellEditorBody({
  target,
  onSave,
  onClose,
}: {
  target: { cell: LiveCell; column: string; client: string };
  onSave: (value: { text: string; done: boolean; date: string | null }) => void;
  onClose: () => void;
}) {
  const { cell } = target;
  const [text, setText] = useState(cell.comment ?? "");
  const [done, setDone] = useState(cell.status === "DONE");
  const [date, setDate] = useState(cell.completedAt ? rigaIsoDay(new Date(cell.completedAt)) : rigaIsoDay());

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ text, done, date: done ? date || null : null });
      }}
    >
      <Dialog.Title className="pr-8 font-display text-base font-medium">
        {target.client} · {target.column}
      </Dialog.Title>
      <Dialog.Description className="mb-4 text-[13px] text-muted-foreground">
        {cell.hasDeadline ? `Termiņš ${dm(cell.dueDate)}` : "Bez termiņa"}
        {cell.late ? " · nokavēts" : ""}
      </Dialog.Description>

      <label className="mb-1.5 block text-[13px] font-medium" htmlFor="cell-text">
        Teksts šūnā
      </label>
      <input
        id="cell-text"
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={500}
        placeholder="Piem., XXX, Nom.līg., Sw.0001"
        className="mb-4 h-10 w-full rounded-xl border border-input bg-background px-3 text-[14px] focus:outline-none focus:ring-1 focus:ring-ring"
      />

      <label className="mb-3 flex items-center gap-2 text-[14px]">
        <input type="checkbox" checked={done} onChange={(e) => setDone(e.target.checked)} className="h-4 w-4" />
        Pabeigts
      </label>
      {done && (
        <div className="mb-4">
          <label className="mb-1.5 block text-[13px] font-medium" htmlFor="cell-date">
            Datums
          </label>
          <input
            id="cell-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 w-full rounded-xl border border-input bg-background px-3 text-[14px] focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="h-9 rounded-full px-4 text-[14px] text-muted-foreground hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
        >
          Atcelt
        </button>
        <button type="submit" className="h-9 rounded-full bg-foreground px-4 text-[14px] font-medium text-background">
          Saglabāt
        </button>
      </div>
    </form>
  );
}

// ── Info cell ──────────────────────────────────────────────────────────────

/**
 * The "Info" column, written straight in the sheet like in Excel: click,
 * type, Enter or click away saves, Escape cancels.
 */
function InfoCell({
  clientId,
  clientName,
  period,
  initial,
}: {
  clientId: string;
  clientName: string;
  period: string;
  initial: string | null;
}) {
  const [value, setValue] = useState(initial ?? "");
  const [saved, setSaved] = useState(initial ?? "");
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(false);
  const [, startTransition] = useTransition();

  function commit() {
    setEditing(false);
    const next = value.trim();
    if (next === saved.trim()) return;
    const before = saved;
    setSaved(next);
    setValue(next);
    setError(false);
    startTransition(async () => {
      const result = await setClientMonthNote(clientId, period, next);
      if (!result.ok) {
        setSaved(before);
        setValue(before);
        setError(true);
      }
    });
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={value}
        maxLength={500}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            setValue(saved);
            setEditing(false);
          }
        }}
        aria-label={`${clientName}: Info`}
        className="h-11 w-full min-w-[200px] bg-[#007AFF]/[0.06] px-3 text-[12px] outline-none ring-2 ring-inset ring-[#007AFF]/40"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={cn(
        "block h-11 w-full min-w-[200px] max-w-[280px] truncate px-3 text-left text-[12px] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]",
        saved ? "text-foreground/80" : "text-muted-foreground/50",
        error && "text-destructive",
      )}
      title={error ? "Neizdevās saglabāt" : saved || "Klikšķiniet, lai rakstītu"}
    >
      {error ? "Neizdevās saglabāt" : saved || "+"}
    </button>
  );
}
