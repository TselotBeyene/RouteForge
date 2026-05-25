import { Suspense } from "react";
import { LoginPageClient } from "@/app/login/LoginPageClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[hsl(var(--paper))]" />}>
      <LoginPageClient />
    </Suspense>
  );
}
