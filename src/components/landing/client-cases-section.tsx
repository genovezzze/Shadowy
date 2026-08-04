"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Check,
  Plus,
  X,
} from "lucide-react";

const futureCards = [
  {
    eyebrow: "Nākamais stāsts",
    title: "Šeit varētu būt jūsu uzņēmums",
    text: "Pievienojieties pilotam un padariet komandas neredzamo darbu izmērāmu.",
  },
  {
    eyebrow: "Atvērta vieta",
    title: "Jūsu pilotprojekts",
    text: "Sākam ar jūsu komandas situāciju un izveidojam praktisku risinājumu.",
  },
] as const;

const demoMatrixEmployees = ["Anna", "Jānis", "Elīna", "Mārtiņš"] as const;
const demoHourlyRateEur = 25;

const demoMatrixRows = [
  { client: "Baltic Trade SIA", hours: [4.2, 1.6, 3.1, 2.4], total: 11.3, limit: 12, overLimit: false },
  { client: "NordHaus SIA", hours: [2.1, 4.8, 3.7, 2.9], total: 13.5, limit: 10, overLimit: true },
  { client: "Green Office SIA", hours: [0.8, 2.3, 1.4, 3.2], total: 7.7, limit: 9, overLimit: false },
  { client: "Atlas Studio SIA", hours: [3.6, 0, 4.5, 2.7], total: 10.8, limit: 8, overLimit: true },
] as const;

const cardMotion = {
  y: -8,
  transition: { type: "spring", stiffness: 300, damping: 24 },
} as const;

