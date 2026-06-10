import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <img src="/logo.png" alt="Shadowy" width={56} height={56} />
        </div>

        <div>
          <p className="text-5xl font-bold text-muted-foreground/30">404</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Lapa nav atrasta
          </h1>
          <p className="mt-3 text-muted-foreground">
            Šāda lapa neeksistē. Iespējams, saite ir novecojusi vai nepareiza.
          </p>
        </div>

        <Button asChild>
          <Link href="/">Doties uz sākumu</Link>
        </Button>
      </div>
    </div>
  );
}
