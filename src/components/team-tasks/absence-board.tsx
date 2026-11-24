"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { METRIC_SURFACE, APPLE_FILL, APPLE_PILL } from "@/components/dashboard/apple";
import type { AbsenceView } from "@/lib/team-extras-server";
import { approveAbsence, deleteAbsence, saveAbsence } from "./absence-actions";

/**
 * Who is away and who covers. For everyone: today's strip and the month grid
 * (the fact and the substitute, never the reason). For the person: the form
 * and their own entries. For managers: approvals.
 */

const TYPE_LABEL: Record<AbsenceView["type"], string> = {
  vacation: "Atvaļinājums",
  sick: "Slimības lapa",
  busy: "Aizņemts",
};

// Neutral, non-judging colours: blue for leave, grey for sick, a light stripe for busy.
const TYPE_BAR: Record<AbsenceView["type"], string> = {
  vacation: "bg-[#007AFF]/70 dark:bg-[#0A84FF]/70",
  sick: "bg-black/35 dark:bg-white/35",
  busy: "bg-[repeating-linear-gradient(135deg,rgba(0,122,255,0.35)_0,rgba(0,122,255,0.35)_3px,transparent_3px,transparent_6px)]",
};

const MONTHS = ["Janvāris", "Februāris", "Marts", "Aprīlis", "Maijs", "Jūnijs", "Jūlijs", "Augusts", "Septembris", "Oktobris", "Novembris", "Decembris"];

function dm(iso: string) {
  return `${iso.slice(8, 10)}.${iso.slice(5, 7)}`;
}

function range(a: AbsenceView) {
  const days = a.startDate === a.endDate ? dm(a.startDate) : `${dm(a.startDate)} - ${dm(a.endDate)}`;
  return a.startTime ? `${days}, ${a.startTime}${a.endTime ? `-${a.endTime}` : ""}` : days;
}