export function ClientCasesSection() {
  const [caseOpen, setCaseOpen] = useState(false);

  useEffect(() => {
    if (!caseOpen) return;

    const root = document.documentElement;
    const body = document.body;
    root.classList.add("client-case-open");
    body.classList.add("client-case-open");

    return () => {
      root.classList.remove("client-case-open");
      body.classList.remove("client-case-open");
    };
  }, [caseOpen]);

  return (
    <section
      id="klienti"
      aria-labelledby="client-cases-heading"
      className="relative z-[46] overflow-hidden bg-[#070809] py-10 sm:py-14 lg:py-16"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(52% 42% at 50% 8%, rgba(148,163,184,0.09), transparent 72%), radial-gradient(circle, rgba(255,255,255,0.06) 0.7px, transparent 0.8px)",
          backgroundSize: "auto, 32px 32px",
          maskImage:
            "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
        <header className="mx-auto max-w-[1240px]">
          <div className="grid max-w-[1240px] items-center gap-5 lg:grid-cols-[max-content_1px_minmax(400px,1fr)] lg:gap-3">
            <h2
              id="client-cases-heading"
              className="w-full whitespace-nowrap text-center font-accent text-[clamp(1.35rem,4vw,2.5rem)] font-bold uppercase leading-none tracking-[0.015em] text-[#75babc] [font-synthesis:weight] lg:text-left"
            >
              Pilotprojekti un klienti
            </h2>
            <span
              aria-hidden
              className="hidden h-24 w-px bg-gradient-to-b from-transparent via-white/25 to-transparent lg:block"
            />
            <p className="text-center font-accent text-sm font-light leading-6 text-white/52 sm:text-base sm:leading-relaxed lg:text-left">
              Shadowy aug kopā ar uzņēmumiem, kuri vēlas redzēt darbu, kas līdz šim palicis ārpus atskaitēm.
            </p>
          </div>
        </header>

        <div className="-mx-5 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-5 sm:-mx-6 sm:mt-5 sm:px-6 lg:mx-auto lg:grid lg:max-w-[1240px] lg:grid-cols-3 lg:justify-items-center lg:overflow-visible lg:px-0 lg:pb-0">
          <Dialog.Root open={caseOpen} onOpenChange={setCaseOpen}>
            <Dialog.Trigger asChild>
              <motion.button
                type="button"
                whileHover={cardMotion}
                className="group relative h-[400px] w-[86vw] max-w-[400px] shrink-0 snap-center overflow-hidden rounded-[22px] border border-white/[0.13] bg-[#0a0c0e] text-left shadow-[0_24px_70px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.06)] transition-colors hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 lg:w-full"
              >
                <div className="relative h-[44%] overflow-hidden border-b border-white/[0.09] bg-black">
                  <Image
                    src="/images/shadowyxpb.png"
                    alt="Shadowy un PB Finanses kopprojekts"
                    fill
                    sizes="(min-width: 1024px) 350px, 82vw"
                    className="scale-[1.18] object-cover object-center transition-transform duration-700 group-hover:scale-[1.23]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c0e] via-black/15 to-black/5" />
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-green-700 bg-green-700 px-3 py-1.5 font-display text-[11px] font-normal text-white">
                    <Check className="size-3" aria-hidden />
                    realizēts
                  </span>
                </div>

                <div className="flex h-[56%] flex-col p-4">
                  <p className="font-display text-[10px] font-bold uppercase tracking-[0.17em] text-slate-400">
                    Klienta projekts
                  </p>
                  <h3 className="animate-pb-logo-gradient mt-1.5 w-fit bg-clip-text font-accent text-[1.4rem] font-bold leading-tight tracking-[0.015em] text-transparent [font-synthesis:weight]">
                    PB Finanses
                  </h3>
                  <p className="mt-1.5 font-accent text-[13px] font-light leading-5 text-white/55">
                    Vienota platforma neredzamā darba, komandas slodzes un klientu izmaksu pārskatīšanai.
                  </p>

                  <div className="mt-auto flex items-center justify-between border-t border-white/[0.09] pt-3">
                    <span className="flex items-center gap-2.5">
                      <span className="grid size-8 place-items-center rounded-full border border-white/[0.12] bg-white/[0.055] font-accent text-[11px] font-bold text-white/80">
                        PB
                      </span>
                      <span className="font-accent text-xs font-bold text-white/65">
                        Skatīt projektu
                      </span>
                    </span>
                    <span className="grid size-9 place-items-center rounded-full border border-white/[0.12] bg-white/[0.05] text-white/65 transition-all duration-300 group-hover:-rotate-45 group-hover:border-white/25 group-hover:bg-white group-hover:text-black">
                      <ArrowUpRight className="size-4" aria-hidden />
                    </span>
                  </div>
                </div>
              </motion.button>
            </Dialog.Trigger>

            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md" />
              <Dialog.Content
                className="client-case-scroll fixed left-1/2 top-1/2 z-[101] max-h-[92svh] w-[calc(100%-1.5rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 overscroll-contain overflow-y-auto rounded-[18px] border border-white/[0.14] bg-[#080a0c] text-white shadow-[0_34px_120px_rgba(0,0,0,0.72)] focus:outline-none sm:w-[calc(100%-3rem)]"
                onOpenAutoFocus={(event) => event.preventDefault()}
              >
                <Dialog.Close
                  aria-label="Aizvērt"
                  className="absolute right-4 top-4 z-20 grid size-10 place-items-center rounded-full border border-white/[0.16] bg-black/70 text-white/65 backdrop-blur-md transition hover:border-white/35 hover:text-white"
                >
                  <X className="size-4" aria-hidden />
                </Dialog.Close>

                <div className="px-5 pb-7 pt-7 sm:px-10 sm:pb-10 sm:pt-9">
                  <p className="font-display text-[10px] font-bold uppercase tracking-[0.17em] text-[#75babc]">
                    Klienta stāsts · PB Finanses
                  </p>
                  <Dialog.Title className="mt-3 max-w-3xl text-balance font-display text-3xl font-bold leading-[1.05] tracking-[0.01em] sm:text-5xl">
                    Neredzamais darbs kļūst izmērāms
                  </Dialog.Title>

                  <div className="mt-7 grid border-y border-white/[0.12] sm:grid-cols-2">
                    <section className="py-5 sm:pr-8">
                      <p className="font-display text-[10px] font-bold uppercase tracking-[0.15em] text-white/38">
                        Par uzņēmumu
                      </p>
                      <p className="mt-2 font-sans text-sm font-normal leading-6 text-white/72 sm:text-[15px] sm:leading-7">
                        PB Finanses ir pilna servisa finanšu kompānija, kas sniedz grāmatvedības, finanšu plānošanas un biznesa konsultāciju pakalpojumus Latvijas un ārvalstu uzņēmumiem.
                      </p>
                    </section>
                    <section className="border-t border-white/[0.12] py-5 sm:border-l sm:border-t-0 sm:pl-8">
                      <p className="font-display text-[10px] font-bold uppercase tracking-[0.15em] text-white/38">
                        Ko izstrādājām
                      </p>
                      <p className="mt-2 font-sans text-sm font-normal leading-6 text-white/72 sm:text-[15px] sm:leading-7">
                        Shadowy pilotplatformu papildu darba fiksēšanai un analīzei - lai komanda reģistrētu darbu, bet vadība redzētu slodzi, atkārtojošos procesus un klientiem veltīto laiku.
                      </p>
                    </section>
                  </div>

                  <section className="mt-8 border-y border-white/[0.12] py-6">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <p className="font-display text-[10px] font-bold uppercase tracking-[0.15em] text-white/38">
                          Platformas iespēja
                        </p>
                        <h3 className="mt-1.5 font-accent text-xl font-bold text-white/90 sm:text-2xl">
                          Klientu un komandas noslodzes matrica
                        </h3>
                      </div>
                      <p className="font-sans text-xs font-normal text-white/48">
                        Demonstrācijas dati
                      </p>
                    </div>

                    <div className="mt-5 overflow-x-auto border border-white/[0.1]">
                      <table className="w-full min-w-[860px] border-collapse font-accent text-xs">
                        <thead>
                          <tr className="bg-white/[0.035] text-white/42">
                            <th className="border-b border-r border-white/[0.09] px-4 py-3 text-left font-medium">
                              Klients
                            </th>
                            {demoMatrixEmployees.map((employee) => (
                              <th
                                key={employee}
                                className="border-b border-r border-white/[0.09] px-3 py-3 text-center font-medium last:border-r-0"
                              >
                                {employee}
                              </th>
                            ))}
                            <th className="border-b border-r border-white/[0.09] px-3 py-3 text-right font-medium">
                              Kopā
                            </th>
                            <th className="border-b border-r border-white/[0.09] px-3 py-3 text-right font-medium">
                              Izmaksas
                            </th>
                            <th className="border-b border-white/[0.09] px-4 py-3 text-right font-medium">
                              Statuss
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {demoMatrixRows.map((row) => (
                            <tr key={row.client} className="border-b border-white/[0.07] last:border-b-0">
                              <th className="whitespace-nowrap border-r border-white/[0.09] px-4 py-3 text-left font-medium text-white/72">
                                {row.client}
                              </th>
                              {row.hours.map((hours, index) => {
                                const intensity = hours >= 4
                                  ? "bg-[#285f5d] text-[#d6efee]"
                                  : hours >= 2
                                    ? "bg-[#173b3a] text-[#a8d4d2]"
                                    : hours > 0
                                      ? "bg-[#102625] text-[#7eaaa8]"
                                      : "text-white/18";

                                return (
                                  <td
                                    key={`${row.client}-${demoMatrixEmployees[index]}`}
                                    className="border-r border-white/[0.09] px-3 py-3 text-center"
                                  >
                                    <span className={`inline-flex min-w-12 justify-center px-2 py-1 tabular-nums ${intensity}`}>
                                      {hours > 0 ? `${hours}h` : "-"}
                                    </span>
                                  </td>
                                );
                              })}
                              <td className="border-r border-white/[0.09] px-3 py-3 text-right font-medium tabular-nums text-white/72">
                                {row.total}h
                              </td>
                              <td className="border-r border-white/[0.09] px-3 py-3 text-right font-medium tabular-nums text-white/72">
                                €{Math.round(row.total * demoHourlyRateEur)}
                              </td>
                              <td className={`whitespace-nowrap px-4 py-3 text-right font-medium ${row.overLimit ? "text-amber-300/80" : "text-[#75babc]"}`}>
                                {row.overLimit ? `+${(row.total - row.limit).toFixed(1)}h virs limita` : "Limitā"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4 grid gap-4 border-t border-white/[0.09] pt-4 sm:grid-cols-3">
                      <div>
                        <p className="font-display text-[10px] font-bold uppercase tracking-[0.12em] text-white/42">
                          Laiks
                        </p>
                        <p className="mt-1.5 font-sans text-xs font-normal leading-5 text-white/55">
                          Stundas rāda papildu darbu, ko katrs darbinieks mēneša laikā veltījis konkrētajam klientam.
                        </p>
                      </div>
                      <div>
                        <p className="font-display text-[10px] font-bold uppercase tracking-[0.12em] text-white/42">
                          Krāsas intensitāte
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="size-3 bg-[#102625]" />
                          <span className="size-3 bg-[#173b3a]" />
                          <span className="size-3 bg-[#285f5d]" />
                          <span className="font-sans text-[11px] text-white/45">
                            mazāk → vairāk stundu
                          </span>
                        </div>
                        <p className="mt-1.5 font-sans text-xs font-normal leading-5 text-white/55">
                          Tirkīza tonis apzīmē darba laiku; jo tas ir gaišāks un piesātinātāks, jo vairāk stundu ieguldīts.
                        </p>
                      </div>
                      <div>
                        <p className="font-display text-[10px] font-bold uppercase tracking-[0.12em] text-white/42">
                          Izmaksas
                        </p>
                        <p className="mt-1.5 font-sans text-xs font-normal leading-5 text-white/55">
                          Aptuvenā papildu darba cena: kopējās stundas × €{demoHourlyRateEur}/h demonstrācijas likme. Dzeltens statuss norāda limita pārsniegumu.
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 font-sans text-[11px] font-normal leading-5 text-white/35">
                      Visi klientu nosaukumi, stundas, limiti un izmaksas šajā piemērā ir izdomāti un neatspoguļo PB Finanses datus.
                    </p>
                  </section>

                  <div className="mt-9 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
                    <section>
                      <p className="font-display text-[10px] font-bold uppercase tracking-[0.15em] text-white/38">
                        Pilotprojekta konteksts
                      </p>
                      <h3 className="mt-2 font-display text-xl font-bold leading-tight text-white/90 sm:text-2xl">
                        No manuālas uzskaites līdz vienotai analītikai
                      </h3>
                      <div className="mt-4 space-y-4 font-sans text-sm font-normal leading-7 text-white/70 sm:text-[15px] sm:leading-7">
                        <p>
                          PB Finanses komanda jau iepriekš saviem spēkiem pētīja “slēpto darbu” - uzdevumus, kurus klients tieši neredz un par kuriem atsevišķi nemaksā, bet kuri palīdz nodrošināt labāku servisu.
                        </p>
                        <p>
                          Shadowy šo procesu pārnes vienotā vidē: papildu darbs tiek fiksēts, strukturēts un pārvērsts vadībai izmantojamā analītikā par komandas laiku, uzmanību un iesaisti.
                        </p>
                        <p>
                          Sadarbība sākās pēc iepazīšanās CoLab 2026 biznesa forumā un turpinājās kā pilotprojekts reālā uzņēmuma ikdienas darbā.
                        </p>
                      </div>
                    </section>

                    <aside className="border-l border-white/[0.14] pl-5 sm:pl-7">
                      <p className="font-display text-[10px] font-bold uppercase tracking-[0.15em] text-[#75babc]">
                        Agnese Pastare par Shadowy
                      </p>
                      <Dialog.Description className="mt-4 font-sans text-base font-normal leading-7 text-white/82 sm:text-lg sm:leading-8">
                        “Shadowy aplikācija šo procesu padara krietni ērtāku un uzreiz sniedz labu analītisko materiālu.”
                      </Dialog.Description>
                      <p className="mt-4 font-sans text-sm text-white/58">
                        Agnese Pastare · PB Finanses
                      </p>
                      <a
                        href="https://www.linkedin.com/posts/agnese-pastare-85732b58_pb-finanses-lepojas-piedal%C4%ABties-shadowy-pilotprojekt%C4%81-share-7483124194482929664-XxqF/"
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 inline-flex items-center gap-1.5 border-b border-[#75babc]/45 pb-1 font-sans text-xs font-medium text-[#75babc] transition-colors hover:border-white hover:text-white"
                      >
                        Lasīt pilno ierakstu LinkedIn
                        <ArrowUpRight className="size-3.5" aria-hidden />
                      </a>
                    </aside>
                  </div>

                  <div className="mt-9 flex flex-col gap-4 border-t border-white/[0.12] pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-xl font-sans text-sm font-normal leading-6 text-white/62">
                      PB Finanses redz Shadowy kā vērtīgu rīku uzņēmumiem, kuri vēlas labāk saprast komandas slodzi, iekšējos procesus un darbu, kas paliek ārpus ierastajām atskaitēm.
                    </p>
                    <Dialog.Close asChild>
                      <a
                        href="#pilots"
                        className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 font-accent text-sm font-bold text-black transition hover:bg-white/88"
                      >
                        Pieteikt savu pilotu
                        <ArrowUpRight className="size-4" aria-hidden />
                      </a>
                    </Dialog.Close>
                  </div>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

          {futureCards.map((card, index) => (
            <motion.a
              key={card.title}
              href="#pilots"
              whileHover={cardMotion}
              className="group relative flex h-[400px] w-[86vw] max-w-[400px] shrink-0 snap-center flex-col overflow-hidden rounded-[22px] border border-dashed border-white/[0.13] bg-white/[0.018] p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] transition-colors hover:border-white/28 hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 lg:w-full"
            >
              <div
                aria-hidden
                className="absolute inset-0 opacity-50 transition-opacity duration-300 group-hover:opacity-80"
                style={{
                  background:
                    index === 0
                      ? "radial-gradient(circle at 22% 18%, rgba(148,163,184,0.10), transparent 38%)"
                      : "radial-gradient(circle at 78% 82%, rgba(148,163,184,0.09), transparent 40%)",
                }}
              />
              <div className="relative flex h-[44%] items-center justify-center border-b border-dashed border-white/[0.09]">
                <span className="grid size-16 place-items-center rounded-full border border-dashed border-white/[0.18] bg-white/[0.025] text-white/30 transition-all duration-300 group-hover:scale-110 group-hover:border-white/30 group-hover:bg-white/[0.06] group-hover:text-white/70">
                  <Plus className="size-6" strokeWidth={1.4} aria-hidden />
                </span>
              </div>

              <div className="relative flex flex-1 flex-col pt-4">
                <p className="font-display text-[10px] font-bold uppercase tracking-[0.17em] text-white/28">
                  {card.eyebrow}
                </p>
                <h3 className="mt-1.5 text-balance font-accent text-[1.2rem] font-bold leading-tight tracking-[0.015em] text-white/72 [font-synthesis:weight]">
                  {card.title}
                </h3>
                <p className="mt-1.5 font-accent text-[13px] font-light leading-5 text-white/38">
                  {card.text}
                </p>
                <div className="mt-auto flex items-center justify-between border-t border-white/[0.07] pt-3">
                  <span className="font-accent text-xs font-bold text-white/42">
                    Sākt pilotu
                  </span>
                  <ArrowUpRight className="size-4 text-white/28 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white/65" aria-hidden />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
