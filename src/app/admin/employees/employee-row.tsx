"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { updateEmployee, deleteEmployee } from "./actions";
import { Pencil, Trash2, X, Check } from "lucide-react";

interface Manager {
  id: string;
  name: string;
}

interface EmployeeRowProps {
  id: string;
  name: string;
  email: string;
  title: string | null;
  managerId: string | null;
  managerName: string | null;
  entryCount: number;
  managers: Manager[];
}

export function EmployeeRow({
  id, name, email, title, managerId, managerName, entryCount, managers,
}: EmployeeRowProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"view" | "edit" | "delete">("view");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleEdit(formData: FormData) {
    setError(null);
    if (formData.get("managerId") === "self") formData.set("managerId", "");
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
      <tr>
        <td colSpan={5} className="px-6 py-4">
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
              <div className="grid gap-1.5">
                <Label htmlFor={`manager-${id}`}>Vadītājs</Label>
                <Select name="managerId" defaultValue={managerId ?? "self"}>
                  <SelectTrigger id={`manager-${id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self">Es pats (administrators)</SelectItem>
                    {managers.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td className="px-6 py-3">
        <div className="font-medium leading-snug">{name}</div>
        <div className="text-xs text-muted-foreground">{email}</div>
      </td>
      <td className="px-6 py-3 text-muted-foreground">{title ?? "—"}</td>
      <td className="px-6 py-3 text-muted-foreground">
        {managerName ?? <span className="text-xs italic">Nav vadītāja (jūs)</span>}
      </td>
      <td className="px-6 py-3 text-right tabular-nums text-muted-foreground">
        {entryCount}
      </td>
      <td className="px-4 py-3">
        {mode === "delete" ? (
          <div className="flex items-center justify-end gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Dzēst?</span>
            <Button size="sm" variant="destructive" onClick={handleDelete} disabled={pending}>
              {pending ? "Dzēš..." : "Jā"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setMode("view"); setError(null); }} disabled={pending}>
              Nē
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-1">
            <Button size="icon" variant="ghost" onClick={() => setMode("edit")} title="Rediģēt">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setMode("delete")} title="Dzēst" className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        {error && mode === "view" && <div className="text-xs text-destructive mt-1 text-right">{error}</div>}
      </td>
    </tr>
  );
}
