export function SectionDivider({ label }: { label: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent dark:from-white/[0.08]" />
      <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70 dark:text-muted-foreground/40">
        {label}
      </span>
      <div className="h-px flex-1 bg-gradient-to-l from-border to-transparent dark:from-white/[0.08]" />
    </div>
  );
}
