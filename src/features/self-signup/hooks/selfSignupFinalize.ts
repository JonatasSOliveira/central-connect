import { finalizeSelfSignup } from "./selfSignupApi";
import type { SelfSignupRedirectPayload } from "./selfSignupRedirectStorage";

interface LoginResult {
  errorMessage: string | null;
}

interface FinalizeSelfSignupAndLoginParams {
  googleToken: string;
  payload: SelfSignupRedirectPayload;
  login: (token: string) => Promise<LoginResult>;
  onSuccess: () => void;
}

export async function finalizeSelfSignupAndLogin({
  googleToken,
  payload,
  login,
  onSuccess,
}: FinalizeSelfSignupAndLoginParams): Promise<void> {
  await finalizeSelfSignup(payload.churchId, {
    googleToken,
    fullName: payload.fullName,
    phone: payload.phone,
    acceptedTerms: payload.acceptedTerms,
    ministryIds: payload.ministryIds,
    confirmNoMinistry: payload.confirmNoMinistry,
    memberForm: payload.memberForm,
  });

  const loginResult = await login(googleToken);
  if (loginResult.errorMessage) {
    throw new Error(loginResult.errorMessage);
  }

  onSuccess();
}
