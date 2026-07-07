import type { SelfSignupContext } from "./selfSignupApi";
import type { SelfSignupMemberFormState } from "./selfSignupMemberFormState";

export interface SignupFormState {
  fullName: string;
  phone: string;
  ministryIds: string[];
  confirmNoMinistry: boolean;
  memberForm: SelfSignupMemberFormState;
}

export interface UseSelfSignupReturn {
  context: SelfSignupContext | null;
  form: SignupFormState;
  isFetchingContext: boolean;
  isLookingUpPhone: boolean;
  isSubmitting: boolean;
  phoneConfirmed: boolean;
  currentStep: number;
  error: string | null;
  updateField: (field: "fullName" | "phone", value: string) => void;
  updateMemberFormSection: <TSection extends keyof SelfSignupMemberFormState>(
    section: TSection,
    value: Partial<SelfSignupMemberFormState[TSection]>,
  ) => void;
  lookupByPhone: () => Promise<void>;
  finalizeWithGoogle: (acceptedTerms: boolean) => Promise<void>;
  toggleMinistry: (ministryId: string) => void;
  toggleDesiredMinistry: (ministryId: string) => void;
  toggleAvailabilitySlot: (slot: string) => void;
  togglePracticalSkill: (skill: string) => void;
  goToPreviousStep: () => void;
  goToNextStep: () => boolean;
  setConfirmNoMinistry: (value: boolean) => void;
}
