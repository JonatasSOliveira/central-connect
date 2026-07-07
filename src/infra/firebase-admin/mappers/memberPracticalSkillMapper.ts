import type { DocumentData } from "firebase-admin/firestore";
import {
  MemberPracticalSkill,
  type MemberPracticalSkillParams,
} from "@/domain/entities/MemberPracticalSkill";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "../helpers/firebaseHelpers";

export function memberPracticalSkillToPersistence(
  skill: MemberPracticalSkill,
): DocumentData {
  return convertDatesToTimestamps({
    memberId: skill.memberId,
    churchId: skill.churchId,
    skill: skill.skill,
    hasDriverLicense: skill.hasDriverLicense,
    hasOwnVehicle: skill.hasOwnVehicle,
    languages: skill.languages,
    otherSkill: skill.otherSkill,
    createdAt: skill.createdAt,
    updatedAt: skill.updatedAt,
    deletedAt: skill.deletedAt,
  });
}

export function memberPracticalSkillFromPersistence(
  data: DocumentData,
  id: string,
): MemberPracticalSkill {
  const convertedData = convertTimestampsToDates(data);
  const params: MemberPracticalSkillParams = {
    id,
    memberId: convertedData.memberId ?? "",
    churchId: convertedData.churchId ?? "",
    skill: convertedData.skill,
    hasDriverLicense: convertedData.hasDriverLicense ?? null,
    hasOwnVehicle: convertedData.hasOwnVehicle ?? null,
    languages: convertedData.languages ?? null,
    otherSkill: convertedData.otherSkill ?? null,
    createdAt: convertedData.createdAt,
    updatedAt: convertedData.updatedAt,
    deletedAt: convertedData.deletedAt ?? null,
  };
  return new MemberPracticalSkill(params);
}
