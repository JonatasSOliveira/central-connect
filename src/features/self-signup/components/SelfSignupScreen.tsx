"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { SelfSignupFormStep } from "@/features/self-signup/components/SelfSignupFormStep";
import { SelfSignupGoogleButton } from "@/features/self-signup/components/SelfSignupGoogleButton";
import { SelfSignupPhoneStep } from "@/features/self-signup/components/SelfSignupPhoneStep";
import { useSelfSignup } from "@/features/self-signup/hooks/useSelfSignup";

interface SelfSignupScreenProps {
  churchId: string;
}

export function SelfSignupScreen({ churchId }: SelfSignupScreenProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);

  const {
    context,
    form,
    isFetchingContext,
    isLookingUpPhone,
    isSubmitting,
    phoneConfirmed,
    error,
    updateField,
    lookupByPhone,
    finalizeWithGoogle,
  } = useSelfSignup(churchId);

  const handleFinalize = async () => {
    if (!acceptedTerms) {
      setConsentError(
        "Para continuar, é obrigatório aceitar os Termos de Uso e a Política de Privacidade.",
      );
      return;
    }

    setConsentError(null);
    await finalizeWithGoogle();
  };

  if (isFetchingContext) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background px-4 py-8">
      <div className="mx-auto w-full max-w-md">
        <Card className="border-primary/20 bg-card p-6 shadow-sm">
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Auto cadastro
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {context
              ? `Participe da escala da ${context.churchName}.`
              : "Participe da escala desta igreja."}
          </p>

          {!context?.canProceed ? (
            <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {context?.message ?? "Este auto cadastro está indisponível."}
            </div>
          ) : null}

          {error ? (
            <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          ) : null}

          {context?.canProceed ? (
            <div className="mt-6 space-y-5">
              {!phoneConfirmed ? (
                <SelfSignupPhoneStep
                  phone={form.phone}
                  isLoading={isLookingUpPhone}
                  onPhoneChange={(value) => updateField("phone", value)}
                  onContinue={lookupByPhone}
                />
              ) : (
                <>
                  <SelfSignupFormStep
                    fullName={form.fullName}
                    phone={form.phone}
                    onFullNameChange={(value) => updateField("fullName", value)}
                  />

                  <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-3">
                    <label className="flex items-start gap-2">
                      <Checkbox
                        checked={acceptedTerms}
                        onCheckedChange={(checked) => {
                          const accepted = checked === true;
                          setAcceptedTerms(accepted);
                          if (accepted) {
                            setConsentError(null);
                          }
                        }}
                      />
                      <span className="text-sm leading-5 text-foreground">
                        Declaro que li e aceito os{" "}
                        <Link
                          href="/legal/terms-of-use"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline"
                        >
                          Termos de Uso
                        </Link>{" "}
                        e a{" "}
                        <Link
                          href="/legal/privacy-policy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline"
                        >
                          Política de Privacidade
                        </Link>
                        .
                      </span>
                    </label>

                    {consentError ? (
                      <p className="text-xs text-destructive">{consentError}</p>
                    ) : null}
                  </div>

                  <SelfSignupGoogleButton
                    isLoading={isSubmitting}
                    disabled={!acceptedTerms}
                    onClick={handleFinalize}
                  />
                </>
              )}
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
