import type { DocumentData } from "firebase-admin/firestore";
import {
  LegalConsent,
  type LegalConsentParams,
} from "@/domain/entities/LegalConsent";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "../helpers/firebaseHelpers";

export function legalConsentToPersistence(consent: LegalConsent): DocumentData {
  return convertDatesToTimestamps({
    memberId: consent.memberId,
    userId: consent.userId,
    churchId: consent.churchId,
    termsVersion: consent.termsVersion,
    privacyPolicyVersion: consent.privacyPolicyVersion,
    acceptedAt: consent.acceptedAt,
    ipAddress: consent.ipAddress,
    userAgent: consent.userAgent,
    source: consent.source,
    createdAt: consent.createdAt,
    updatedAt: consent.updatedAt,
    deletedAt: consent.deletedAt,
  });
}

export function legalConsentFromPersistence(
  data: DocumentData,
  id: string,
): LegalConsent {
  const convertedData = convertTimestampsToDates(data);

  const params: LegalConsentParams = {
    id,
    memberId: convertedData.memberId,
    userId: convertedData.userId,
    churchId: convertedData.churchId,
    termsVersion: convertedData.termsVersion,
    privacyPolicyVersion: convertedData.privacyPolicyVersion,
    acceptedAt: convertedData.acceptedAt,
    ipAddress: convertedData.ipAddress ?? null,
    userAgent: convertedData.userAgent ?? null,
    source: convertedData.source ?? "self-signup",
    createdAt: convertedData.createdAt,
    updatedAt: convertedData.updatedAt,
    deletedAt: convertedData.deletedAt,
  };

  return new LegalConsent(params);
}
