"use client";

import { useState, useTransition } from "react";
import { extendTrial, setTrialExpired, updateOrg, deleteOrg } from "./actions";

interface OrgRowProps {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  trialEndsAt: Date | null;
  daysLeft: number | null;
  expired: boolean;
  admins: number;
  managers: number;
  employees: number;
  entryCount: number;
}

export function OrgRow(props: OrgRowProps) {
  const [mode, setMode] = useState<"view" | "edit" | "delete">("view");
  const [pending, startTransition] = useTransition();

  // Edit state
  const [editName, setEditName] = useState(props.name);
  const [editTrial, setEditTrial] = useState(
    props.trialEndsAt ? props.trialEndsAt.toISOString().slice(0, 10) : ""
  );

  const { id, name, slug, createdAt, trialEndsAt, daysLeft, expired, admins, managers, employees, entryCount } = props;

  function handleExtend() {
    startTransition(async () => { await extendTrial(id, 30); });
  }
  function handleExpire() {
    startTransition(async () => { await setTrialExpired(id); });
  }
  function handleSave() {
    startTransition(async () => {
      await updateOrg(id, { name: editName, trialEndsAt: editTrial || null });
      setMode("view");
    });
  }
  function handleDelete() {
    startTransition(async () => { await deleteOrg(id); });
  }

  const trialBadge = (() => {
    if (!trialEndsAt) return <span className="text-xs text-muted-foreground">Bez ierobežojuma</span>;
    if (expired) return <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 text-xs font-medium">Beidzies</span>;
    if (daysLeft !== null && daysLeft <= 7) return <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 text-xs font-medium">{daysLeft === 0 ? "Beidzas šodien" : `${daysLeft} d. atlicis`}</span>;
    return <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 text-xs font-medium">{daysLeft} d. atlicis</span>;
  })();

  const trialDate = trialEndsAt
    ? trialEndsAt.toLocaleDateString("lv-LV", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "—";
  const createdDate = createdAt.toLocaleDateString("lv-LV", { day: "2-digit", month: "2-digit", year: "numeric" });

  // ── EDIT MODE ──────────────────────────────────────────────
  if (mode === "edit") {
    return (
      <tr className="bg-muted/20">
        <td className="px-5 py-3" colSpan={6}>
          <div className="flex flex-wrap items-end gap-4">
            <div className="grid gap-1">
              <label className="text-xs text-muted-foreground">Nosaukums</label>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-8 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring w-52"
              />
            </div>
            <div className="grid gap-1">
              <label className="text-xs text-muted-foreground">Izmēģinājums līdz (tukšs = bez ierobežojuma)</label>
              <input
                type="date"
                value={editTrial}
                onChange={(e) => setEditTrial(e.target.value)}
                className="h-8 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="flex items-center gap-2 pb-0.5">
              <button
                onClick={handleSave}
                disabled={pending || !editName.trim()}
                className="text-xs font-medium text-primary underline-offset-4 hover:underline disabled:opacity-50"
              >
                {pending ? "Saglabā..." : "Saglabāt"}
              </button>
              <button
                onClick={() => { setEditName(name); setEditTrial(trialEndsAt ? trialEndsAt.toISOString().slice(0, 10) : ""); setMode("view"); }}
                className="text-xs text-muted-foreground underline-offset-4 hover:underline"
              >
                Atcelt
              </button>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  // ── VIEW / DELETE MODE ─────────────────────────────────────
  return (
    <tr className={`transition-colors ${mode === "delete" ? "bg-red-500/5" : "hover:bg-muted/30"}`}>
      <td className="px-5 py-3">
        <div className="font-medium">{name}</div>
        <div className="text-xs text-muted-foreground">/{slug}</div>
      </td>
      <td className="px-5 py-3 text-muted-foreground">{createdDate}</td>
      <td className="px-5 py-3">
        <div>{trialBadge}</div>
        {trialEndsAt && <div className="text-xs text-muted-foreground mt-0.5">līdz {trialDate}</div>}
      </td>
      <td className="px-5 py-3 text-center">
        <div className="text-sm">{admins + managers + employees}</div>
        <div className="text-xs text-muted-foreground">{admins}a · {managers}v · {employees}d</div>
      </td>
      <td className="px-5 py-3 text-center text-sm">{entryCount}</td>
      <td className="px-5 py-3">
        {mode === "delete" ? (
          <div className="flex items-center gap-2 justify-end">
            <span className="text-xs text-muted-foreground">Dzēst visu?</span>
            <button
              onClick={handleDelete}
              disabled={pending}
              className="text-xs font-medium text-red-500 underline-offset-4 hover:underline disabled:opacity-50"
            >
              {pending ? "Dzēš..." : "Jā, dzēst"}
            </button>
            <button
              onClick={() => setMode("view")}
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              Nē
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={handleExtend}
              disabled={pending}
              className="text-xs font-medium text-primary underline-offset-4 hover:underline disabled:opacity-50"
            >
              +30 dienas
            </button>
            {!expired && trialEndsAt && (
              <button
                onClick={handleExpire}
                disabled={pending}
                className="text-xs text-muted-foreground underline-offset-4 hover:underline hover:text-destructive disabled:opacity-50"
              >
                Beigt
              </button>
            )}
            <button
              onClick={() => setMode("edit")}
              className="text-xs text-muted-foreground underline-offset-4 hover:underline hover:text-foreground"
            >
              Rediģēt
            </button>
            <button
              onClick={() => setMode("delete")}
              className="text-xs text-muted-foreground underline-offset-4 hover:underline hover:text-destructive"
            >
              Dzēst
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
