import { z } from "zod";
import { SelfSignupBasicDataSchema } from "./SelfSignupBasicDataDTO";
import { SelfSignupFinalNotesSchema } from "./SelfSignupFinalNotesDTO";
import { SelfSignupProfessionalProfileSchema } from "./SelfSignupProfessionalProfileDTO";
import { SelfSignupServiceProfileSchema } from "./SelfSignupServiceProfileDTO";
import { SelfSignupSpiritualJourneySchema } from "./SelfSignupSpiritualJourneyDTO";

export const SelfSignupMemberFormSchema = z.object({
  basicData: SelfSignupBasicDataSchema,
  spiritualJourney: SelfSignupSpiritualJourneySchema,
  serviceProfile: SelfSignupServiceProfileSchema,
  professionalProfile: SelfSignupProfessionalProfileSchema,
  finalNotes: SelfSignupFinalNotesSchema,
});

export type SelfSignupMemberFormDTO = z.infer<
  typeof SelfSignupMemberFormSchema
>;
