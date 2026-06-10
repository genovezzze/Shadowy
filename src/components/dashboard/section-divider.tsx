export function SectionDivider({ label }: { label: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="h-px flex-1 bg-gradient-to-r from-white/[0.08] to-transparent" />
      <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/40">
        {label}
      </span>
      <div className="h-px flex-1 bg-gradient-to-l from-white/[0.08] to-transparent" />
    </div>
  );
}
