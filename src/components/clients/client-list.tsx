"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Building2, Plus, Pencil, Trash2, Check, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { formatDurationLV } from "@/lib/utils";
import { upsertClient, deleteClient, toggleClientStatus } from "@/app/manager/clients/actions";
import { AssignEmployeesDialog } from "./assign-employees-dialog";

interface Employee {
  id: string;
  name: string;
  email: string;
}

interface ClientItem {
  id: string;
  name: string;
  freeMinutesPerMonth: number | null;
  totalMinutes: number;
  status: string;
  assignedEmployeeIds: string[];
}

function fmtLimit(minutes: number | null) {
  if (minutes === null) return "Nav limits";
  if (minutes === 0) return "0 min (viss apmaksājams)";
  return formatDurationLV(minutes);
}

function ClientRow({
  client,
  employees,
  onDeleted,
}: {
  client: ClientItem;
  employees: Employee[];
  onDeleted: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(client.name);
  const [limitStr, setLimitStr] = useState(
    client.freeMinutesPerMonth !== null ? String(client.freeMinutesPerMonth) : ""
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();
  const [isDeleting, startDeleting] = useTransition();
  const [isToggling, startToggling] = useTransition();

  const isActive = client.status === "active";

  function toggleStatus() {
    startToggling(async () => {
      await toggleClientStatus(client.id);
    });
  }

  const overrunMinutes =
    client.freeMinutesPerMonth !== null
      ? Math.max(0, client.totalMinutes - client.freeMinutesPerMonth)
      : 0;

  function save() {
    const limit = limitStr.trim() === "" ? null : parseInt(limitStr, 10);
    if (limitStr.trim() !== "" && (isNaN(limit!) || limit! < 0)) {
      setError("Laikam jābūt pozitīvam skaitlim.");
      return;
    }
    startSaving(async () => {
      const res = await upsertClient({ id: client.id, name: name.trim(), freeMinutesPerMonth: limit });
      if (res.ok) { setEditing(false); setError(null); }
      else setError(res.error);
    });
  }

  function remove() {
    startDeleting(async () => {
      await deleteClient(client.id);
      onDeleted();
    });
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Nosaukums</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Bezmaksas min./mēnesī (tukšs = bez limita)</Label>
            <Input
              type="number"
              min={0}
              value={limitStr}
              onChange={(e) => setLimitStr(e.target.value)}
              placeholder="Nav limits"
              className="h-8 text-sm"
            />
          </div>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Button size="sm" onClick={save} disabled={isSaving}>
            <Check className="h-3.5 w-3.5" /> {isSaving ? "Saglabā..." : "Saglabāt"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setError(null); }}>
            <X className="h-3.5 w-3.5" /> Atcelt
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-4 rounded-xl border bg-card p-4 transition-opacity ${isActive ? "border-border" : "border-border/50 opacity-60"}`}>
      <Building2 className="h-5 w-5 shrink-0 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{client.name}</span>
          <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${isActive ? "bg-emerald-500/15 text-emerald-500" : "bg-muted text-muted-foreground"}`}>
            {isActive ? "Aktīvs" : "Neaktīvs"}
          </span>
        </div>
        <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
          <span>Limits: {fmtLimit(client.freeMinutesPerMonth)}</span>
          <span>Kopā ierakstīts: {formatDurationLV(client.totalMinutes)}</span>
          {overrunMinutes > 0 && (
            <span className="text-amber-500 font-medium">
              Pārsniegums: {formatDurationLV(overrunMinutes)} · ~€{Math.round((overrunMinutes / 60) * 20)}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">
        <AssignEmployeesDialog
          clientId={client.id}
          clientName={client.name}
          employees={employees}
          assignedIds={client.assignedEmployeeIds}
        />
        <Button asChild size="sm" variant="ghost">
          <Link href={`/manager/clients/${client.id}`}>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={toggleStatus}
          disabled={isToggling}
          title={isActive ? "Deaktivizēt klientu" : "Aktivizēt klientu"}
        >
          {isActive ? <X className="h-3.5 w-3.5 text-muted-foreground" /> : <Check className="h-3.5 w-3.5 text-emerald-500" />}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={remove}
          disabled={isDeleting}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function AddClientForm({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [limitStr, setLimitStr] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit() {
    const limit = limitStr.trim() === "" ? null : parseInt(limitStr, 10);
    if (limitStr.trim() !== "" && (isNaN(limit!) || limit! < 0)) {
      setError("Laikam jābūt pozitīvam skaitlim.");
      return;
    }
    startTransition(async () => {
      const res = await upsertClient({ name: name.trim(), freeMinutesPerMonth: limit });
      if (res.ok) {
        setName(""); setLimitStr(""); setOpen(false); setError(null);
        onAdded();
      } else {
        setError(res.error);
      }
    });
  }

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Pievienot klientu
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="text-sm font-medium">Jauns klients</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Nosaukums</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="SIA Piemērs"
            className="h-8 text-sm"
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Bezmaksas min./mēnesī (tukšs = bez limita)</Label>
          <Input
            type="number"
            min={0}
            value={limitStr}
            onChange={(e) => setLimitStr(e.target.value)}
            placeholder="piem. 60"
            className="h-8 text-sm"
          />
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" onClick={submit} disabled={isPending || !name.trim()}>
          {isPending ? "Saglabā..." : "Pievienot"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => { setOpen(false); setError(null); }}>
          Atcelt
        </Button>
      </div>
    </div>
  );
}

export function ClientList({
  clients: initial,
  employees = [],
}: {
  clients: ClientItem[];
  employees?: Employee[];
}) {
  const [clients, setClients] = useState(initial);

  return (
    <div className="space-y-3">
      <AddClientForm onAdded={() => window.location.reload()} />
      {clients.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Nav pievienotu klientu. Pievienojiet pirmo klientu, lai izsekotu laiku un limitus.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {clients.map((c) => (
            <ClientRow
              key={c.id}
              client={c}
              employees={employees}
              onDeleted={() => setClients((prev) => prev.filter((x) => x.id !== c.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
