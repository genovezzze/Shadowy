import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            Pierakstīties
          </h1>

          <p className="text-sm text-muted-foreground mt-1">
            Ievadiet savu e-pastu un paroli, lai turpinātu.
          </p>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>

        <div className="mt-6 text-sm text-muted-foreground">
          Vēl nav konta?{" "}
          <Link
            href="/register"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Izveidot jaunu organizāciju
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}