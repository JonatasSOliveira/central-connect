"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLoginScreen } from "@/features/auth/hooks/useLoginScreen";
import { APP_VERSION } from "@/shared/constants/app";
import { Logo } from "@/components/ui/logo";

export default function LoginPage() {
  const { isLoading, error, handleGoogleLogin } = useLoginScreen();

  return (
    <div className="min-h-dvh bg-muted/30">
      <section className="rounded-b-[2rem] bg-primary px-6 pb-14 pt-12 text-primary-foreground">
        <Logo variant="light" className="mx-auto h-24 w-24" priority />

        <h1 className="mt-5 text-center font-heading text-3xl font-bold">
          Central Connect
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-center text-sm text-primary-foreground/80">
          Escalas e equipes da sua igreja, em um só lugar.
        </p>
      </section>

      <div className="mx-auto -mt-5 w-full max-w-sm px-5">
        <div className="animate-in fade-in zoom-in rounded-2xl border bg-card p-5 shadow-sm duration-500">
          <h2 className="font-heading text-xl font-semibold">Acesse sua igreja</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Entre com sua conta Google para continuar.
          </p>

        {error && (
          <div className="w-full mt-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive leading-relaxed">
                {error}
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 w-full space-y-4">
          <Button
            size="lg"
            variant="outline"
            className="h-12 w-full gap-3 bg-background text-base font-medium"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {isLoading ? "Entrando..." : "Entrar com o Google"}
          </Button>
        </div>

        <p className="mt-6 text-center text-[10px] text-muted-foreground/60">
          v{APP_VERSION}
        </p>
        </div>
      </div>
    </div>
  );
}
