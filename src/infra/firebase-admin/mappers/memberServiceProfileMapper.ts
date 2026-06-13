import type { DocumentData } from "firebase-admin/firestore";
import {
  MemberServiceProfile,
  type MemberServiceProfileParams,
} from "@/domain/entities/MemberServiceProfile";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "../helpers/firebaseHelpers";

export function memberServiceProfileToPersistence(
  profile: MemberServiceProfile,
): DocumentData {
  return convertDatesToTimestamps({
    memberId: profile.memberId,
    churchId: profile.churchId,
    currentlyServes: profile.currentlyServes,
    instrumentalPraiseInstrument: profile.instrumentalPraiseInstrument,
    otherDesiredMinistry: profile.otherDesiredMinistry,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    deletedAt: profile.deletedAt,
  });
}

export function memberServiceProfileFromPersistence(
  data: DocumentData,
  id: string,
): MemberServiceProfile {
  const convertedData = convertTimestampsToDates(data);
  const params: MemberServiceProfileParams = {
    id,
    memberId: convertedData.memberId ?? "",
    churchId: convertedData.churchId ?? "",
    currentlyServes: convertedData.currentlyServes ?? false,
    instrumentalPraiseInstrument:
      convertedData.instrumentalPraiseInstrument ?? null,
    otherDesiredMinistry: convertedData.otherDesiredMinistry ?? null,
    createdAt: convertedData.createdAt,
    updatedAt: convertedData.updatedAt,
    deletedAt: convertedData.deletedAt ?? null,
  };
  return new MemberServiceProfile(params);
}
