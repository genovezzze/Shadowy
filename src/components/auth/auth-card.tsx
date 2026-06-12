export function AuthCard({
  title,
  description,
  children,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl border border-white/[0.07] bg-white/[0.015] p-8">
      <div className="mb-6">
        <h1 className="font-display font-black text-3xl tracking-tight text-white">{title}</h1>
        {description ? (
          <p className="mt-1.5 text-sm leading-relaxed text-white/45">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}
