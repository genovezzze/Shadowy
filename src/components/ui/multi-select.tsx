"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  id?: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  /** Fired when the dropdown closes, so the caller can apply the selection once. */
  onClose?: () => void;
  placeholder?: string;
  searchPlaceholder?: string;
  /** Shown as the "clear the filter" row inside the dropdown. */
  allLabel?: string;
  /** Single choice: picking a row replaces the selection and closes. */
  single?: boolean;
}

export function MultiSelect({
  id,
  options,
  value,
  onChange,
  onClose,
  placeholder = "Visi",
  searchPlaceholder = "Meklēt...",
  allLabel,
  single = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = new Set(value);
  const filtered = search.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(search.trim().toLowerCase()))
    : options;

  const label =
    value.length === 0
      ? placeholder
      : value.length === 1
        ? options.find((o) => o.value === value[0])?.label ?? placeholder
        : `Izvēlēti: ${value.length}`;

  // `onClose` is read from a ref so the outside-click listener stays mounted
  // once instead of being torn down on every render.
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  function close() {
    setOpen(false);
    closeRef.current?.();
  }

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 10);
    } else {
      setSearch("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        closeRef.current?.();
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        closeRef.current?.();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function toggle(optionValue: string) {
    if (single) {
      onChange(selected.has(optionValue) ? [] : [optionValue]);
      close();
      return;
    }
    onChange(
      selected.has(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue]
    );
  }

  function clearAll() {
    onChange([]);
    if (single) close();
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          value.length === 0 && "text-muted-foreground"
        )}
      >
        <span className="truncate">{label}</span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>

      {open && (
        <div className={cn(
          "absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-border bg-card text-foreground shadow-card",
          "dark:border-white/[0.08] dark:bg-[#141416] dark:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.85)]"
        )}>
          <div className="flex items-center border-b border-border px-3 dark:border-white/[0.06]">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex h-9 w-full bg-transparent py-2 pl-2 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1 pr-2" role="listbox" aria-multiselectable>
            {allLabel ? (
              <button
                type="button"
                onClick={clearAll}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent dark:hover:bg-white/[0.06] dark:focus:bg-white/[0.06]",
                  value.length === 0 ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <Check className={cn("h-4 w-4 shrink-0", value.length === 0 ? "opacity-100" : "opacity-0")} />
                {allLabel}
              </button>
            ) : null}
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">Nav rezultātu</p>
            ) : (
              filtered.map((o) => {
                const isSelected = selected.has(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => toggle(o.value)}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground outline-none transition-colors hover:bg-accent focus:bg-accent dark:hover:bg-white/[0.06] dark:focus:bg-white/[0.06]"
                  >
                    <Check
                      className={cn("h-4 w-4 shrink-0", isSelected ? "opacity-100" : "opacity-0")}
                    />
                    <span className="truncate">{o.label}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
