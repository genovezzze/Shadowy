import type React from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ButtonColorfulProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

export function ButtonColorful({
  className,
  label = "Explore Components",
  ...props
}: ButtonColorfulProps) {
  return (
    <Button
      className={cn(
        "group relative h-10 overflow-hidden px-4",
        "!border-white/90 !bg-white !text-[#06110e]",
        "shadow-[0_0_28px_rgba(255,255,255,0.18)]",
        "transition-all duration-200",
        "hover:!bg-white hover:shadow-[0_0_36px_rgba(255,255,255,0.24)]",
        className,
      )}
      {...props}
    >
      <span className="relative flex items-center justify-center gap-2">
        <span className="tracking-[0.025em] text-[#06110e]">{label}</span>
        <ArrowUpRight className="size-3.5 text-[#06110e]/90" />
      </span>
    </Button>
  );
}
