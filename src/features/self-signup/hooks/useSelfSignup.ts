"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  signInWithGoogle,
  signInWithGoogleRedirect,
} from "@/infra/firebase-client/services/googleAuth";
import { normalizePhone } from "@/shared/utils/phone";
import { useAuthStore } from "@/stores/authStore";
import {
  fetchSelfSignupContext,
  lookupSelfSignupPhone,
  type SelfSignupContext,
} from "./selfSignupApi";
import { clearSelfSignupDraft } from "./selfSignupDraftStorage";
import { finalizeSelfSignupAndLogin } from "./selfSignupFinalize";
import {
  clearSelfSignupRedirectPayload,
  setSelfSignupRedirectPayload,
  type SelfSignupRedirectPayload,
} from "./selfSignupRedirectStorage";
import type { UseSelfSignupReturn } from "./selfSignupTypes";
import { useSelfSignupFormState } from "./useSelfSignupFormState";
import {
  isLocalhostRuntime,
  useSelfSignupRedirectFlow,
} from "./useSelfSignupRedirectFlow";

export function useSelfSignup(churchId: string): UseSelfSignupReturn {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [context, setContext] = useState<SelfSignupContext | null>(null);
  const [isFetchingContext, setIsFetchingContext] = useState(true);
  const [isLookingUpPhone, setIsLookingUpPhone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formState = useSelfSignupFormState(churchId, context?.ministries ?? []);

  const finalizeSignupWithToken = useCallback(
    async (googleToken: string, payload: SelfSignupRedirectPayload) => {
      await finalizeSelfSignupAndLogin({
        googleToken,
        payload,
        login,
        onSuccess: () => {
          clearSelfSignupDraft(churchId);
          router.push("/select-church");
        },
      });
    },
    [churchId, login, router],
  );

  const { isProcessingRedirect } = useSelfSignupRedirectFlow({
    churchId,
    finalizeSignupWithToken,
    onError: setError,
  });

  useEffect(() => {
    const fetchContext = async () => {
      setIsFetchingContext(true);
      setError(null);

      try {
        const loadedContext = await fetchSelfSignupContext(churchId);
        setContext(loadedContext);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Não foi possível carregar a igreja";
        setError(message);
      } finally {
        setIsFetchingContext(false);
      }
    };

    fetchContext();
  }, [churchId]);

  const lookupByPhone = useCallback(async () => {
    const phone = normalizePhone(formState.form.phone);

    if (!phone) {
      setError("Informe o telefone para continuar");
      return;
    }

    setIsLookingUpPhone(true);
    setError(null);

    try {
      const lookup = await lookupSelfSignupPhone(churchId, phone);
      formState.applyLookupPrefill(
        lookup.memberExists ? lookup.prefill : undefined,
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Não foi possível consultar o telefone";
      setError(message);
    } finally {
      setIsLookingUpPhone(false);
    }
  }, [churchId, formState]);

  const finalizeWithGoogle = useCallback(
    async (acceptedTerms: boolean) => {
      const validationError = getFinalizeValidationError(
        acceptedTerms,
        context,
        formState.form,
      );
      if (validationError) {
        setError(validationError);
        return;
      }

      const stepError = formState.validateAllSteps();
      if (stepError) {
        setError(stepError);
        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const phone = normalizePhone(formState.form.phone);
        const payload: Omit<SelfSignupRedirectPayload, "createdAt"> = {
          churchId,
          fullName: formState.form.fullName,
          phone,
          acceptedTerms,
          ministryIds: formState.form.ministryIds,
          confirmNoMinistry: formState.form.confirmNoMinistry,
          memberForm: formState.form.memberForm,
        };

        if (isLocalhostRuntime()) {
          const firebaseUser = await signInWithGoogle();
          await finalizeSignupWithToken(firebaseUser.idToken, {
            ...payload,
            createdAt: Date.now(),
          });
          return;
        }

        setSelfSignupRedirectPayload(payload);
        await signInWithGoogleRedirect();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Não foi possível finalizar";
        setError(message);
        clearSelfSignupRedirectPayload();
      } finally {
        setIsSubmitting(false);
      }
    },
    [churchId, context, finalizeSignupWithToken, formState],
  );

  return {
    context,
    form: formState.form,
    isFetchingContext,
    isLookingUpPhone,
    isSubmitting: isSubmitting || isProcessingRedirect,
    phoneConfirmed: formState.phoneConfirmed,
    currentStep: formState.currentStep,
    error,
    updateField: formState.updateField,
    updateMemberFormSection: formState.updateMemberFormSection,
    lookupByPhone,
    finalizeWithGoogle,
    toggleMinistry: formState.toggleMinistry,
    toggleDesiredMinistry: formState.toggleDesiredMinistry,
    toggleAvailabilitySlot: formState.toggleAvailabilitySlot,
    togglePracticalSkill: formState.togglePracticalSkill,
    goToPreviousStep: () => {
      setError(null);
      formState.goToPreviousStep();
    },
    goToNextStep: () => {
      const stepError = formState.goToNextStep();
      setError(stepError);
      return !stepError;
    },
    setConfirmNoMinistry: formState.setConfirmNoMinistry,
  };
}

function getFinalizeValidationError(
  acceptedTerms: boolean,
  context: SelfSignupContext | null,
  form: UseSelfSignupReturn["form"],
): string | null {
  if (!context?.canProceed) {
    return context?.message ?? "Auto cadastro indisponível";
  }

  if (!acceptedTerms) return "Aceite os termos para continuar";
  if (!form.fullName.trim()) return "Informe o nome completo";
  if (!normalizePhone(form.phone)) return "Informe o telefone para continuar";

  if (form.ministryIds.length === 0 && !form.confirmNoMinistry) {
    return "Selecione ao menos um ministério ou confirme que não serve em nenhum";
  }

  return null;
}
