import type { LegalConsent } from "@/domain/entities/LegalConsent";

export interface ILegalConsentRepository {
  create(consent: LegalConsent): Promise<LegalConsent>;
  findLatestByMemberAndChurch(
    memberId: string,
    churchId: string,
  ): Promise<LegalConsent | null>;
}
