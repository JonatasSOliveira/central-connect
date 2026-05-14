import type { SelfSignupContext } from "./selfSignupApi";

export interface SignupFormState {
  fullName: string;
  phone: string;
  ministryIds: string[];
  confirmNoMinistry: boolean;
}

export interface UseSelfSignupReturn {
  context: SelfSignupContext | null;
  form: SignupFormState;
  isFetchingContext: boolean;
  isLookingUpPhone: boolean;
  isSubmitting: boolean;
  phoneConfirmed: boolean;
  error: string | null;
  updateField: (field: keyof SignupFormState, value: string) => void;
  lookupByPhone: () => Promise<void>;
  finalizeWithGoogle: (acceptedTerms: boolean) => Promise<void>;
  toggleMinistry: (ministryId: string) => void;
  setConfirmNoMinistry: (value: boolean) => void;
}
