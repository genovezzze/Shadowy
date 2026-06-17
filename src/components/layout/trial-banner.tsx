const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@shadowy.lv";

interface TrialBannerProps {
  daysLeft: number;
}

export function TrialBanner({ daysLeft }: TrialBannerProps) {
  const urgent = daysLeft <= 7;

  return (
    <div
      className={[
        "flex items-center justify-between gap-4 border-b px-8 py-2 text-sm",
        urgent
          ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300"
          : "border-border bg-muted/40 text-muted-foreground",
      ].join(" ")}
    >
      <span>
        {daysLeft === 0
          ? "Jūsu bezmaksas izmēģinājuma periods beidzas šodien."
          : `Bezmaksas izmēģinājums: atlikušas ${daysLeft} ${daysLeft === 1 ? "diena" : "dienas"}.`}
      </span>
      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className="shrink-0 font-medium underline-offset-4 hover:underline"
      >
        Sazināties par turpinājumu →
      </a>
    </div>
  );
}
