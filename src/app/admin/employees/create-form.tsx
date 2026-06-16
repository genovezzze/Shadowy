"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail } from "lucide-react";
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
  const [managerId, setManagerId] = useState("self");

  function onSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    if (formData.get("managerId") === "self") formData.set("managerId", "");
    startTransition(async () => {
      const res = await createEmployee(formData);
      if (!res.ok) setError(res.error);
      else {
        setSuccess(true);
        setManagerId("self");
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
      {managers.length === 0 ? (
        <div className="rounded-md bg-muted/50 border border-border px-3 py-2 text-xs text-muted-foreground">
          Šī darbinieka ierakstus pārskatīsiet jūs kā administrators.
          <input type="hidden" name="managerId" value="" />
        </div>
      ) : (
        <div className="grid gap-1.5">
          <Label htmlFor="emp-manager">Kurš pārskatīs ierakstus?</Label>
          <Select name="managerId" value={managerId} onValueChange={setManagerId}>
            <SelectTrigger id="emp-manager">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="self">Es pats (administrators)</SelectItem>
              {managers.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name} (vadītājs)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {error ? <div className="text-sm text-destructive">{error}</div> : null}
      {success ? (
        <div className="flex items-center gap-2 text-sm text-success">
          <Mail className="h-4 w-4" />
          Uzaicinājums nosūtīts uz darbinieka e-pastu.
        </div>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Saglabā..." : "Izveidot darbinieku"}
      </Button>
    </form>
  );
}
