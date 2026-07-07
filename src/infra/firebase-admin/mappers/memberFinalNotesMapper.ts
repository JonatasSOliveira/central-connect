import type { DocumentData } from "firebase-admin/firestore";
import {
  MemberFinalNotes,
  type MemberFinalNotesParams,
} from "@/domain/entities/MemberFinalNotes";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "../helpers/firebaseHelpers";

export function memberFinalNotesToPersistence(
  finalNotes: MemberFinalNotes,
): DocumentData {
  return convertDatesToTimestamps({
    memberId: finalNotes.memberId,
    churchId: finalNotes.churchId,
    healthLimitations: finalNotes.healthLimitations,
    leadershipNotes: finalNotes.leadershipNotes,
    createdAt: finalNotes.createdAt,
    updatedAt: finalNotes.updatedAt,
    deletedAt: finalNotes.deletedAt,
  });
}

export function memberFinalNotesFromPersistence(
  data: DocumentData,
  id: string,
): MemberFinalNotes {
  const convertedData = convertTimestampsToDates(data);
  const params: MemberFinalNotesParams = {
    id,
    memberId: convertedData.memberId ?? "",
    churchId: convertedData.churchId ?? "",
    healthLimitations: convertedData.healthLimitations ?? null,
    leadershipNotes: convertedData.leadershipNotes ?? null,
    createdAt: convertedData.createdAt,
    updatedAt: convertedData.updatedAt,
    deletedAt: convertedData.deletedAt ?? null,
  };
  return new MemberFinalNotes(params);
}
