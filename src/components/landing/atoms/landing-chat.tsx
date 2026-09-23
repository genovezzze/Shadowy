"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Check, CheckCircle2, X } from "lucide-react";
import { useLocale, type Locale } from "@/components/landing/atoms/i18n";
import { submitChatLead } from "@/app/pilot-actions";

type L = Record<Locale, string>;

// A guided pilot intake: team size → niche → wishes → contact. Answers are
// collected step by step and sent as one lead to the same place as the full
// pilot form (PilotLead + notification email). No real assistant, no invented
// promises - just a fast, friendly way to book a pilot.
type Step = "size" | "niche" | "wishes" | "contact" | "done";

const SIZE_OPTIONS: readonly L[] = [
  { lv: "2-5 cilvēki", en: "2-5 people" },
  { lv: "6-15 cilvēki", en: "6-15 people" },
  { lv: "16-50 cilvēki", en: "16-50 people" },
  { lv: "51+ cilvēki", en: "51+ people" },
];

const NICHE_OPTIONS: readonly L[] = [
  { lv: "Grāmatvedība / finanses", en: "Accounting / finance" },
  { lv: "Konsultācijas", en: "Consulting" },
  { lv: "Aģentūra", en: "Agency" },
  { lv: "IT / produkts", en: "IT / product" },
  { lv: "Cita nozare", en: "Other industry" },
];

