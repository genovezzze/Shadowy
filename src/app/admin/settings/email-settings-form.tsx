"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateEmailSettings } from "./actions";

interface EmailSettingsFormProps {
  emailOnNewEntry: boolean;
  emailOnEntryApproved: boolean;
  emailWeeklySummary: boolean;
  emailDailyReminder: boolean;
}

function Toggle({
  id,
  checked,
  onChange,
  label,
  description,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-border last:border-0">
      <div className="flex-1">
        <label htmlFor={id} className="text-sm font-medium cursor-pointer">
          {label}
        </label>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mt-0.5 ${
          checked ? "bg-foreground" : "bg-muted-foreground/30"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-background shadow-sm transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export function EmailSettingsForm({
  emailOnNewEntry: initNewEntry,
  emailOnEntryApproved: initApproved,
  emailWeeklySummary: initWeekly,
  emailDailyReminder: initDailyReminder,
}: EmailSettingsFormProps) {
  const [emailOnNewEntry, setEmailOnNewEntry] = useState(initNewEntry);
  const [emailOnEntryApproved, setEmailOnEntryApproved] = useState(initApproved);
  const [emailWeeklySummary, setEmailWeeklySummary] = useState(initWeekly);
  const [emailDailyReminder, setEmailDailyReminder] = useState(initDailyReminder);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateEmailSettings({
        emailOnNewEntry,
        emailOnEntryApproved,
        emailWeeklySummary,
        emailDailyReminder,
      });
      if (result.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div>
      <Toggle
        id="emailOnNewEntry"
        checked={emailOnNewEntry}
        onChange={setEmailOnNewEntry}
        label="Jauns ieraksts"
        description="Vadītājs saņem e-pastu, kad darbinieks iesniedz jaunu ierakstu."
      />
      <Toggle
        id="emailOnEntryApproved"
        checked={emailOnEntryApproved}
        onChange={setEmailOnEntryApproved}
        label="Ieraksts apstiprināts / noraidīts"
        description="Darbinieks saņem e-pastu, kad vadītājs apstiprina vai atgriež ierakstu."
      />
      <Toggle
        id="emailWeeklySummary"
        checked={emailWeeklySummary}
        onChange={setEmailWeeklySummary}
        label="Nedēļas kopsavilkums"
        description="Vadītājs saņem iknedēļas e-pasta kopsavilkumu par komandas aktivitāti."
      />
      <Toggle
        id="emailDailyReminder"
        checked={emailDailyReminder}
        onChange={setEmailDailyReminder}
        label="Ikdienas atgādinājumi"
        description="Darbinieki saņem e-pastu darba dienas sākumā (7:00), un tie, kas vēl neko nav pierakstījuši, arī pusdienlaikā (12:00) un pēcpusdienā (16:00)."
      />

      {error && (
        <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        <Button onClick={handleSave} disabled={pending}>
          {pending ? "Saglabā..." : "Saglabāt iestatījumus"}
        </Button>
        {saved && (
          <span className="text-sm text-green-600 dark:text-green-400">Saglabāts</span>
        )}
      </div>
    </div>
  );
}
