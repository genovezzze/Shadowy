import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark relative min-h-screen bg-[#060d1c] text-foreground">
      {/* Fixed dot-grid background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 px-4 pt-3 pb-0 bg-transparent">
        <div
          className="relative mx-auto flex max-w-6xl items-center justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.015] px-4 py-2.5 backdrop-blur-2xl"
          style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 1px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)" }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: "radial-gradient(120% 100% at 50% -40%, hsl(265 70% 55% / 0.18) 0%, transparent 60%)",
            }}
          />
          <Link href="/" className="relative flex items-center gap-2.5">
            <img src="/shadowy.svg" alt="Shadowy" width={28} height={28} />
            <span className="text-base font-semibold tracking-tight text-white">Shadowy</span>
          </Link>
          <span className="relative hidden text-[13px] text-white/45 sm:block">
            Padariet neredzamo darbu redzamu
          </span>
        </div>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-72px)] flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
