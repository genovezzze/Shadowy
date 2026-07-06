"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { updateManager, deleteManager } from "./actions";
import { Pencil, Trash2, X, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ManagerCardProps {
  id: string;
  name: string;
  email: string;
  title: string | null;
  employeeCount: number;
  registered: boolean;
}

export function ManagerCard({ id, name, email, title, employeeCount, registered }: ManagerCardProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"view" | "edit" | "delete">("view");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleEdit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await updateManager(id, formData);
      if (!res.ok) setError(res.error);
      else { setMode("view"); router.refresh(); }
    });
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteManager(id);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  if (mode === "edit") {
    return (
      <Card>
        <CardContent className="p-5">
          <form action={handleEdit} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor={`name-${id}`}>Vārds un uzvārds</Label>
                <Input id={`name-${id}`} name="name" defaultValue={name} required maxLength={80} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor={`title-${id}`}>Amats</Label>
                <Input id={`title-${id}`} name="title" defaultValue={title ?? ""} maxLength={80} placeholder="Komandas vadītājs" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor={`email-${id}`}>E-pasts</Label>
                <Input id={`email-${id}`} name="email" type="email" defaultValue={email} required />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor={`password-${id}`}>Jauna parole</Label>
                <PasswordInput id={`password-${id}`} name="password" minLength={8} placeholder="Atstājiet tukšu, ja nemainīt" />
              </div>
            </div>
            {error && <div className="text-sm text-destructive">{error}</div>}
            <div className="flex items-center gap-2 justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={() => { setMode("view"); setError(null); }} disabled={pending}>
                <X className="h-4 w-4" /> Atcelt
              </Button>
              <Button type="submit" size="sm" disabled={pending}>
                <Check className="h-4 w-4" /> {pending ? "Saglabā..." : "Saglabāt"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold truncate">{name}</div>
            {registered ? (
              <Badge variant="success" className="shrink-0 text-[11px] px-1.5 py-0">Reģistrējies</Badge>
            ) : (
              <Badge variant="warning" className="shrink-0 text-[11px] px-1.5 py-0">Nav reģistrējies</Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {email}{title ? ` · ${title}` : ""}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Darbinieki: {employeeCount}
          </div>
        </div>
        {mode === "delete" ? (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground">Dzēst?</span>
            <Button size="sm" variant="destructive" onClick={handleDelete} disabled={pending}>
              {pending ? "Dzēš..." : "Jā, dzēst"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setMode("view"); setError(null); }} disabled={pending}>
              Nē
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-1 shrink-0">
            <Button size="icon" variant="ghost" onClick={() => setMode("edit")} title="Rediģēt">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setMode("delete")} title="Dzēst" className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        {error && mode === "view" && <div className="text-xs text-destructive">{error}</div>}
      </CardContent>
    </Card>
  );
}
