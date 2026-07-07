"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { updateEmployee, deleteEmployee } from "./actions";
import { Pencil, Trash2, X, Check, Briefcase } from "lucide-react";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

interface EmployeeCardProps {
  id: string;
  name: string;
  email: string;
  title: string | null;
  entryCount: number;
  workRoleName?: string | null;
}

export function EmployeeCard({ id, name, email, title, entryCount, workRoleName }: EmployeeCardProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"view" | "edit" | "delete">("view");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleEdit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await updateEmployee(id, formData);
      if (!res.ok) setError(res.error);
      else { setMode("view"); router.refresh(); }
    });
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteEmployee(id);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  if (mode === "edit") {
    return (
      <Card className="relative overflow-hidden p-0">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent dark:block hidden" />
        <CardContent className="p-5">
          <form action={handleEdit} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor={`name-${id}`}>Vārds un uzvārds</Label>
                <Input id={`name-${id}`} name="name" defaultValue={name} required maxLength={80} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor={`title-${id}`}>Amats</Label>
                <Input id={`title-${id}`} name="title" defaultValue={title ?? ""} maxLength={80} placeholder="Klientu konsultants" />
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
    <Card className="relative overflow-hidden p-0">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent dark:block hidden" />
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-semibold text-emerald-400 ring-1 ring-emerald-500/20">
          {initials(name)}
        </div>
        <div className="min-w-0 flex-1">
          <Link
            href={`/manager/employee/${id}`}
            className="text-sm font-semibold hover:underline underline-offset-4"
          >
            {name}
          </Link>
          <div className="text-xs text-muted-foreground">
            {email}{title ? ` · ${title}` : ""}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-muted-foreground">Ieraksti: {entryCount}</span>
            {workRoleName && (
              <span className="inline-flex items-center gap-1 text-xs text-primary/70 bg-primary/10 rounded-full px-2 py-0.5">
                <Briefcase className="h-3 w-3" />
                {workRoleName}
              </span>
            )}
          </div>
          {error && mode === "view" && <div className="text-xs text-destructive mt-1">{error}</div>}
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
            <Button size="icon" variant="ghost" onClick={() => setMode("delete")} title="Dzēst" className="text-destructive hover:text-destructive dark:hover:bg-red-500/10">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
