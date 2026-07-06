"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { linkEntriesToClients, importClientsFromEntries } from "@/app/admin/clients/link-actions";
import { Link2, Download, CheckCircle2 } from "lucide-react";

export function LinkEntriesButton() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  function handleLink() {
    startTransition(async () => {
      const res = await linkEntriesToClients();
      if (res.ok) {
        setResult(`Saistīti ${res.linked} ieraksti${res.skipped > 0 ? ` · ${res.skipped} nav atrasts` : ""}`);
      }
    });
  }

  function handleImport() {
    startTransition(async () => {
      const res = await importClientsFromEntries();
      if (res.ok) {
        setResult(`Izveidoti ${res.created} jauni klienti, visi ieraksti saistīti`);
      }
    });
  }

  if (result) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-emerald-500">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        {result}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleImport} disabled={isPending}>
        <Download className="h-4 w-4" />
        {isPending ? "Apstrādā..." : "Importēt klientus no ierakstiem"}
      </Button>
      <Button variant="ghost" size="sm" onClick={handleLink} disabled={isPending}>
        <Link2 className="h-4 w-4" />
        {isPending ? "Saista..." : "Saistīt pēc nosaukuma"}
      </Button>
    </div>
  );
}
