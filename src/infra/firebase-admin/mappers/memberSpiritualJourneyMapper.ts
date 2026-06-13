import type { DocumentData } from "firebase-admin/firestore";
import {
  MemberSpiritualJourney,
  type MemberSpiritualJourneyParams,
} from "@/domain/entities/MemberSpiritualJourney";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "../helpers/firebaseHelpers";

export function memberSpiritualJourneyToPersistence(
  journey: MemberSpiritualJourney,
): DocumentData {
  return convertDatesToTimestamps({
    memberId: journey.memberId,
    churchId: journey.churchId,
    acceptedJesus: journey.acceptedJesus,
    waterBaptized: journey.waterBaptized,
    baptismDetails: journey.baptismDetails,
    discipleshipStatus: journey.discipleshipStatus,
    churchAttendanceTime: journey.churchAttendanceTime,
    smallGroupStatus: journey.smallGroupStatus,
    officialMemberStatus: journey.officialMemberStatus,
    createdAt: journey.createdAt,
    updatedAt: journey.updatedAt,
    deletedAt: journey.deletedAt,
  });
}

export function memberSpiritualJourneyFromPersistence(
  data: DocumentData,
  id: string,
): MemberSpiritualJourney {
  const convertedData = convertTimestampsToDates(data);
  const params: MemberSpiritualJourneyParams = {
    id,
    memberId: convertedData.memberId ?? "",
    churchId: convertedData.churchId ?? "",
    acceptedJesus: convertedData.acceptedJesus,
    waterBaptized: convertedData.waterBaptized,
    baptismDetails: convertedData.baptismDetails ?? null,
    discipleshipStatus: convertedData.discipleshipStatus,
    churchAttendanceTime: convertedData.churchAttendanceTime,
    smallGroupStatus: convertedData.smallGroupStatus,
    officialMemberStatus: convertedData.officialMemberStatus,
    createdAt: convertedData.createdAt,
    updatedAt: convertedData.updatedAt,
    deletedAt: convertedData.deletedAt ?? null,
  };
  return new MemberSpiritualJourney(params);
}
