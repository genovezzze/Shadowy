"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createManager } from "./actions";

export function CreateManagerForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const res = await createManager(formData);
      if (!res.ok) setError(res.error);
      else {
        setSuccess(true);
        (document.getElementById("create-manager") as HTMLFormElement)?.reset();
        router.refresh();
      }
    });
  }

  return (
    <form id="create-manager" action={onSubmit} className="space-y-3">
      <div className="grid gap-1.5">
        <Label htmlFor="name">Vārds un uzvārds</Label>
        <Input id="name" name="name" required maxLength={80} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="title">Amats (nav obligāts)</Label>
        <Input id="title" name="title" maxLength={80} placeholder="Komandas vadītājs" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="email">E-pasts</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="password">Sākotnējā parole</Label>
        <Input
          id="password"
          name="password"
          type="text"
          required
          minLength={8}
          placeholder="Vismaz 8 simboli"
        />
        <p className="text-xs text-muted-foreground">
          Parole tiks paziņota vadītājam. Viņš to varēs nomainīt vēlāk.
        </p>
      </div>
      {error ? (
        <div className="text-sm text-destructive">{error}</div>
      ) : null}
      {success ? (
        <div className="text-sm text-success">Vadītājs ir pievienots.</div>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Saglabā..." : "Izveidot vadītāju"}
      </Button>
    </form>
  );
}
