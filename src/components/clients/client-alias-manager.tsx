"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addClientAlias, deleteClientAlias } from "@/app/manager/clients/alias-actions";

interface AliasItem {
  id: string;
  name: string;
}

export function ClientAliasManager({
  clientId,
  clientName,
  aliases: initial,
}: {
  clientId: string;
  clientName: string;
  aliases: AliasItem[];
}) {
  const [aliases, setAliases] = useState<AliasItem[]>(initial);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();
  const [isDeleting, startDeleting] = useTransition();

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setError(null);
    setInfo(null);
    startSaving(async () => {
      const res = await addClientAlias({ clientId, name: trimmed });
      if (res.ok) {
        setName("");
        setAdding(false);
        if (res.linked > 0) {
          setInfo(`Pievienots. Piesaistīti ${res.linked} esošie ieraksti.`);
        }
        // Refresh to reflect merged stats/entries on the page.
        window.location.reload();
      } else {
        setError(res.error);
      }
    });
  }

  function remove(id: string) {
    startDeleting(async () => {
      const res = await deleteClientAlias(id);
      if (res.ok) {
        setAliases((prev) => prev.filter((a) => a.id !== id));
      }
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Alternatīvie nosaukumi</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Ieraksti ar šādu rakstību tiks ieskaitīti šim klientam. Noder, ja darbinieki
        raksta nosaukumu dažādi (piem., citā locījumā vai ar “SIA”).
      </p>

      {aliases.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {aliases.map((a) => (
            <span
              key={a.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs"
            >
              {a.name}
              <button
                type="button"
                onClick={() => remove(a.id)}
                disabled={isDeleting}
                className="text-muted-foreground hover:text-destructive disabled:opacity-50"
                title="Noņemt nosaukuma variantu"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {info && <p className="text-xs text-emerald-500">{info}</p>}

      {adding ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              placeholder={`piem., SIA "${clientName}"`}
              className="h-8 text-sm"
              autoFocus
            />
            <Button size="sm" onClick={submit} disabled={isSaving || !name.trim()}>
              {isSaving ? "Saglabā..." : "Pievienot"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setAdding(false);
                setName("");
                setError(null);
              }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      ) : (
        <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
          <Plus className="h-3.5 w-3.5" /> Pievienot nosaukuma variantu
        </Button>
      )}
    </div>
  );
}
