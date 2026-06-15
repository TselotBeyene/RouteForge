"use client";

import { LogIn } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { APP_NAME, LOGOUT_FLAG } from "@/lib/brand";

function readPendingLogout(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(LOGOUT_FLAG) === "1";
}

export function LoginPageClient() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const loggedOut = searchParams.get("loggedOut") === "1";
  const sessionExpired = searchParams.get("sessionExpired") === "1";
  const oauthSignInFailed = searchParams.get("error") === "OAuthSignin";
  const [pendingLogout] = useState(readPendingLogout);

  const callbackUrl = searchParams.get("callbackUrl") || "/integrations";
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  useEffect(() => {
    if (demoMode) {
      return;
    }

    if (loggedOut || sessionExpired) {
      sessionStorage.removeItem(LOGOUT_FLAG);
      void signOut({ redirect: false });
      return;
    }

    if (pendingLogout) {
      return;
    }

    if (status === "authenticated") {
      router.replace(callbackUrl);
      return;
    }

    if (status === "unauthenticated" && !oauthSignInFailed) {
      void signIn("keycloak", { callbackUrl });
    }
  }, [status, router, callbackUrl, loggedOut, sessionExpired, pendingLogout, oauthSignInFailed, demoMode]);

  if (pendingLogout && !loggedOut && !sessionExpired) {
    return (
      <main className="min-h-screen bg-[hsl(var(--paper))] px-6 py-10">
        <div className="mx-auto flex min-h-[80vh] max-w-5xl items-center justify-center">
          <div className="w-full max-w-xl border border-[hsl(var(--line))] bg-[hsl(var(--panel))] p-8 shadow-[10px_10px_0_rgba(30,28,23,0.18)]">
            <h1 className="text-3xl font-black uppercase tracking-tight text-[hsl(var(--ink))]">
              Finishing sign out…
            </h1>
            <p className="mt-4 text-sm text-[hsl(var(--muted-ink))]">
              If you are not redirected, try signing out again.
            </p>
            <a href="/logout" className="btn-primary mt-6 inline-flex">
              Back to logout
            </a>
          </div>
        </div>
      </main>
    );
  }

  if (loggedOut) {
    return (
      <main className="min-h-screen bg-[hsl(var(--paper))] px-6 py-10">
        <div className="mx-auto flex min-h-[80vh] max-w-5xl items-center justify-center">
          <div className="w-full max-w-xl border border-[hsl(var(--line))] bg-[hsl(var(--panel))] p-8 shadow-[10px_10px_0_rgba(30,28,23,0.18)]">
            <div className="mb-6">
              <div className="micro-label">Signed out</div>
              <h1 className="mt-3 text-4xl font-black uppercase tracking-tight text-[hsl(var(--ink))]">
                You have been logged out
              </h1>
              <p className="mt-4 text-sm text-[hsl(var(--muted-ink))]">
                Your {APP_NAME} session has been cleared. Sign in again to continue.
              </p>
            </div>

            <button
              type="button"
              onClick={() => signIn("keycloak", { callbackUrl: "/integrations" })}
              className="btn-primary w-full justify-center py-4"
            >
              <LogIn className="h-4 w-4" />
              Sign in again
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (oauthSignInFailed) {
    return (
      <main className="min-h-screen bg-[hsl(var(--paper))] px-6 py-10">
        <div className="mx-auto flex min-h-[80vh] max-w-5xl items-center justify-center">
          <div className="w-full max-w-xl border border-[hsl(var(--line))] bg-[hsl(var(--panel))] p-8 shadow-[10px_10px_0_rgba(30,28,23,0.18)]">
            <div className="mb-6">
              <div className="micro-label">Sign-in failed</div>
              <h1 className="mt-3 text-4xl font-black uppercase tracking-tight text-[hsl(var(--ink))]">
                Could not reach Keycloak
              </h1>
              <p className="mt-4 text-sm text-[hsl(var(--muted-ink))]">
                The app could not connect to Keycloak in time. Check that you are on the
                network that can reach KEYCLOAK_ISSUER, that Keycloak is running, and that
                NEXTAUTH_URL matches the address in your browser.
              </p>
            </div>

            <button
              type="button"
              onClick={() => signIn("keycloak", { callbackUrl })}
              className="btn-primary w-full justify-center py-4"
            >
              <LogIn className="h-4 w-4" />
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (sessionExpired) {
    return (
      <main className="min-h-screen bg-[hsl(var(--paper))] px-6 py-10">
        <div className="mx-auto flex min-h-[80vh] max-w-5xl items-center justify-center">
          <div className="w-full max-w-xl border border-[hsl(var(--line))] bg-[hsl(var(--panel))] p-8 shadow-[10px_10px_0_rgba(30,28,23,0.18)]">
            <div className="mb-6">
              <div className="micro-label">Session expired</div>
              <h1 className="mt-3 text-4xl font-black uppercase tracking-tight text-[hsl(var(--ink))]">
                Please sign in again
              </h1>
            </div>

            <button
              type="button"
              onClick={() => signIn("keycloak", { callbackUrl: "/integrations" })}
              className="btn-primary w-full justify-center py-4"
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </button>
          </div>
        </div>
      </main>
    );
  }

  return <main className="min-h-screen bg-[hsl(var(--paper))]" />;
}
