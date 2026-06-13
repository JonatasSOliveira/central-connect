import { SelfSignupBasicDataSchema } from "@/application/dtos/self-signup/SelfSignupBasicDataDTO";
import { SelfSignupFinalNotesSchema } from "@/application/dtos/self-signup/SelfSignupFinalNotesDTO";
import { SelfSignupProfessionalProfileSchema } from "@/application/dtos/self-signup/SelfSignupProfessionalProfileDTO";
import { SelfSignupServiceProfileSchema } from "@/application/dtos/self-signup/SelfSignupServiceProfileDTO";
import { SelfSignupSpiritualJourneySchema } from "@/application/dtos/self-signup/SelfSignupSpiritualJourneyDTO";
import type { SelfSignupMemberFormState } from "./selfSignupMemberFormState";

interface MinistryOption {
  id: string;
  name: string;
}

function getFirstError(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? "Revise os campos da etapa";
}

function selectedInstrumentalMinistry(
  form: SelfSignupMemberFormState,
  ministries: MinistryOption[],
): boolean {
  const selectedIds = new Set([
    ...form.serviceProfile.currentMinistryIds,
    ...form.serviceProfile.desiredMinistryIds,
  ]);

  return ministries.some(
    (ministry) =>
      selectedIds.has(ministry.id) &&
      /instrument/i.test(
        ministry.name.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
      ),
  );
}

export function validateSelfSignupStep(
  step: number,
  form: SelfSignupMemberFormState,
  ministries: MinistryOption[],
): string | null {
  if (step === 1) {
    const result = SelfSignupBasicDataSchema.safeParse(form.basicData);
    return result.success ? null : getFirstError(result.error);
  }

  if (step === 2) {
    const result = SelfSignupSpiritualJourneySchema.safeParse(
      form.spiritualJourney,
    );
    return result.success ? null : getFirstError(result.error);
  }

  if (step === 3) {
    const result = SelfSignupServiceProfileSchema.safeParse(
      form.serviceProfile,
    );
    if (!result.success) return getFirstError(result.error);

    if (
      selectedInstrumentalMinistry(form, ministries) &&
      !form.serviceProfile.instrumentalPraiseInstrument.trim()
    ) {
      return "Informe qual instrumento";
    }

    return null;
  }

  if (step === 4) {
    const result = SelfSignupProfessionalProfileSchema.safeParse(
      form.professionalProfile,
    );
    return result.success ? null : getFirstError(result.error);
  }

  const result = SelfSignupFinalNotesSchema.safeParse(form.finalNotes);
  return result.success ? null : getFirstError(result.error);
}
