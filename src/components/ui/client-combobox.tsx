"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientOption {
  id: string;
  name: string;
}

interface ClientComboboxProps {
  clients: ClientOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ClientCombobox({
  clients,
  value,
  onChange,
  placeholder = "Izvēlieties klientu (neobligāti)",
}: ClientComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = clients.find((c) => c.id === value);

  const filtered = search.trim()
    ? clients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : clients;

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 10);
    } else {
      setSearch("");
    }
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-foreground dark:focus-visible:border-emerald-400/40 dark:focus-visible:ring-emerald-500/30",
          !selected && "text-muted-foreground"
        )}
      >
        <span className="truncate">{selected ? selected.name : placeholder}</span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>

      {open && (
        <div
          className={cn(
            "absolute z-50 mt-2 w-max min-w-full max-w-[min(94vw,720px)] overflow-hidden rounded-xl border border-border bg-card text-foreground shadow-card",
            "dark:border-white/[0.08] dark:bg-[#141416] dark:text-foreground dark:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.85)]"
          )}
        >
          <div className="flex items-center border-b border-border px-3 dark:border-white/[0.08]">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Meklēt..."
              className="flex h-9 w-full bg-transparent py-2 pl-2 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-72 overflow-auto p-1">
            {/* "Nav klienta" stays a full-width row on top; the clients below
                are laid out in columns of five so the list is easy to scan. */}
            <button
              type="button"
              onClick={() => { onChange("__none__"); setOpen(false); }}
              className={cn(
                "relative flex w-full cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-3 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground dark:hover:bg-white/[0.06] dark:hover:text-foreground",
                value === "__none__" || !value ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {(!value || value === "__none__") && <Check className="h-4 w-4" />}
              </span>
              Nav klienta
            </button>
            {filtered.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">Nav rezultātu</p>
            ) : (
              <div className="grid grid-flow-col grid-rows-5">
                {filtered.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => { onChange(c.id); setOpen(false); }}
                    className="relative flex min-h-[40px] w-full min-w-[12rem] cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-3 text-sm text-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground dark:hover:bg-white/[0.06] dark:hover:text-foreground"
                  >
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                      {value === c.id && <Check className="h-4 w-4" />}
                    </span>
                    <span className="truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
