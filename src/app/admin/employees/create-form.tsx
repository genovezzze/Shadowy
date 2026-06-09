"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createEmployee } from "./actions";

interface Manager {
  id: string;
  name: string;
}

interface CreateEmployeeFormProps {
  managers: Manager[];
}

export function CreateEmployeeForm({ managers }: CreateEmployeeFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function onSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const res = await createEmployee(formData);
      if (!res.ok) setError(res.error);
      else {
        setSuccess(true);
        (document.getElementById("admin-create-employee") as HTMLFormElement)?.reset();
        router.refresh();
      }
    });
  }

  return (
    <form id="admin-create-employee" action={onSubmit} className="space-y-3">
      <div className="grid gap-1.5">
        <Label htmlFor="emp-name">Vārds un uzvārds</Label>
        <Input id="emp-name" name="name" required maxLength={80} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="emp-title">Amats (nav obligāts)</Label>
        <Input id="emp-title" name="title" maxLength={80} placeholder="Klientu konsultants" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="emp-email">E-pasts</Label>
        <Input id="emp-email" name="email" type="email" required />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="emp-password">Sākotnējā parole</Label>
        <Input
          id="emp-password"
          name="password"
          type="text"
          required
          minLength={8}
          placeholder="Vismaz 8 simboli"
        />
        <p className="text-xs text-muted-foreground">
          Parole tiks paziņota darbiniekam. Viņš to varēs nomainīt vēlāk.
        </p>
      </div>
      {managers.length === 0 ? (
        <div className="rounded-md bg-muted/50 border border-border px-3 py-2 text-xs text-muted-foreground">
          Šī darbinieka ierakstus pārskatīsiet jūs kā administrators.
          <input type="hidden" name="managerId" value="" />
        </div>
      ) : (
        <div className="grid gap-1.5">
          <Label htmlFor="emp-manager">Kurš pārskatīs ierakstus?</Label>
          <select
            id="emp-manager"
            name="managerId"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Es pats (administrators)</option>
            {managers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} (vadītājs)
              </option>
            ))}
          </select>
        </div>
      )}
      {error ? <div className="text-sm text-destructive">{error}</div> : null}
      {success ? <div className="text-sm text-success">Darbinieks ir pievienots.</div> : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Saglabā..." : "Izveidot darbinieku"}
      </Button>
    </form>
  );
}
