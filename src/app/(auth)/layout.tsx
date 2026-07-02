import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark min-h-[100svh] bg-black text-foreground">
      <main className="flex min-h-[100svh] items-center justify-center bg-black px-5 py-6 sm:px-6 sm:py-8">
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
    </div>
  );
}