const STR = {
  name: { lv: "Shadowy komanda", en: "Shadowy team" },
  status: { lv: "Atbildam 1 darba dienas laikā", en: "We reply within 1 business day" },
  greeting: {
    lv: "Sveiki!",
    en: "Hi!",
  },
  askSize: { lv: "Cik liela ir jūsu komanda?", en: "How big is your team?" },
  askNiche: { lv: "Kādā nozarē strādājat?", en: "What industry are you in?" },
  askWishes: {
    lv: "Kas jums būtu vissvarīgākais pilota laikā? (nav obligāti)",
    en: "What would matter most to you during the pilot? (optional)",
  },
  askContact: {
    lv: "Lieliski! Atstājiet e-pastu, un mēs sazināsimies 1 darba dienas laikā.",
    en: "Great! Leave your email and we'll get back within 1 business day.",
  },
  skip: { lv: "Izlaist", en: "Skip" },
  wishesPlaceholder: { lv: "Jūsu vēlmes vai jautājums…", en: "Your wishes or a question…" },
  noWishes: { lv: "(bez pierakstiem)", en: "(no notes)" },
  emailPlaceholder: { lv: "jusu@epasts.lv", en: "you@email.com" },
  consentPre: { lv: "Piekrītu nosūtīt savu e-pastu un", en: "I agree to send my email and to the" },
  privacy: { lv: "privātuma politikai", en: "privacy policy" },
  sendLead: { lv: "Nosūtīt pieteikumu", en: "Send application" },
  sending: { lv: "Sūta…", en: "Sending…" },
  sent: {
    lv: "Paldies! Saņēmām jūsu pieteikumu un sazināsimies drīzumā.",
    en: "Thanks! We've got your application and will be in touch soon.",
  },
  typePlaceholder: { lv: "Uzrakstīt atbildi…", en: "Type your answer…" },
  thinking: { lv: "Domāju…", en: "Thinking…" },
  close: { lv: "Aizvērt", en: "Close" },
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A small pixel-noise avatar that shimmers while the bot "thinks" - a 4x4 grid
// of cells whose opacity loops out of phase, so it reads as a resolving pixel
// mark rather than a plain spinner. Mirrors the pixel motif used across the site.
function PixelSpinner() {
  const cells = Array.from({ length: 16 });
  return (
    <span className="grid size-5 shrink-0 grid-cols-4 grid-rows-4 gap-[1.5px]">
      {cells.map((_, i) => (
        <motion.span
          key={i}
          className="rounded-[1px] bg-white/80"
          initial={{ opacity: 0.15 }}
          animate={{ opacity: [0.15, 1, 0.15] }}
          transition={{
            duration: 1.1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: ((i * 7) % 16) * 0.06,
          }}
        />
      ))}
    </span>
  );
}

type Msg = { id: number; role: "bot" | "user"; text: string };

export function LandingChat({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { locale } = useLocale();
  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [step, setStep] = React.useState<Step>("size");
  const [answers, setAnswers] = React.useState<{ size: string; niche: string; wishes: string }>({
    size: "",
    niche: "",
    wishes: "",
  });
  const [draft, setDraft] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [consent, setConsent] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [thinking, setThinking] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const nextId = React.useRef(0);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const add = React.useCallback((role: Msg["role"], text: string) => {
    setMessages((prev) => [...prev, { id: nextId.current++, role, text }]);
  }, []);

  // A bot reply always arrives after a short pixel-"thinking" beat, so the chat
  // feels like it is working the answer out rather than snapping instantly.
  const botReply = React.useCallback(
    (text: string) => {
      setThinking(true);
      window.setTimeout(() => {
        setThinking(false);
        add("bot", text);
      }, 700);
    },
    [add],
  );

  // Seed greeting + first question when opened for the first time.
  React.useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        { id: nextId.current++, role: "bot", text: `${STR.greeting[locale]} ${STR.askSize[locale]}` },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, step, thinking]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const answerSize = (value: string) => {
    add("user", value);
    setAnswers((a) => ({ ...a, size: value }));
    setStep("niche");
    botReply(STR.askNiche[locale]);
  };

  const answerNiche = (value: string) => {
    add("user", value);
    setAnswers((a) => ({ ...a, niche: value }));
    setStep("wishes");
    botReply(STR.askWishes[locale]);
  };

  const answerWishes = (value: string) => {
    add("user", value || STR.noWishes[locale]);
    setAnswers((a) => ({ ...a, wishes: value }));
    setStep("contact");
    botReply(STR.askContact[locale]);
  };

  // The bottom input drives whichever text step is active.
  const sendDraft = () => {
    const text = draft.trim();
    setDraft("");
    if (step === "size") return answerSize(text || SIZE_OPTIONS[0][locale]);
    if (step === "niche") return answerNiche(text || NICHE_OPTIONS[NICHE_OPTIONS.length - 1][locale]);
    if (step === "wishes") return answerWishes(text);
  };

  const submitLead = async () => {
    setError(null);
    setPending(true);
    const res = await submitChatLead({
      email: email.trim(),
      teamSize: answers.size,
      niche: answers.niche,
      message: answers.wishes,
    });
    setPending(false);
    if (res.ok) {
      setStep("done");
      botReply(STR.sent[locale]);
    } else {
      setError(res.error);
    }
  };

  const chip =
    "rounded-full bg-white/[0.08] px-3.5 py-1.5 text-[13.5px] font-bold text-white transition-colors hover:bg-white/[0.14]";
  const canSubmit = EMAIL_RE.test(email.trim()) && consent && !pending;
  const inputStep = step === "size" || step === "niche" || step === "wishes";
  const placeholder =
    step === "wishes" ? STR.wishesPlaceholder[locale] : STR.typePlaceholder[locale];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label={STR.close[locale]}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-md"
          />

          <div className="pointer-events-none fixed inset-0 z-[81] flex items-center justify-center p-3">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={STR.name[locale]}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto flex h-[min(600px,calc(100dvh-1.5rem))] w-[min(680px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-[24px] bg-[#2c2c2e] text-white shadow-[0_40px_120px_rgba(0,0,0,0.6)]"
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-5 pt-5 pb-3">
                <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-white/10">
                  <Image src="/shadowy.svg" alt="" width={22} height={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-bold leading-tight">{STR.name[locale]}</div>
                  <div className="text-[12px] text-white/45">{STR.status[locale]}</div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={STR.close[locale]}
                  className="grid size-8 place-items-center rounded-full text-white/55 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto px-4 py-2">
                {messages.map((m) => (
                  <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                    <div
                      className={
                        "max-w-[82%] rounded-[18px] px-3.5 py-2.5 text-[14px] leading-relaxed " +
                        (m.role === "user" ? "bg-white font-semibold text-black" : "bg-white/[0.08] text-white/90")
                      }
                    >
                      {m.text}
                    </div>
                  </div>
                ))}

                {/* Pixel "thinking" indicator */}
                {thinking && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2.5 rounded-[18px] bg-white/[0.08] px-3.5 py-2.5">
                      <PixelSpinner />
                      <span className="text-[14px] text-white/60">{STR.thinking[locale]}</span>
                    </div>
                  </div>
                )}

                {/* Step controls */}
                {!thinking && step === "size" && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {SIZE_OPTIONS.map((o) => (
                      <button key={o.lv} type="button" onClick={() => answerSize(o[locale])} className={chip}>
                        {o[locale]}
                      </button>
                    ))}
                  </div>
                )}

                {!thinking && step === "niche" && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {NICHE_OPTIONS.map((o) => (
                      <button key={o.lv} type="button" onClick={() => answerNiche(o[locale])} className={chip}>
                        {o[locale]}
                      </button>
                    ))}
                  </div>
                )}

                {!thinking && step === "wishes" && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button type="button" onClick={() => answerWishes("")} className={chip}>
                      {STR.skip[locale]}
                    </button>
                  </div>
                )}

                {/* Contact form */}
                {!thinking && step === "contact" && (
                  <div className="rounded-[18px] bg-white/[0.05] p-3.5">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={STR.emailPlaceholder[locale]}
                      className="w-full rounded-xl bg-white/[0.08] px-3.5 py-2.5 text-[14px] text-white outline-none placeholder:text-white/40 focus:bg-white/[0.12]"
                    />
                    <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-[12.5px] leading-snug text-white/70">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={consent}
                        onClick={() => setConsent((v) => !v)}
                        className={
                          "mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-[6px] border transition-colors " +
                          (consent ? "border-white bg-white text-black" : "border-white/30 text-transparent")
                        }
                      >
                        <Check className="size-3" strokeWidth={3} aria-hidden />
                      </button>
                      <span>
                        {STR.consentPre[locale]}{" "}
                        <Link href="/privacy" className="underline underline-offset-2 hover:text-white">
                          {STR.privacy[locale]}
                        </Link>
                      </span>
                    </label>
                    {error && <p className="mt-2 text-[12.5px] text-red-400">{error}</p>}
                    <button
                      type="button"
                      onClick={submitLead}
                      disabled={!canSubmit}
                      className="mt-3 w-full rounded-full bg-white py-2.5 text-[14px] font-bold text-black transition-opacity disabled:opacity-40"
                    >
                      {pending ? STR.sending[locale] : STR.sendLead[locale]}
                    </button>
                  </div>
                )}

                {step === "done" && (
                  <div className="flex items-center gap-2 px-1 pt-1 text-[13px] font-semibold text-emerald-400">
                    <CheckCircle2 className="size-4" aria-hidden />
                    {STR.sent[locale]}
                  </div>
                )}
              </div>

              {/* Input (active only on the text steps) */}
              {inputStep && !thinking && (
                <div className="px-3 pb-3 pt-1">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendDraft();
                    }}
                    className="flex items-center gap-2 rounded-full bg-white/[0.07] py-1.5 pl-4 pr-1.5"
                  >
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder={placeholder}
                      className="min-w-0 flex-1 bg-transparent py-1.5 text-[14px] text-white outline-none placeholder:text-white/40"
                    />
                    <button
                      type="submit"
                      disabled={step !== "wishes" && !draft.trim()}
                      aria-label={placeholder}
                      className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 disabled:opacity-40 disabled:hover:bg-white/15"
                    >
                      <ArrowUp className="size-4" aria-hidden />
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