export function AbsenceBoard({
  absences,
  people,
  meId,
  todayIso,
  month,
  basePath,
}: {
  absences: AbsenceView[];
  people: { id: string; name: string }[];
  meId: string;
  todayIso: string;
  month: string; // YYYY-MM
  basePath: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const today = absences.filter((a) => a.startDate <= todayIso && todayIso <= a.endDate && a.status === "approved");
  const toApprove = absences.filter((a) => a.canApprove);
  const mine = absences.filter((a) => a.mine && a.endDate >= todayIso);

  function run(action: () => Promise<{ ok: boolean; error?: string; warnings?: string[] }>, done?: string) {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.error ?? "Kļūda.");
      else setNotice([done, ...(result.warnings ?? [])].filter(Boolean).join(" "));
    });
  }

  return (
    <div className="space-y-5">
      <section className={cn(METRIC_SURFACE, "p-4")}>
        <div className="font-display text-[15px] font-medium">Šodien prom</div>
        {today.length === 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">Šodien visi ir uz vietas.</p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-2">
            {today.map((a) => (
              <li key={a.id} className={cn(APPLE_FILL, "rounded-full px-3 py-1.5 text-[13px]")}>
                <span className="font-medium">{a.name}</span>
                <span className="text-muted-foreground">
                  {" "}
                  · {TYPE_LABEL[a.type]}
                  {a.type === "busy" && a.startTime ? ` ${a.startTime}${a.endTime ? `-${a.endTime}` : ""}` : ` līdz ${dm(a.endDate)}`}
                  {a.substituteName ? ` · aizvieto ${a.substituteName}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {(error || notice) && (
        <div
          className={cn(
            "rounded-xl px-4 py-2.5 text-sm",
            error ? "border border-destructive/30 bg-destructive/5 text-destructive" : "border border-black/[0.08] bg-black/[0.03] dark:border-white/[0.1] dark:bg-white/[0.04]",
          )}
        >
          {error ?? notice}
        </div>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <AbsenceForm people={people.filter((p) => p.id !== meId)} pending={pending} onSave={(data) => run(() => saveAbsence(data), "Saglabāts.")} />

        <div className="space-y-5">
          {toApprove.length > 0 && (
            <section className={cn(METRIC_SURFACE, "p-4")}>
              <div className="mb-2 font-display text-[15px] font-medium">Gaida apstiprinājumu</div>
              <ul className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
                {toApprove.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center gap-2 py-2 text-[14px]">
                    <span className="flex-1">
                      <span className="font-medium">{a.name}</span> · {TYPE_LABEL[a.type]} {range(a)}
                      {a.substituteName && <span className="text-muted-foreground"> · aizvieto {a.substituteName}</span>}
                    </span>
                    <button type="button" disabled={pending} onClick={() => run(() => approveAbsence(a.id), "Apstiprināts.")} className={APPLE_PILL}>
                      Apstiprināt
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className={cn(METRIC_SURFACE, "p-4")}>
            <div className="mb-2 font-display text-[15px] font-medium">Manas prombūtnes</div>
            {mine.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nav ierakstītu prombūtņu.</p>
            ) : (
              <ul className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
                {mine.map((a) => (
                  <li key={a.id} className="flex items-start gap-2 py-2 text-[14px]">
                    <div className="flex-1">
                      <div>
                        {TYPE_LABEL[a.type]} · {range(a)}
                        <span className="ml-2 text-[12px] text-muted-foreground">
                          {a.status === "approved" ? "apstiprināts" : "gaida apstiprinājumu"}
                        </span>
                      </div>
                      <div className="text-[12px] text-muted-foreground">
                        {a.substituteName ? `Aizvieto ${a.substituteName}` : ""}
                        {a.note ? `${a.substituteName ? " · " : ""}Piezīme (redzat tikai jūs): ${a.note}` : ""}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => run(() => deleteAbsence(a.id), "Dzēsts.")}
                      className="rounded p-1 text-muted-foreground hover:text-foreground"
                      aria-label="Dzēst prombūtni"
                      title="Dzēst"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <TeamCalendar absences={absences} people={people} todayIso={todayIso} month={month} basePath={basePath} />
    </div>
  );
}

function AbsenceForm({
  people,
  pending,
  onSave,
}: {
  people: { id: string; name: string }[];
  pending: boolean;
  onSave: (data: {
    type: AbsenceView["type"];
    startDate: string;
    endDate: string;
    startTime: string | null;
    endTime: string | null;
    substituteId: string | null;
    note: string | null;
  }) => void;
}) {
  const [type, setType] = useState<AbsenceView["type"]>("vacation");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [substituteId, setSubstituteId] = useState("");
  const [note, setNote] = useState("");
  const needsSub = type !== "busy";
  const field = "h-10 w-full rounded-xl border border-input bg-background px-3 text-[14px] focus:outline-none focus:ring-1 focus:ring-ring";

  return (
    <form
      className={cn(METRIC_SURFACE, "space-y-3 p-4")}
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          type,
          startDate,
          endDate: endDate || startDate,
          startTime: type === "busy" && startTime ? startTime : null,
          endTime: type === "busy" && endTime ? endTime : null,
          substituteId: substituteId || null,
          note: note.trim() || null,
        });
      }}
    >
      <div className="font-display text-[15px] font-medium">Pieteikt prombūtni</div>
      <div className="flex rounded-full bg-black/[0.05] p-0.5 dark:bg-white/[0.08]" role="group" aria-label="Veids">
        {(["vacation", "sick", "busy"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            aria-pressed={type === t}
            className={cn(
              "h-8 flex-1 rounded-full text-[13px] transition-colors",
              type === t ? "bg-white font-medium shadow-[0_1px_3px_rgba(0,0,0,0.08)] dark:bg-white/[0.14]" : "text-muted-foreground",
            )}
          >
            {TYPE_LABEL[t]}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="grid gap-1 text-[12px] text-muted-foreground">
          No
          <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className={field} />
        </label>
        <label className="grid gap-1 text-[12px] text-muted-foreground">
          Līdz
          <input type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} className={field} />
        </label>
      </div>
      {type === "busy" && (
        <div className="grid grid-cols-2 gap-2">
          <label className="grid gap-1 text-[12px] text-muted-foreground">
            Laiks no (nav obligāti)
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={field} />
          </label>
          <label className="grid gap-1 text-[12px] text-muted-foreground">
            Līdz
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={field} />
          </label>
        </div>
      )}
      <label className="grid gap-1 text-[12px] text-muted-foreground">
        {needsSub ? "Aizvietotājs (obligāti)" : "Aizvietotājs (nav obligāti)"}
        <select value={substituteId} onChange={(e) => setSubstituteId(e.target.value)} required={needsSub} className={field}>
          <option value="">Izvēlieties kolēģi</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-[12px] text-muted-foreground">
        Piezīme - redzat tikai jūs (nav obligāti)
        <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} placeholder="Piem., ārsts" className={field} />
      </label>
      <p className="text-[12px] text-muted-foreground">
        Kolēģi un vadītājs redz tikai to, ka esat prom, un kas aizvieto - ne iemeslu. Atvaļinājumu apstiprina vadītājs.
      </p>
      <button type="submit" disabled={pending || !startDate} className="h-10 w-full rounded-full bg-foreground text-[14px] font-medium text-background disabled:opacity-50">
        {pending ? "Saglabā..." : "Saglabāt"}
      </button>
    </form>
  );
}

function TeamCalendar({
  absences,
  people,
  todayIso,
  month,
  basePath,
}: {
  absences: AbsenceView[];
  people: { id: string; name: string }[];
  todayIso: string;
  month: string;
  basePath: string;
}) {
  const [y, m] = month.split("-").map(Number);
  const daysIn = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const days = Array.from({ length: daysIn }, (_, i) => {
    const iso = `${month}-${String(i + 1).padStart(2, "0")}`;
    const dow = new Date(`${iso}T00:00:00Z`).getUTCDay();
    return { iso, n: i + 1, weekend: dow === 0 || dow === 6 };
  });
  const shift = (delta: number) => {
    const d = new Date(Date.UTC(y, m - 1 + delta, 1));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  };

  const byPerson = new Map<string, AbsenceView[]>();
  for (const a of absences) byPerson.set(a.userId, [...(byPerson.get(a.userId) ?? []), a]);

  return (
    <section className={cn(METRIC_SURFACE, "overflow-hidden")}>
      <div className="flex flex-wrap items-center gap-2 border-b border-black/[0.07] px-4 py-3 dark:border-white/[0.07]">
        <div className="mr-auto font-display text-[15px] font-medium">Komandas kalendārs</div>
        <Link href={`${basePath}?m=${shift(-1)}`} className={cn(APPLE_PILL, "px-2")} aria-label="Iepriekšējais mēnesis">
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-[120px] text-center text-[14px] font-medium">
          {MONTHS[m - 1]} {y}
        </div>
        <Link href={`${basePath}?m=${shift(1)}`} className={cn(APPLE_PILL, "px-2")} aria-label="Nākamais mēnesis">
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 min-w-[150px] border-b border-r border-black/[0.08] bg-white px-3 py-2 text-left font-medium text-muted-foreground dark:border-white/[0.08] dark:bg-card">
                Darbinieks
              </th>
              {days.map((d) => (
                <th
                  key={d.iso}
                  className={cn(
                    "min-w-[26px] border-b border-black/[0.08] px-0 py-2 text-center font-normal tabular-nums dark:border-white/[0.08]",
                    d.weekend ? "bg-black/[0.04] text-muted-foreground dark:bg-white/[0.04]" : "text-muted-foreground",
                    d.iso === todayIso && "font-semibold text-foreground",
                  )}
                >
                  {d.n}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {people.map((p) => {
              const list = byPerson.get(p.id) ?? [];
              return (
                <tr key={p.id}>
                  <th
                    scope="row"
                    className="sticky left-0 z-10 truncate border-b border-r border-black/[0.08] bg-white px-3 py-1.5 text-left text-[13px] font-normal dark:border-white/[0.08] dark:bg-card"
                  >
                    {p.name}
                  </th>
                  {days.map((d) => {
                    const a = list.find((x) => x.startDate <= d.iso && d.iso <= x.endDate);
                    return (
                      <td
                        key={d.iso}
                        className={cn(
                          "h-8 border-b border-black/[0.05] p-0 dark:border-white/[0.05]",
                          d.weekend && "bg-black/[0.03] dark:bg-white/[0.03]",
                          d.iso === todayIso && "bg-[#007AFF]/[0.06]",
                        )}
                        title={
                          a
                            ? `${p.name}: ${TYPE_LABEL[a.type]} ${range(a)}${a.substituteName ? `, aizvieto ${a.substituteName}` : ""}${a.status === "approved" ? "" : " (gaida apstiprinājumu)"}`
                            : undefined
                        }
                      >
                        {a && (
                          <div
                            className={cn(
                              "mx-auto h-4 w-full",
                              TYPE_BAR[a.type],
                              a.startDate === d.iso && "ml-0.5 rounded-l",
                              a.endDate === d.iso && "mr-0.5 rounded-r",
                              a.status !== "approved" && "opacity-45",
                            )}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-black/[0.07] px-4 py-2.5 text-[12px] text-muted-foreground dark:border-white/[0.07]">
        {(["vacation", "sick", "busy"] as const).map((t) => (
          <span key={t} className="flex items-center gap-1.5">
            <span className={cn("inline-block h-3 w-5 rounded-sm", TYPE_BAR[t])} /> {TYPE_LABEL[t]}
          </span>
        ))}
        <span>Bālāks - gaida apstiprinājumu. Uzbraucot ar peli, redzams aizvietotājs.</span>
      </div>
    </section>
  );
}
