"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createRole } from "./actions";

export function CreateRoleForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createRole(formData);
      if (!res.ok) setError(res.error);
      else {
        (document.getElementById("create-role") as HTMLFormElement)?.reset();
        router.refresh();
      }
    });
  }

  return (
    <form id="create-role" action={onSubmit} className="space-y-3">
      <div className="grid gap-1.5">
        <Label htmlFor="name">Nosaukums</Label>
        <Input id="name" name="name" required maxLength={100} placeholder="piem., Grāmatvedis" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="description">Apraksts (nav obligāts)</Label>
        <Input id="description" name="description" maxLength={500} placeholder="Īss lomas apraksts" />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Veido..." : "Izveidot lomu"}
      </Button>
    </form>
  );
}
