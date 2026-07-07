import {
  getDefaultMemberForm,
  type SelfSignupMemberFormState,
} from "./selfSignupMemberFormState";

interface SelfSignupDraft {
  fullName: string;
  phone: string;
  memberForm: SelfSignupMemberFormState;
  updatedAt: number;
}

function getDraftKey(churchId: string): string {
  return `self-signup-draft:${churchId}`;
}

export function saveSelfSignupDraft(
  churchId: string,
  draft: Omit<SelfSignupDraft, "updatedAt">,
): void {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    getDraftKey(churchId),
    JSON.stringify({ ...draft, updatedAt: Date.now() }),
  );
}

export function getSelfSignupDraft(churchId: string): SelfSignupDraft | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(getDraftKey(churchId));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<SelfSignupDraft>;
    if (
      typeof parsed.fullName !== "string" ||
      typeof parsed.phone !== "string" ||
      typeof parsed.updatedAt !== "number" ||
      typeof parsed.memberForm !== "object" ||
      parsed.memberForm === null
    ) {
      clearSelfSignupDraft(churchId);
      return null;
    }

    return {
      fullName: parsed.fullName,
      phone: parsed.phone,
      memberForm: {
        ...getDefaultMemberForm(),
        ...parsed.memberForm,
      },
      updatedAt: parsed.updatedAt,
    };
  } catch {
    clearSelfSignupDraft(churchId);
    return null;
  }
}

export function clearSelfSignupDraft(churchId: string): void {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(getDraftKey(churchId));
}
