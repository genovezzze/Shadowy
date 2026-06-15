import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "btn-shimmer",
        solid:
          "bg-emerald-600 text-white hover:bg-emerald-500",
        glass:
          "glass rounded-full border border-white/[0.14] bg-white/[0.06] text-white hover:bg-white/[0.1] hover:border-white/[0.22] active:scale-[0.97]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm rounded-md",
        success:
          "btn-shimmer",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground dark:border-white/[0.10] dark:bg-white/[0.03] dark:hover:bg-white/[0.07] dark:hover:border-white/[0.16]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:bg-white/[0.05] dark:hover:bg-white/[0.08]",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-white/[0.06] dark:hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3.5 text-[13px]",
        lg: "h-[52px] px-7 text-[15px] tracking-[-0.01em]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
