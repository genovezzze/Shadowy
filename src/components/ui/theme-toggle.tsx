"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, MoonStar } from "lucide-react";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { useEffect, useState } from "react";

const THEME_OPTIONS = [
  { value: "dark", label: "Tumšā", Icon: Moon },
  { value: "slate", label: "Pelēkā", Icon: MoonStar },
  { value: "light", label: "Gaišā", Icon: Sun },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <Button variant="ghost" size="icon" disabled aria-label="Pārslēgt tēmu" />;

  const current = THEME_OPTIONS.find((o) => o.value === theme) ?? THEME_OPTIONS[1];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Mainīt tēmu" title="Mainīt tēmu">
          <current.Icon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Tēma</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={current.value} onValueChange={setTheme}>
          {THEME_OPTIONS.map(({ value, label, Icon }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <Icon className="h-4 w-4" />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
