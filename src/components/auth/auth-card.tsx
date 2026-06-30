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
    <section>
      <div className="mb-5 text-center">
        <h1 className="text-balance font-accent text-[1.6rem] font-bold leading-tight tracking-[0.01em] text-white [font-synthesis:weight] sm:text-[1.8rem]">
          {title}
        </h1>
        {description ? (
          <p className="mx-auto mt-1.5 max-w-sm font-accent text-[13px] font-light leading-5 tracking-[0.01em] text-white/42">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
