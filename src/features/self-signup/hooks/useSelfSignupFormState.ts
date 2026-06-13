"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getSelfSignupDraft,
  saveSelfSignupDraft,
} from "./selfSignupDraftStorage";
import {
  setAvailabilitySlot,
  setCurrentMinistry,
  setDesiredMinistry,
  setPracticalSkill,
} from "./selfSignupFormMutations";
import { getDefaultMemberForm } from "./selfSignupMemberFormState";
import { validateSelfSignupStep } from "./selfSignupStepValidation";
import type { SignupFormState } from "./selfSignupTypes";

interface MinistryOption {
  id: string;
  name: string;
}

function getInitialForm(): SignupFormState {
  return {
    fullName: "",
    phone: "",
    ministryIds: [],
    confirmNoMinistry: false,
    memberForm: getDefaultMemberForm(),
  };
}

export function useSelfSignupFormState(
  churchId: string,
  ministries: MinistryOption[],
) {
  const [form, setForm] = useState<SignupFormState>(getInitialForm);
  const [phoneConfirmed, setPhoneConfirmed] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const draft = getSelfSignupDraft(churchId);
    if (!draft) return;

    setForm((state) => ({
      ...state,
      fullName: draft.fullName || state.fullName,
      phone: draft.phone || state.phone,
      ministryIds: draft.memberForm.serviceProfile.currentMinistryIds,
      confirmNoMinistry:
        draft.memberForm.serviceProfile.currentMinistryIds.length === 0,
      memberForm: draft.memberForm,
    }));

    if (draft.phone) setPhoneConfirmed(true);
  }, [churchId]);

  useEffect(() => {
    if (!form.fullName.trim() && !form.phone.trim()) return;

    saveSelfSignupDraft(churchId, {
      fullName: form.fullName,
      phone: form.phone,
      memberForm: form.memberForm,
    });
  }, [churchId, form]);

  const updateField = useCallback(
    (field: "fullName" | "phone", value: string) => {
      setForm((state) => ({ ...state, [field]: value }));
    },
    [],
  );

  const updateMemberFormSection = useCallback(
    <TSection extends keyof SignupFormState["memberForm"]>(
      section: TSection,
      value: Partial<SignupFormState["memberForm"][TSection]>,
    ) => {
      setForm((state) => ({
        ...state,
        memberForm: {
          ...state.memberForm,
          [section]: { ...state.memberForm[section], ...value },
        },
      }));
    },
    [],
  );

  const applyLookupPrefill = useCallback(
    (prefill?: { fullName?: string; phone?: string }) => {
      setForm((state) => ({
        ...state,
        fullName: prefill?.fullName || state.fullName,
        phone: prefill?.phone || state.phone,
        memberForm: {
          ...state.memberForm,
          serviceProfile: {
            ...state.memberForm.serviceProfile,
            currentMinistryIds: state.ministryIds,
          },
        },
      }));
      setPhoneConfirmed(true);
    },
    [],
  );

  const toggleMinistry = useCallback((ministryId: string) => {
    setForm((state) => setCurrentMinistry(state, ministryId));
  }, []);

  const toggleDesiredMinistry = useCallback((ministryId: string) => {
    setForm((state) => setDesiredMinistry(state, ministryId));
  }, []);

  const toggleAvailabilitySlot = useCallback((slot: string) => {
    setForm((state) => setAvailabilitySlot(state, slot));
  }, []);

  const togglePracticalSkill = useCallback((skill: string) => {
    setForm((state) => setPracticalSkill(state, skill));
  }, []);

  const goToPreviousStep = useCallback(() => {
    setCurrentStep((step) => Math.max(1, step - 1));
  }, []);

  const validateCurrentStep = useCallback(() => {
    return validateSelfSignupStep(currentStep, form.memberForm, ministries);
  }, [currentStep, form.memberForm, ministries]);

  const goToNextStep = useCallback(() => {
    const error = validateCurrentStep();
    if (error) return error;

    setCurrentStep((step) => Math.min(5, step + 1));
    return null;
  }, [validateCurrentStep]);

  const validateAllSteps = useCallback(() => {
    for (let step = 1; step <= 5; step += 1) {
      const error = validateSelfSignupStep(step, form.memberForm, ministries);
      if (error) {
        setCurrentStep(step);
        return error;
      }
    }
    return null;
  }, [form.memberForm, ministries]);

  const setConfirmNoMinistry = useCallback((value: boolean) => {
    setForm((state) => ({
      ...state,
      confirmNoMinistry: value,
      ...(value ? { ministryIds: [] } : {}),
      memberForm: {
        ...state.memberForm,
        serviceProfile: {
          ...state.memberForm.serviceProfile,
          currentlyServes: value
            ? false
            : state.memberForm.serviceProfile.currentlyServes,
          currentMinistryIds: value
            ? []
            : state.memberForm.serviceProfile.currentMinistryIds,
        },
      },
    }));
  }, []);

  return {
    form,
    phoneConfirmed,
    currentStep,
    updateField,
    updateMemberFormSection,
    applyLookupPrefill,
    toggleMinistry,
    toggleDesiredMinistry,
    toggleAvailabilitySlot,
    togglePracticalSkill,
    goToPreviousStep,
    goToNextStep,
    validateAllSteps,
    setConfirmNoMinistry,
  };
}
