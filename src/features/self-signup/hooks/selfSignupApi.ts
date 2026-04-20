export interface SelfSignupContext {
  churchId: string;
  churchName: string;
  canProceed: boolean;
  selfSignupEnabled: boolean;
  hasDefaultRoleConfigured: boolean;
  defaultRoleId: string | null;
  message: string | null;
}

interface LookupResult {
  memberExists: boolean;
  prefill?: {
    fullName?: string;
    phone?: string;
  };
}

interface ApiResult<T> {
  ok: true;
  value: T;
}

interface ApiError {
  ok: false;
  error: {
    message?: string;
  };
}

type ApiResponse<T> = ApiResult<T> | ApiError;

function getApiErrorMessage<T>(data: ApiResponse<T>, fallback: string): string {
  if (data.ok) {
    return fallback;
  }

  return data.error?.message ?? fallback;
}

export async function fetchSelfSignupContext(
  churchId: string,
): Promise<SelfSignupContext> {
  const response = await fetch(
    `/api/public/churches/${churchId}/self-signup-context`,
  );
  const data = (await response.json()) as ApiResponse<SelfSignupContext>;

  if (!response.ok || !data.ok) {
    throw new Error(
      getApiErrorMessage(data, "Não foi possível carregar a igreja"),
    );
  }

  return data.value;
}

export async function lookupSelfSignupPhone(
  churchId: string,
  phone: string,
): Promise<LookupResult> {
  const response = await fetch(
    `/api/public/churches/${churchId}/self-signup/member-lookups`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    },
  );

  const data = (await response.json()) as ApiResponse<LookupResult>;

  if (!response.ok || !data.ok) {
    throw new Error(
      getApiErrorMessage(data, "Não foi possível consultar o telefone"),
    );
  }

  return data.value;
}

export async function finalizeSelfSignup(
  churchId: string,
  payload: {
    googleToken: string;
    fullName: string;
    phone: string;
    acceptedTerms: boolean;
  },
): Promise<void> {
  const response = await fetch(
    `/api/public/churches/${churchId}/self-signups`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  const data = (await response.json()) as ApiResponse<{ success: boolean }>;

  if (!response.ok || !data.ok) {
    throw new Error(getApiErrorMessage(data, "Não foi possível finalizar"));
  }
}
