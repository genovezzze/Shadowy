"use client";

import { useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const terms = [
  {
    title: "Pakalpojuma apraksts",
    text: "Shadowy apkopo un palīdz pārskatīt darbinieku iesniegtos darba ierakstus. Pilota laikā pakalpojums tiek nodrošināts bez maksas un var tikt pilnveidots.",
  },
  {
    title: "Organizācijas atbildība",
    text: "Organizācijas administrators ir atbildīgs par lietotāju kontu pārvaldību un pareizas informācijas ievadīšanu savā organizācijā.",
  },
  {
    title: "Konta drošība",
    text: "Piekļuves dati ir konfidenciāli un nav nododami trešajām personām. Par aizdomīgu piekļuvi nekavējoties jāinformē Shadowy.",
  },
  {
    title: "Atļautā izmantošana",
    text: "Platformu drīkst izmantot tikai likumīgiem, ar darba uzskaiti un komandas slodzes izpratni saistītiem mērķiem.",
  },
  {
    title: "Privātums un novērošana",
    text: "Shadowy nav darbinieku novērošanas rīks. Platforma neseko privātām sarunām, ekrāna aktivitātei, klikšķiem vai personīgajiem failiem.",
  },
  {
    title: "Pieejamība un atbildība",
    text: "Pilota laikā pakalpojums tiek nodrošināts tā pašreizējā formā, bez garantijas par nepārtrauktu pieejamību.",
  },
  {
    title: "Pilota pārtraukšana un dati",
    text: "Dalību pilotā var pārtraukt jebkurā brīdī. Pēc pārtraukšanas organizācijas dati tiek glabāti līdz 30 dienām eksporta pieprasījumam, pēc tam tie tiek dzēsti.",
  },
  {
    title: "Piemērojamie tiesību akti",
    text: "Šiem noteikumiem piemēro Latvijas Republikas tiesību aktus.",
  },
] as const;

export function TermsDialog({
  accepted,
  onAccept,
}: {
  accepted: boolean;
  onAccept: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [hasReadToBottom, setHasReadToBottom] = useState(accepted);
  const contentRef = useRef<HTMLDivElement>(null);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen && !accepted) setHasReadToBottom(false);
  }

  function handleScroll() {
    const content = contentRef.current;
    if (!content) return;

    const remaining =
      content.scrollHeight - content.scrollTop - content.clientHeight;
    if (remaining <= 4) setHasReadToBottom(true);
  }

  function acceptTerms() {
    onAccept();
    setHasReadToBottom(true);
    setOpen(false);
  }

  return (
    <>
      <input
        type="hidden"
        name="termsAccepted"
        value={accepted ? "true" : "false"}
      />

      <Dialog.Root open={open} onOpenChange={handleOpenChange}>
        <Dialog.Trigger asChild>
          <button
            type="button"
            className="flex h-11 w-full items-center justify-between rounded-lg border border-white/[0.14] bg-black px-4 text-left font-accent text-sm transition hover:border-white/25"
          >
            <span className="flex items-center gap-3 text-white/72">
              {accepted ? (
                <Check className="size-4 text-emerald-300" />
              ) : (
                <FileText className="size-4 text-white/45" />
              )}
              {accepted ? "Noteikumi pieņemti" : "Izlasīt lietošanas noteikumus"}
            </span>
            <span className="text-xs text-white/35">
              {accepted ? "Pieņemts" : "Obligāti"}
            </span>
          </button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm" />
          <Dialog.Content
            className="fixed left-1/2 top-1/2 z-50 flex max-h-[86svh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-white/[0.15] bg-[#080808] text-white shadow-2xl focus:outline-none"
            onOpenAutoFocus={(event) => event.preventDefault()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.1] px-5 py-4 sm:px-6">
              <div>
                <Dialog.Title className="font-accent text-base font-bold">
                  Lietošanas noteikumi
                </Dialog.Title>
                <Dialog.Description className="mt-1 font-accent text-xs leading-5 text-white/42">
                  Izlasiet noteikumus līdz beigām, lai turpinātu.
                </Dialog.Description>
              </div>
              <Dialog.Close
                aria-label="Aizvērt"
                className="grid size-9 shrink-0 place-items-center rounded-lg text-white/45 transition hover:bg-white/[0.06] hover:text-white"
              >
                <X className="size-4" />
              </Dialog.Close>
            </div>

            <div
              ref={contentRef}
              onScroll={handleScroll}
              className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 font-accent text-sm leading-6 text-white/52 sm:px-6"
            >
              {terms.map((term) => (
                <section key={term.title} className="space-y-1.5">
                  <h2 className="font-bold text-white/82">{term.title}</h2>
                  <p>{term.text}</p>
                </section>
              ))}
            </div>

            <div className="border-t border-white/[0.1] px-5 py-4 sm:px-6">
              {!hasReadToBottom && (
                <p className="mb-3 text-center font-accent text-xs text-white/38">
                  Ritiniet līdz beigām, lai pieņemtu noteikumus.
                </p>
              )}
              <div className="flex gap-3">
                <Dialog.Close asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 flex-1 rounded-lg border-white/[0.15] bg-black"
                  >
                    Atcelt
                  </Button>
                </Dialog.Close>
                <Button
                  type="button"
                  disabled={!hasReadToBottom}
                  onClick={acceptTerms}
                  className="h-11 flex-1 rounded-lg border border-white !bg-white font-accent font-bold !text-black hover:!bg-white/90"
                >
                  Piekrītu
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
