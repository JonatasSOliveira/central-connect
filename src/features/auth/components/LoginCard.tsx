"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_VERSION } from "@/shared/constants/app";
import { GoogleIcon } from "./GoogleIcon";

interface LoginCardProps {
  error: string | null;
  isLoading: boolean;
  onGoogleLogin: () => Promise<void>;
}

export function LoginCard({
  error,
  isLoading,
  onGoogleLogin,
}: LoginCardProps) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-primary/20 bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
      <div>
        <p className="text-sm font-medium text-primary">Bem-vindo</p>
        <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight">
          Entre para continuar
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Use sua conta Google para acessar suas igrejas, cultos e escalas.
        </p>
      </div>

      {error && (
        <div
          className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p className="leading-5">{error}</p>
        </div>
      )}

      <div className="mt-7 space-y-4">
        <Button
          size="lg"
          variant="outline"
          className="h-12 w-full gap-3 border-border bg-background text-base font-medium hover:border-primary/40 hover:bg-muted"
          onClick={onGoogleLogin}
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          ) : (
            <GoogleIcon />
          )}
          <span>{isLoading ? "Entrando..." : "Continuar com Google"}</span>
        </Button>

        <p className="text-center text-xs leading-5 text-muted-foreground">
          Não consegue acessar? Fale com o administrador da sua igreja.
        </p>
      </div>

      <div className="mt-7 border-t border-border pt-5 text-center text-xs text-muted-foreground">
        <div className="flex justify-center gap-3">
          <a className="underline-offset-4 hover:text-foreground hover:underline" href="/legal/terms-of-use">
            Termos de uso
          </a>
          <span aria-hidden="true">·</span>
          <a className="underline-offset-4 hover:text-foreground hover:underline" href="/legal/privacy-policy">
            Privacidade
          </a>
        </div>
        <p className="mt-3 text-[11px]">v{APP_VERSION}</p>
      </div>
    </div>
  );
}
