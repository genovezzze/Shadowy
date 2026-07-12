"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createAnnouncement } from "./actions";

export function CreateAnnouncementForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createAnnouncement(formData);
      if (!res.ok) setError(res.error);
      else {
        (document.getElementById("admin-create-announcement") as HTMLFormElement)?.reset();
        router.refresh();
      }
    });
  }

  return (
    <form id="admin-create-announcement" action={onSubmit} className="space-y-3">
      <div className="grid gap-1.5">
        <Label htmlFor="ann-title">Virsraksts</Label>
        <Input
          id="ann-title"
          name="title"
          required
          maxLength={150}
          placeholder="Jauna funkcija: nedēļas kopsavilkums"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="ann-body">Teksts</Label>
        <Textarea
          id="ann-body"
          name="body"
          required
          maxLength={2000}
          rows={6}
          placeholder="Aprakstiet, kas mainījies un kāpēc tas ir svarīgi..."
        />
      </div>
      {error ? <div className="text-sm text-destructive">{error}</div> : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Publicē..." : "Publicēt paziņojumu"}
      </Button>
    </form>
  );
}
