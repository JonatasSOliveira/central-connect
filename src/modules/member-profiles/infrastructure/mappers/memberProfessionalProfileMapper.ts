import type { DocumentData } from "firebase-admin/firestore";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "@/infra/firebase-admin/helpers/firebaseHelpers";
import {
  MemberProfessionalProfile,
  type MemberProfessionalProfileParams,
} from "@/modules/member-profiles/domain/entities/MemberProfessionalProfile";

export function memberProfessionalProfileToPersistence(
  profile: MemberProfessionalProfile,
): DocumentData {
  return convertDatesToTimestamps({
    memberId: profile.memberId,
    churchId: profile.churchId,
    currentProfession: profile.currentProfession,
    mutiraoAvailability: profile.mutiraoAvailability,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    deletedAt: profile.deletedAt,
  });
}

export function memberProfessionalProfileFromPersistence(
  data: DocumentData,
  id: string,
): MemberProfessionalProfile {
  const convertedData = convertTimestampsToDates(data);
  const params: MemberProfessionalProfileParams = {
    id,
    memberId: convertedData.memberId ?? "",
    churchId: convertedData.churchId ?? "",
    currentProfession: convertedData.currentProfession ?? "",
    mutiraoAvailability: convertedData.mutiraoAvailability,
    createdAt: convertedData.createdAt,
    updatedAt: convertedData.updatedAt,
    deletedAt: convertedData.deletedAt ?? null,
  };
  return new MemberProfessionalProfile(params);
}
