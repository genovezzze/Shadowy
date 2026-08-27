"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, CheckCircle2, ChevronDown } from "lucide-react";
import { submitPilotApplication } from "@/app/pilot-actions";
import { Reveal, SectionBadge } from "@/components/landing/atoms/landing-primitives";
import { cn } from "@/lib/utils";
import { WaveHeading } from "@/components/landing/atoms/wave-heading";

const TEAM_SIZES = [
  "2-5 cilvēki",
  "6-15 cilvēki",
  "16-50 cilvēki",
  "51+ cilvēki",
] as const;

// The card sits on white, so the fields are tinted rather than outlined - a
// border on every input would fight the card's own edge.
const FIELD_CLASS =
  "w-full rounded-full border-none bg-black/5 px-4 py-3 text-base text-black outline-none transition-colors placeholder:text-black/40 focus:bg-black/[0.08] md:text-sm";

const LABEL_CLASS = "mb-2 block text-xs text-black/60";

export function LandingContact() {
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await submitPilotApplication(formData);
      if (result.ok) setDone(true);
      else setError(result.error);
    });
  }

  return (
    <section
      id="pilots"
      // The source is 16:9. Keeping at least that much vertical room lets the
      // complete frame remain visible on wide screens; if the form makes the
      // section taller, `object-contain` still prevents any edge from being
      // cropped.
      className="relative min-h-[56.25vw] scroll-mt-20 overflow-hidden bg-[var(--landing-night)] pb-0 pt-20 sm:pb-32"
    >
      {/* Full-bleed backdrop, anchored to its bottom edge like the reference:
          the shot's own sky is black, so it meets the section's black ground
          seamlessly however tall the section grows, and cropping happens at
          the top where there is nothing but sky to lose. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 hidden sm:block">
        <Image
          src="/images/pic9.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-contain object-bottom"
        />
      </div>

      <div className="relative z-10 w-full px-4 md:px-8">
        <div className="flex w-full flex-col items-start gap-10 lg:flex-row lg:justify-between">
          {/* Swapped with `order` rather than by moving the markup: on phones
              the column stacks, and the heading has to come first there so the
              form is introduced before it appears - and so screen readers meet
              them in that order too. */}
          <Reveal className="w-full lg:relative lg:-top-8 lg:order-2 lg:w-[40%] xl:w-[35%]">
            <div className="mb-6 inline-block">
              <SectionBadge tone="dark">Pieteikums</SectionBadge>
            </div>
            <h2 className="text-landing-h2 leading-tight text-white">
              <WaveHeading tone="light">Sāksim ar sarunu</WaveHeading>
            </h2>
            <p className="mt-4 max-w-md text-sm font-medium leading-relaxed text-white/65 md:text-base">
              Pastāstiet par komandu - sazināsimies 1-2 darba dienu laikā
              Iepazīšanās zvans ilgst 20 minūtes, un ja Shadowy jūsu situācijai
              neder, mēs to pateiksim godīgi
            </p>
          </Reveal>

          <div className="flex w-full lg:order-1 lg:w-[50%] lg:justify-start xl:w-[45%]">
            {/* Shadow instead of the old border: over a photograph a hairline
                outline reads as a cutout edge, while the shadow lifts the card
                off the scene. 4px radius and 48px padding are the reference's
                own. */}
            <div className="w-full max-w-lg rounded-[4px] bg-white p-8 text-black shadow-[0_20px_60px_rgba(0,0,0,0.45)] md:p-10 lg:max-w-[520px] lg:p-12">
              {done ? (
                <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
                  <span className="grid size-12 place-items-center rounded-full bg-[#2563eb] text-white">
                    <CheckCircle2 className="size-6" aria-hidden />
                  </span>
                  <p className="text-xl font-bold tracking-tight text-black">
                    Pieteikums nosūtīts!
                  </p>
                  <p className="text-sm font-medium text-black/70">
                    Sazināsimies ar jums tuvāko dienu laikā
                  </p>
                </div>
              ) : (
                <form action={onSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={LABEL_CLASS} htmlFor="pilot-name">
                        Vārds un uzvārds*
                      </label>
                      <input
                        id="pilot-name"
                        name="name"
                        type="text"
                        required
                        maxLength={100}
                        placeholder="Jānis Bērziņš"
                        className={FIELD_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS} htmlFor="pilot-company">
                        Uzņēmums*
                      </label>
                      <input
                        id="pilot-company"
                        name="company"
                        type="text"
                        required
                        maxLength={100}
                        placeholder="SIA Piemērs"
                        className={FIELD_CLASS}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={LABEL_CLASS} htmlFor="pilot-email">
                        E-pasts*
                      </label>
                      <input
                        id="pilot-email"
                        name="email"
                        type="email"
                        required
                        placeholder="janis@uznemums.lv"
                        className={FIELD_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS} htmlFor="pilot-size">
                        Komandas lielums*
                      </label>
                      <SelectPrimitive.Root
                        name="teamSize"
                        required
                        defaultValue=""
                      >
                        <SelectPrimitive.Trigger
                          id="pilot-size"
                          className={cn(
                            FIELD_CLASS,
                            "group flex min-h-11 items-center justify-between gap-3 text-left data-[placeholder]:text-black/40 focus-visible:ring-2 focus-visible:ring-black/15"
                          )}
                        >
                          <SelectPrimitive.Value placeholder="Izvēlieties..." />
                          <SelectPrimitive.Icon asChild>
                            <ChevronDown
                              aria-hidden
                              className="size-4 shrink-0 text-black/45 transition-transform duration-200 group-data-[state=open]:rotate-180"
                            />
                          </SelectPrimitive.Icon>
                        </SelectPrimitive.Trigger>

                        <SelectPrimitive.Portal>
                          <SelectPrimitive.Content
                            position="popper"
                            sideOffset={6}
                            className="z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-[20px] border border-black/10 bg-white p-1.5 text-black shadow-[0_18px_45px_rgba(0,0,0,0.16)] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
                          >
                            <SelectPrimitive.Viewport>
                              {TEAM_SIZES.map((size) => (
                                <SelectPrimitive.Item
                                  key={size}
                                  value={size}
                                  className="relative flex cursor-pointer select-none items-center rounded-2xl py-2.5 pl-4 pr-10 text-sm outline-none transition-colors focus:bg-black/[0.06] data-[state=checked]:bg-black/[0.08]"
                                >
                                  <SelectPrimitive.ItemText>
                                    {size}
                                  </SelectPrimitive.ItemText>
                                  <SelectPrimitive.ItemIndicator className="absolute right-4 inline-flex items-center">
                                    <Check aria-hidden className="size-4" />
                                  </SelectPrimitive.ItemIndicator>
                                </SelectPrimitive.Item>
                              ))}
                            </SelectPrimitive.Viewport>
                          </SelectPrimitive.Content>
                        </SelectPrimitive.Portal>
                      </SelectPrimitive.Root>
                    </div>
                  </div>

                  <div>
                    <label className={LABEL_CLASS} htmlFor="pilot-comment">
                      Īss komentārs
                    </label>
                    <textarea
                      id="pilot-comment"
                      name="comment"
                      rows={3}
                      maxLength={1000}
                      placeholder="Ko jūs vēlaties uzlabot komandā?"
                      className={cn(FIELD_CLASS, "resize-y rounded-[20px]")}
                    />
                  </div>

                  {error && (
                    <p className="rounded-[4px] bg-red-50 px-4 py-3 text-sm text-red-600">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={pending}
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-black px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-black/85 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
                  >
                    {pending ? "Sūta..." : "Nosūtīt pieteikumu"}
                    {!pending && (
                      <ArrowUpRight
                        className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    )}
                  </button>

                  <p className="text-xs font-medium leading-relaxed text-black/40">
                    Nospiežot pogu, jūs piekrītat{" "}
                    <Link href="/privacy" className="underline hover:text-black/70">
                      privātuma politikai
                    </Link>
                    .
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden className="relative z-[5] mt-8 aspect-[16/9] w-full bg-black sm:hidden">
        <Image
          src="/images/pic9.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-contain object-bottom"
        />
      </div>
    </section>
  );
}
