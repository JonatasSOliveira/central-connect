const SELF_SIGNUP_REDIRECT_KEY = "self-signup-google-redirect";
const SELF_SIGNUP_REDIRECT_WINDOW_MS = 10 * 60 * 1000;

export interface SelfSignupRedirectPayload {
  churchId: string;
  fullName: string;
  phone: string;
  acceptedTerms: boolean;
  createdAt: number;
}

export function setSelfSignupRedirectPayload(
  payload: Omit<SelfSignupRedirectPayload, "createdAt">,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const value: SelfSignupRedirectPayload = {
    ...payload,
    createdAt: Date.now(),
  };

  window.sessionStorage.setItem(
    SELF_SIGNUP_REDIRECT_KEY,
    JSON.stringify(value),
  );
  window.localStorage.setItem(SELF_SIGNUP_REDIRECT_KEY, JSON.stringify(value));
}

export function clearSelfSignupRedirectPayload(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(SELF_SIGNUP_REDIRECT_KEY);
  window.localStorage.removeItem(SELF_SIGNUP_REDIRECT_KEY);
}

export function getSelfSignupRedirectPayload(): SelfSignupRedirectPayload | null {
  if (typeof window === "undefined") {
    return null;
  }

  const sessionRaw = window.sessionStorage.getItem(SELF_SIGNUP_REDIRECT_KEY);
  const localRaw = window.localStorage.getItem(SELF_SIGNUP_REDIRECT_KEY);
  const raw = sessionRaw ?? localRaw;

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SelfSignupRedirectPayload>;

    if (
      typeof parsed.churchId !== "string" ||
      typeof parsed.fullName !== "string" ||
      typeof parsed.phone !== "string" ||
      typeof parsed.acceptedTerms !== "boolean" ||
      typeof parsed.createdAt !== "number"
    ) {
      clearSelfSignupRedirectPayload();
      return null;
    }

    if (Date.now() - parsed.createdAt > SELF_SIGNUP_REDIRECT_WINDOW_MS) {
      clearSelfSignupRedirectPayload();
      return null;
    }

    return parsed as SelfSignupRedirectPayload;
  } catch {
    clearSelfSignupRedirectPayload();
    return null;
  }
}
