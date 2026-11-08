export function SectionDivider({ label, apple = false }: { label: string; apple?: boolean }) {
  if (apple) {
    // iOS grouped-list header: a quiet caption sitting just above its card.
    return <h2 className="mb-2 mt-10 px-1 text-[13px] text-muted-foreground">{label}</h2>;
  }

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
