import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Lightweight native <select> styled to match shadcn/ui look.
 * Avoids client-only Radix Select for SSR-friendly forms.
 */
export interface NativeSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background disabled:opacity-50",
          "dark:border-white/[0.08] dark:bg-white/[0.03] dark:ring-offset-transparent dark:focus-visible:border-emerald-400/40 dark:focus-visible:ring-emerald-500/30 dark:[color-scheme:dark]",
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);
NativeSelect.displayName = "NativeSelect";

export { NativeSelect };
