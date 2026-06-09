import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-5">
          <h1 className="text-xl font-semibold tracking-tight">
            Izveidot organizāciju
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Organizācija + pirmais administratora konts.
          </p>
        </div>
        <RegisterForm />
        <div className="mt-4 text-xs text-muted-foreground text-center">
          Jau ir konts?{" "}
          <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Pieslēgties
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
