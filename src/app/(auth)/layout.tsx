import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark min-h-[100svh] bg-black text-foreground lg:grid lg:grid-cols-2">
      <main className="flex min-h-[100svh] items-center justify-center bg-black px-5 py-6 sm:px-8 sm:py-8 lg:px-10 xl:px-16">
        <div className="w-full max-w-[27rem]">
          <Link
            href="/"
            aria-label="Shadowy sākumlapa"
            className="mx-auto mb-6 flex w-fit items-center gap-2.5 sm:mb-7"
          >
            <span className="grid size-9 place-items-center">
              <Image
                src="/shadowy.svg"
                alt=""
                width={32}
                height={32}
              />
            </span>
            <span className="font-display text-xl font-medium tracking-tight text-white [font-synthesis:none]">
              Shadowy
            </span>
          </Link>
          {children}
        </div>
      </main>

      <aside
        aria-label="Shadowy"
        className="relative my-2 mr-2 hidden min-h-[calc(100svh-1rem)] overflow-hidden rounded-md bg-neutral-950 lg:block"
      >
        <Image
          src="/images/shadowy_login-background.png"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover object-center"
        />
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <span className="translate-x-2 whitespace-nowrap text-center font-display text-[clamp(4rem,7vw,8rem)] font-bold leading-none tracking-[-0.045em] text-white [font-synthesis:none] drop-shadow-[0_2px_18px_rgba(0,0,0,0.24)]">
            Shadowy
          </span>
        </div>
      </aside>
    </div>
  );
}
