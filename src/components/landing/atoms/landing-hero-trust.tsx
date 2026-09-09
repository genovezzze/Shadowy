import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The three things a visitor was previously made to hunt for, moved up beside
 * the call to action: what the pilot costs, that the employee stays in control
 * of what is submitted, and that a real named company is already running it.
 *
 * Price and the "not surveillance" objection each had their own FAQ entry five
 * sections down, which is far past the point where someone decides whether to
 * press the button.
 *
 * Deliberately typographic rather than a row of cards - the hero carries one
 * headline, one sentence and one white pill, and a second block of chrome under
 * it would compete with the CTA it is meant to support.
 */
export function LandingHeroTrust({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-2.5", className)}>
      <ul className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[12px] font-medium leading-tight text-white/55 sm:gap-x-2.5 sm:text-[13px]">
        {[
          "30 dienas bez maksas",
          "Bez kredītkartes",
          "Darbinieks pats izvēlas, ko iesniedz",
        ].map((item, index) => (
          <li key={item} className="flex items-center gap-2 sm:gap-2.5">
            {/* The separator belongs to the item that follows it, so it never
                dangles at the end of a wrapped line. */}
            {index > 0 && (
              <span
                aria-hidden
                className="hidden h-3 w-px bg-white/20 sm:block"
              />
            )}
            <span className="flex items-center gap-1.5">
              <Check className="size-3 shrink-0 text-white/40" aria-hidden />
              {item}
            </span>
          </li>
        ))}
      </ul>

      {/* The one piece of proof on the page that is not illustrative: a named
          client. It links to their case rather than asserting a result, because
          every figure in that case is explicitly a worked example, not measured
          data. */}
      <Link
        href="/projekti/pb-finanses"
        className="group inline-flex items-center gap-1.5 text-[12px] font-semibold leading-tight text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline sm:text-[13px]"
      >
        PB Finanses jau strādā ar Shadowy
        <ArrowUpRight
          className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden
        />
      </Link>
    </div>
  );
}
