"use client";

import { useMemo, useState, useTransition } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowDown, ArrowUp, Plus, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { METRIC_SURFACE, APPLE_FILL } from "@/components/dashboard/apple";
import { Button } from "@/components/ui/button";
import {
  applyReportTemplate,
  moveReportType,
  saveReportType,
  setClientReport,
  setClientResponsible,
  updateClientReport,
  type RegistryScope,
} from "./registry-actions";

interface ReportType {
  id: string;
  name: string;
  dueDay: number;
  active: boolean;
}

interface ClientReportSettings {
  reportTypeId: string;
  responsibleUserId: string | null;
  frequency: string;
  dueDay: number | null;
}

interface RegistryClient {
  id: string;
  name: string;
  active: boolean;
  responsibleUserId: string | null;
  fallbackUserId: string | null;
  reports: ClientReportSettings[];
}

interface Person {
  id: string;
  name: string;
}

const selectClass =
  "h-8 rounded-lg border border-black/[0.1] bg-white px-2 text-[13px] dark:border-white/[0.12] dark:bg-white/[0.04]";

export function RegistryEditor({
  reportTypes,
  clients,
  people,
  scope = "firm",
}: {
  reportTypes: ReportType[];
  clients: RegistryClient[];
  people: Person[];
  /** "mine": an employee's own sheet - no responsible person, own clients only. */
  scope?: RegistryScope;
}) {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">
          {error}
        </div>
      )}
      <ColumnsEditor reportTypes={reportTypes} scope={scope} onError={setError} />
      {reportTypes.length > 0 && (
        <ClientMatrix
          reportTypes={reportTypes.filter((rt) => rt.active)}
          clients={clients}
          people={people}
          scope={scope}
          onError={setError}
        />
      )}
    </div>
  );
}

// ── Columns ────────────────────────────────────────────────────────────────

function ColumnsEditor({
  reportTypes,
  scope,
  onError,
}: {
  reportTypes: ReportType[];
  scope: RegistryScope;
  onError: (e: string | null) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [newName, setNewName] = useState("");
  const [newDay, setNewDay] = useState("");

  function run(action: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) {
    onError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) onError(result.error ?? "Kļūda.");
      else after?.();
    });
  }

  return (
    <section className={cn(METRIC_SURFACE, "p-4")}>
      <div className="mb-1 font-display text-[15px] font-medium">Atskaišu kolonnas</div>
      <p className="mb-4 text-[13px] text-muted-foreground">
        Kā Excel tabulas kolonnas. Termiņa diena attiecas uz visiem klientiem; ja tā iekrīt brīvdienā vai svētku dienā,
        termiņš pārceļas uz nākamo darba dienu. Tukša diena - atskaitei nav termiņa, tā nekad nekļūst nokavēta.
      </p>

      {reportTypes.length === 0 && (
        <p className="mb-3 rounded-xl bg-black/[0.03] px-3 py-2.5 text-[13px] text-muted-foreground dark:bg-white/[0.04]">
          {scope === "mine"
            ? "Vēl nav kolonnu. Izmantojiet gatavo veidni vai pievienojiet savas kolonnas ar termiņu."
            : "Vēl nav kolonnu. Izmantojiet gatavo veidni, pievienojiet tās šeit vai importējiet visu tabulu no Excel."}
        </p>
      )}

      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={pending}
            onClick={() => run(() => applyReportTemplate(scope, "basic"))}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Pamata veidne
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={pending}
            onClick={() => run(() => applyReportTemplate(scope, "extended"))}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Paplašinātā veidne
          </Button>
        </div>
        <p className="mt-1.5 text-[12px] text-muted-foreground">
          Pievieno tikai tās kolonnas, kuru vēl nav. Termiņš ir tikai četrām atskaitēm: Fiz.pers. paz. līdz 15., VSAOI līdz
          17., PVN un UIN līdz 20. Pārējām termiņa nav. Tukša termiņa diena nozīmē - bez termiņa.
        </p>
      </div>

      <ul className="space-y-1.5">
        {reportTypes.map((rt, i) => (
          <ColumnRow
            key={rt.id}
            reportType={rt}
            first={i === 0}
            last={i === reportTypes.length - 1}
            pending={pending}
            onSave={(data) => run(() => saveReportType(scope, { id: rt.id, ...data }))}
            onMove={(dir) => run(() => moveReportType(scope, rt.id, dir))}
          />
        ))}
      </ul>

      <form
        className="mt-3 flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          run(
            () => saveReportType(scope, { name: newName, dueDay: Number(newDay) || 0, active: true }),
            () => {
              setNewName("");
              setNewDay("");
            },
          );
        }}
      >
        <label className="grid gap-1 text-[12px] text-muted-foreground">
          Jauna kolonna
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            maxLength={40}
            placeholder="Piem., PVN"
            className="h-8 w-40 rounded-lg border border-input bg-background px-2 text-[13px] text-foreground"
          />
        </label>
        <label className="grid gap-1 text-[12px] text-muted-foreground">
          Termiņa diena
          <input
            type="number"
            min={1}
            max={31}
            value={newDay}
            onChange={(e) => setNewDay(e.target.value)}
            className="h-8 w-20 rounded-lg border border-input bg-background px-2 text-[13px] text-foreground"
          />
        </label>
        <Button type="submit" size="sm" disabled={pending || !newName.trim()} className="gap-1">
          <Plus className="h-3.5 w-3.5" />
          Pievienot
        </Button>
      </form>
    </section>
  );
}

