"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { updateRole, deleteRole, addDuty, deleteDuty, assignRole } from "./actions";
import { Pencil, Trash2, Plus, X, Check, UserPlus } from "lucide-react";

interface Duty { id: string; text: string }
interface Employee { id: string; name: string; workRoleId: string | null }

interface RoleCardProps {
  id: string;
  name: string;
  description: string | null;
  duties: Duty[];
  assignedEmployees: Employee[];
  allEmployees: Employee[];
}

export function RoleCard({ id, name, description, duties, assignedEmployees, allEmployees }: RoleCardProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [newDuty, setNewDuty] = useState("");
  const dutyInputRef = useRef<HTMLInputElement>(null);

  const unassigned = allEmployees.filter(e => e.workRoleId !== id);

  function handleUpdate(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await updateRole(id, formData);
      if (!res.ok) setError(res.error);
      else { setEditing(false); router.refresh(); }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteRole(id);
      router.refresh();
    });
  }

  function handleAddDuty() {
    if (!newDuty.trim()) return;
    startTransition(async () => {
      const res = await addDuty(id, newDuty);
      if (res.ok) { setNewDuty(""); router.refresh(); dutyInputRef.current?.focus(); }
    });
  }

  function handleDeleteDuty(dutyId: string) {
    startTransition(async () => {
      await deleteDuty(dutyId);
      router.refresh();
    });
  }

  function handleAssign(employeeId: string) {
    startTransition(async () => {
      await assignRole(employeeId, id);
      router.refresh();
    });
  }

  function handleUnassign(employeeId: string) {
    startTransition(async () => {
      await assignRole(employeeId, null);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardContent className="p-5 space-y-4">

        {/* Header */}
        {editing ? (
          <form action={handleUpdate} className="space-y-3">
            <div className="grid gap-1.5">
              <Label htmlFor={`rname-${id}`}>Lomas nosaukums</Label>
              <Input id={`rname-${id}`} name="name" defaultValue={name} required maxLength={100} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor={`rdesc-${id}`}>Apraksts</Label>
              <Input id={`rdesc-${id}`} name="description" defaultValue={description ?? ""} maxLength={500} placeholder="Īss lomas apraksts (nav obligāts)" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={pending}><Check className="h-3.5 w-3.5" /> Saglabāt</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)} disabled={pending}><X className="h-3.5 w-3.5" /> Atcelt</Button>
            </div>
          </form>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-semibold text-base">{name}</div>
              {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
            </div>
            <div className="flex gap-1 shrink-0">
              <Button size="icon" variant="ghost" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={handleDelete} disabled={pending}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        )}

        {/* Duties */}
        <div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Officiālie pienākumi</div>
          {duties.length === 0 && (
            <p className="text-sm text-muted-foreground italic mb-2">Vēl nav pievienoti pienākumi.</p>
          )}
          <ul className="space-y-1.5 mb-3">
            {duties.map(d => (
              <li key={d.id} className="flex items-center gap-2 text-sm group">
                <span className="flex-1 leading-snug">{d.text}</span>
                <button
                  onClick={() => handleDeleteDuty(d.id)}
                  disabled={pending}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <Input
              ref={dutyInputRef}
              value={newDuty}
              onChange={e => setNewDuty(e.target.value)}
              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAddDuty())}
              placeholder="Pievienot pienākumu..."
              maxLength={300}
              className="h-8 text-sm"
            />
            <Button size="sm" variant="outline" onClick={handleAddDuty} disabled={pending || !newDuty.trim()}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Assigned employees */}
        <div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Darbinieki ar šo lomu
          </div>
          {assignedEmployees.length === 0 ? (
            <p className="text-sm text-muted-foreground italic mb-2">Nav piešķirts nevienam darbiniekam.</p>
          ) : (
            <div className="flex flex-wrap gap-2 mb-2">
              {assignedEmployees.map(e => (
                <Badge key={e.id} variant="muted" className="flex items-center gap-1.5 pr-1">
                  {e.name}
                  <button onClick={() => handleUnassign(e.id)} disabled={pending} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          {unassigned.length > 0 && (
            <div className="flex items-center gap-2">
              <UserPlus className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <select
                className="h-8 w-full rounded-md border border-input bg-background text-sm px-2 text-muted-foreground"
                defaultValue=""
                onChange={e => { if (e.target.value) handleAssign(e.target.value); e.target.value = ""; }}
                disabled={pending}
              >
                <option value="" disabled>Piešķirt darbinieku...</option>
                {unassigned.map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  );
}
