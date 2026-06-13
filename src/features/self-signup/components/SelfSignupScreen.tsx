"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { SelfSignupGoogleButton } from "@/features/self-signup/components/SelfSignupGoogleButton";
import { SelfSignupPhoneStep } from "@/features/self-signup/components/SelfSignupPhoneStep";
import { SelfSignupWizard } from "@/features/self-signup/components/SelfSignupWizard";
import { useSelfSignup } from "@/features/self-signup/hooks/useSelfSignup";
import { APP_VERSION } from "@/shared/constants/app";

interface SelfSignupScreenProps {
  churchId: string;
}

export function SelfSignupScreen({ churchId }: SelfSignupScreenProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);

  const {
    context,
    form,
    isFetchingContext,
    isLookingUpPhone,
    isSubmitting,
    phoneConfirmed,
    currentStep,
    error,
    updateField,
    updateMemberFormSection,
    lookupByPhone,
    finalizeWithGoogle,
    toggleMinistry,
    toggleDesiredMinistry,
    toggleAvailabilitySlot,
    togglePracticalSkill,
    goToPreviousStep,
    goToNextStep,
    setConfirmNoMinistry,
  } = useSelfSignup(churchId);
  const scrollTrigger = `${phoneConfirmed}:${currentStep}:${error ?? ""}`;

  useEffect(() => {
    if (!scrollTrigger) return;
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [scrollTrigger]);

  const handleFinalize = async () => {
    if (!acceptedTerms) {
      setConsentError(
        "Para continuar, é obrigatório aceitar os Termos de Uso e a Política de Privacidade.",
      );
      return;
    }

    setConsentError(null);
    await finalizeWithGoogle(acceptedTerms);
  };

  if (isFetchingContext) {
    return (
      <div className="flex h-full items-center justify-center bg-background px-4">
        <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className="h-full overflow-y-auto bg-background px-4 py-8 pb-24"
    >
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
                  <SelfSignupWizard
                    currentStep={currentStep}
                    fullName={form.fullName}
                    phone={form.phone}
                    memberForm={form.memberForm}
                    ministries={context.ministries}
                    confirmNoMinistry={form.confirmNoMinistry}
                    onFullNameChange={(value) => updateField("fullName", value)}
                    onSectionChange={updateMemberFormSection}
                    onToggleMinistry={toggleMinistry}
                    onToggleDesiredMinistry={toggleDesiredMinistry}
                    onToggleAvailabilitySlot={toggleAvailabilitySlot}
                    onTogglePracticalSkill={togglePracticalSkill}
                    onConfirmNoMinistry={setConfirmNoMinistry}
                    onPrevious={goToPreviousStep}
                    onNext={goToNextStep}
                  />

                  {currentStep === 5 ? (
                    <>
                      <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-3">
                        <label className="flex items-start gap-2">
                          <Checkbox
                            checked={acceptedTerms}
                            onCheckedChange={(checked) => {
                              const accepted = checked === true;
                              setAcceptedTerms(accepted);
                              if (accepted) setConsentError(null);
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
                          <p className="text-xs text-destructive">
                            {consentError}
                          </p>
                        ) : null}
                      </div>

                      <SelfSignupGoogleButton
                        isLoading={isSubmitting}
                        disabled={!acceptedTerms}
                        onClick={handleFinalize}
                      />
                    </>
                  ) : null}
                </>
              )}
            </div>
          ) : null}
        </Card>

        <p className="mt-4 text-center text-[10px] text-muted-foreground/60">
          v{APP_VERSION}
        </p>
      </div>
    </div>
  );
}