function ColumnRow({
  reportType,
  first,
  last,
  pending,
  onSave,
  onMove,
}: {
  reportType: ReportType;
  first: boolean;
  last: boolean;
  pending: boolean;
  onSave: (data: { name: string; dueDay: number; active: boolean }) => void;
  onMove: (dir: "up" | "down") => void;
}) {
  const [name, setName] = useState(reportType.name);
  const [day, setDay] = useState(reportType.dueDay > 0 ? String(reportType.dueDay) : "");
  const dirty = name.trim() !== reportType.name || (Number(day) || 0) !== reportType.dueDay;

  return (
    <li className={cn(APPLE_FILL, "flex flex-wrap items-center gap-2 rounded-xl px-2.5 py-1.5", !reportType.active && "opacity-60")}>
      <div className="flex">
        <button
          type="button"
          disabled={first || pending}
          onClick={() => onMove("up")}
          className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
          aria-label={`Pārvietot ${reportType.name} pa kreisi`}
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          disabled={last || pending}
          onClick={() => onMove("down")}
          className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
          aria-label={`Pārvietot ${reportType.name} pa labi`}
        >
          <ArrowDown className="h-3.5 w-3.5" />
        </button>
      </div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={40}
        aria-label="Kolonnas nosaukums"
        className="h-8 w-40 rounded-lg border border-input bg-background px-2 text-[13px]"
      />
      <label className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
        līdz
        <input
          type="number"
          min={1}
          max={31}
          value={day}
          onChange={(e) => setDay(e.target.value)}
          placeholder="-"
          aria-label="Termiņa diena"
          className="h-8 w-16 rounded-lg border border-input bg-background px-2 text-[13px] text-foreground"
        />
        . datumam
      </label>
      {dirty && (
        <Button
          size="sm"
          variant="outline"
          disabled={pending || !name.trim()}
          onClick={() => onSave({ name, dueDay: Number(day) || 0, active: reportType.active })}
        >
          Saglabāt
        </Button>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() => onSave({ name: reportType.name, dueDay: reportType.dueDay, active: !reportType.active })}
        className="ml-auto text-[12px] text-muted-foreground underline-offset-4 hover:underline"
      >
        {reportType.active ? "Paslēpt" : "Rādīt atkal"}
      </button>
    </li>
  );
}

// ── Client x report matrix ─────────────────────────────────────────────────

function ClientMatrix({
  reportTypes,
  clients,
  people,
  scope,
  onError,
}: {
  reportTypes: ReportType[];
  clients: RegistryClient[];
  people: Person[];
  scope: RegistryScope;
  onError: (e: string | null) => void;
}) {
  const firm = scope === "firm";
  const [query, setQuery] = useState("");
  const [personFilter, setPersonFilter] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [needed, setNeeded] = useState(
    () => new Set(clients.flatMap((c) => c.reports.map((r) => `${c.id}:${r.reportTypeId}`))),
  );
  const [responsible, setResponsible] = useState<Record<string, string | null>>(
    () => Object.fromEntries(clients.map((c) => [c.id, c.responsibleUserId])),
  );
  const [openClientId, setOpenClientId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const nameById = useMemo(() => new Map(people.map((p) => [p.id, p.name])), [people]);

  const visible = clients.filter((c) => {
    if (!showInactive && !c.active) return false;
    if (query && !c.name.toLowerCase().includes(query.trim().toLowerCase())) return false;
    if (personFilter) {
      const owner = responsible[c.id] ?? c.fallbackUserId;
      if (personFilter === "none" ? owner : owner !== personFilter) return false;
    }
    return true;
  });

  function toggle(clientId: string, reportTypeId: string) {
    const key = `${clientId}:${reportTypeId}`;
    const next = !needed.has(key);
    onError(null);
    setNeeded((prev) => {
      const s = new Set(prev);
      if (next) s.add(key);
      else s.delete(key);
      return s;
    });
    startTransition(async () => {
      const result = await setClientReport(scope, clientId, reportTypeId, next);
      if (!result.ok) {
        onError(result.error);
        setNeeded((prev) => {
          const s = new Set(prev);
          if (next) s.delete(key);
          else s.add(key);
          return s;
        });
      }
    });
  }

  function changeResponsible(clientId: string, userId: string | null) {
    const before = responsible[clientId] ?? null;
    onError(null);
    setResponsible((prev) => ({ ...prev, [clientId]: userId }));
    startTransition(async () => {
      const result = await setClientResponsible(clientId, userId);
      if (!result.ok) {
        onError(result.error);
        setResponsible((prev) => ({ ...prev, [clientId]: before }));
      }
    });
  }

  const openClient = clients.find((c) => c.id === openClientId) ?? null;

  return (
    <section className={cn(METRIC_SURFACE, "overflow-hidden")}>
      <div className="flex flex-wrap items-center gap-2 border-b border-black/[0.07] px-4 py-3 dark:border-white/[0.07]">
        <div className="mr-auto font-display text-[15px] font-medium">Klienti un atskaites</div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Meklēt klientu"
          aria-label="Meklēt klientu"
          className="h-8 w-44 rounded-lg border border-input bg-background px-2 text-[13px]"
        />
        {firm && (
          <select value={personFilter} onChange={(e) => setPersonFilter(e.target.value)} className={selectClass} aria-label="Atbildīgais">
            <option value="">Visi atbildīgie</option>
            <option value="none">Nav norādīts</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
        <label className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
          Rādīt neaktīvos
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 min-w-[180px] border-b border-r border-black/[0.08] bg-white px-3 py-2 text-left font-medium text-muted-foreground dark:border-white/[0.08] dark:bg-card">
                Klients
              </th>
              {firm && (
                <th className="min-w-[170px] border-b border-r border-black/[0.08] px-2 py-2 text-left text-[12px] font-medium text-muted-foreground dark:border-white/[0.08]">
                  Atbildīgais
                </th>
              )}
              {reportTypes.map((rt) => (
                <th
                  key={rt.id}
                  className="min-w-[60px] border-b border-r border-black/[0.08] px-1.5 py-2 text-center text-[12px] font-medium leading-tight text-muted-foreground dark:border-white/[0.08]"
                >
                  {rt.name}
                  <span className="block text-[10px] font-normal">{rt.dueDay > 0 ? `līdz ${rt.dueDay}.` : "bez termiņa"}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((client) => {
              const owner = responsible[client.id] ?? null;
              const exceptions = new Map(client.reports.map((r) => [r.reportTypeId, r]));
              return (
                <tr key={client.id} className={cn(!client.active && "opacity-50")}>
                  <th
                    scope="row"
                    className="sticky left-0 z-10 border-b border-r border-black/[0.08] bg-white p-0 text-left font-medium dark:border-white/[0.08] dark:bg-card"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenClientId(client.id)}
                      className="block w-full truncate px-3 py-2 text-left hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                      title="Izņēmumi: cits atbildīgais, reizi ceturksnī, cits termiņš"
                    >
                      {client.name}
                    </button>
                  </th>
                  {firm && (
                  <td className="border-b border-r border-black/[0.08] px-2 py-1 dark:border-white/[0.08]">
                    <select
                      value={owner ?? ""}
                      onChange={(e) => changeResponsible(client.id, e.target.value || null)}
                      className={cn(selectClass, "w-full")}
                      aria-label={`${client.name} atbildīgais`}
                    >
                      <option value="">
                        {client.fallbackUserId
                          ? `(${nameById.get(client.fallbackUserId) ?? "piesaistītais"})`
                          : "Nav norādīts"}
                      </option>
                      {people.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  )}
                  {reportTypes.map((rt) => {
                    const on = needed.has(`${client.id}:${rt.id}`);
                    const ex = exceptions.get(rt.id);
                    const hasException = on && !!ex && (ex.responsibleUserId || ex.frequency === "quarterly" || ex.dueDay);
                    return (
                      <td key={rt.id} className="border-b border-r border-black/[0.08] p-0 dark:border-white/[0.08]">
                        <button
                          type="button"
                          onClick={() => toggle(client.id, rt.id)}
                          aria-pressed={on}
                          aria-label={`${client.name} ${rt.name}: ${on ? "vajag" : "nevajag"}`}
                          className={cn(
                            "relative flex h-10 w-full items-center justify-center text-[11px] transition-colors hover:ring-2 hover:ring-inset hover:ring-[#007AFF]/40",
                            on ? "bg-white dark:bg-transparent" : "bg-black/[0.12] dark:bg-white/[0.12]",
                          )}
                        >
                          {hasException && (
                            <span className="text-muted-foreground">{ex!.frequency === "quarterly" ? "cet." : "•"}</span>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        {visible.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">Nav klientu, kas atbilst filtram.</p>
        )}
      </div>
      <div className="border-t border-black/[0.07] px-4 py-2.5 text-[12px] text-muted-foreground dark:border-white/[0.07]">
        {firm
          ? "Balta šūna - atskaite vajadzīga, pelēka - nav. Klikšķis pārslēdz. Klienta nosaukums - izņēmumi (cits atbildīgais, reizi ceturksnī, cits termiņš). Uzdevumi redzami visiem klientam piesaistītajiem darbiniekiem."
          : "Šeit ir jūsu klienti (Tavi klienti). Balta šūna - atskaite vajadzīga, pelēka - nav. Klikšķis pārslēdz. Klienta nosaukums - izņēmumi (reizi ceturksnī, cits termiņš)."}
      </div>

      <ExceptionsDialog
        client={openClient}
        reportTypes={reportTypes}
        needed={needed}
        people={people}
        scope={scope}
        onClose={() => setOpenClientId(null)}
        onError={onError}
      />
    </section>
  );
}

function ExceptionsDialog({
  client,
  reportTypes,
  needed,
  people,
  scope,
  onClose,
  onError,
}: {
  client: RegistryClient | null;
  reportTypes: ReportType[];
  needed: Set<string>;
  people: Person[];
  scope: RegistryScope;
  onClose: () => void;
  onError: (e: string | null) => void;
}) {
  return (
    <Dialog.Root open={!!client} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] overflow-y-auto rounded-t-2xl border border-border bg-background p-5 shadow-xl focus:outline-none sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl">
          {client && (
            <>
              <Dialog.Title className="pr-8 font-display text-lg font-medium">{client.name}</Dialog.Title>
              <Dialog.Description className="mb-4 text-[13px] text-muted-foreground">
                Izņēmumi atsevišķām atskaitēm. Tukšs lauks - kā visiem.
              </Dialog.Description>
              <ul className="space-y-2">
                {reportTypes
                  .filter((rt) => needed.has(`${client.id}:${rt.id}`))
                  .map((rt) => (
                    <ExceptionRow
                      key={rt.id}
                      clientId={client.id}
                      reportType={rt}
                      settings={client.reports.find((r) => r.reportTypeId === rt.id)}
                      people={people}
                      scope={scope}
                      onError={onError}
                    />
                  ))}
              </ul>
              {reportTypes.every((rt) => !needed.has(`${client.id}:${rt.id}`)) && (
                <p className="text-sm text-muted-foreground">Šim klientam nav atzīmētu atskaišu.</p>
              )}
            </>
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

function ExceptionRow({
  clientId,
  reportType,
  settings,
  people,
  scope,
  onError,
}: {
  clientId: string;
  reportType: ReportType;
  settings?: ClientReportSettings;
  people: Person[];
  scope: RegistryScope;
  onError: (e: string | null) => void;
}) {
  const [responsibleUserId, setResponsibleUserId] = useState(settings?.responsibleUserId ?? "");
  const [frequency, setFrequency] = useState(settings?.frequency === "quarterly" ? "quarterly" : "monthly");
  const [dueDay, setDueDay] = useState(settings?.dueDay ? String(settings.dueDay) : "");
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function save() {
    onError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateClientReport(scope, clientId, reportType.id, {
        responsibleUserId: responsibleUserId || null,
        frequency: frequency as "monthly" | "quarterly",
        dueDay: dueDay ? Number(dueDay) : null,
      });
      if (result.ok) setSaved(true);
      else onError(result.error);
    });
  }

  return (
    <li className={cn(APPLE_FILL, "rounded-xl p-3")}>
      <div className="mb-2 text-[14px] font-medium">{reportType.name}</div>
      <div className="flex flex-wrap items-end gap-2">
        {scope === "firm" && (
          <label className="grid gap-1 text-[12px] text-muted-foreground">
            Atbildīgais
            <select value={responsibleUserId} onChange={(e) => setResponsibleUserId(e.target.value)} className={selectClass}>
              <option value="">Kā klientam</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="grid gap-1 text-[12px] text-muted-foreground">
          Biežums
          <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className={selectClass}>
            <option value="monthly">Katru mēnesi</option>
            <option value="quarterly">Reizi ceturksnī</option>
          </select>
        </label>
        <label className="grid gap-1 text-[12px] text-muted-foreground">
          Termiņa diena
          <input
            type="number"
            min={1}
            max={31}
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
            placeholder={String(reportType.dueDay)}
            className="h-8 w-20 rounded-lg border border-input bg-background px-2 text-[13px] text-foreground"
          />
        </label>
        <Button size="sm" variant="outline" onClick={save} disabled={pending}>
          {pending ? "Saglabā..." : "Saglabāt"}
        </Button>
        {saved && <span className="pb-1.5 text-[12px] text-muted-foreground">Saglabāts</span>}
      </div>
      {frequency === "quarterly" && (
        <p className="mt-2 text-[12px] text-muted-foreground">
          Ceturkšņa atskaites uzdevums izveidojas janvārī, aprīlī, jūlijā un oktobrī.
        </p>
      )}
    </li>
  );
}
