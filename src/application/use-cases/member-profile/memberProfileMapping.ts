import type {
  MemberProfileDetailDTO,
  MemberProfileListItemDTO,
} from "@/application/dtos/member-profile/MemberProfileDTO";
import type { Ministry } from "@/domain/entities";
import {
  hasCompleteProfile,
  type MemberProfileRecord,
} from "./memberProfileModel";

export function toMemberProfileListItem(
  record: MemberProfileRecord,
): MemberProfileListItemDTO {
  return {
    memberId: record.member.id,
    fullName: record.member.fullName,
    phone: record.member.phone,
    maritalStatus: record.personalInfo?.maritalStatus ?? null,
    acceptedJesus: record.spiritualJourney?.acceptedJesus ?? null,
    waterBaptized: record.spiritualJourney?.waterBaptized ?? null,
    currentMinistryIds: record.currentMinistries.map((item) => item.ministryId),
    desiredMinistryIds: record.desiredMinistries.map((item) => item.ministryId),
    practicalSkills: record.practicalSkills.map((item) => item.skill),
    hasCompleteProfile: hasCompleteProfile(record),
  };
}

export function toMemberProfileDetail(
  record: MemberProfileRecord,
  ministries: Ministry[],
): MemberProfileDetailDTO {
  return {
    memberId: record.member.id,
    fullName: record.member.fullName,
    email: record.member.email,
    phone: record.member.phone,
    birthDate: record.member.birthDate
      ? record.member.birthDate.toISOString().slice(0, 10)
      : null,
    hasCompleteProfile: hasCompleteProfile(record),
    personalInfo: record.personalInfo
      ? {
          maritalStatus: record.personalInfo.maritalStatus,
          hasChildren: record.personalInfo.hasChildren,
          childrenCount: record.personalInfo.childrenCount,
          childrenAges: record.personalInfo.childrenAges,
          neighborhood: record.personalInfo.neighborhood,
        }
      : null,
    spiritualJourney: record.spiritualJourney
      ? {
          acceptedJesus: record.spiritualJourney.acceptedJesus,
          waterBaptized: record.spiritualJourney.waterBaptized,
          baptismDetails: record.spiritualJourney.baptismDetails,
          discipleshipStatus: record.spiritualJourney.discipleshipStatus,
          churchAttendanceTime: record.spiritualJourney.churchAttendanceTime,
          smallGroupStatus: record.spiritualJourney.smallGroupStatus,
          officialMemberStatus: record.spiritualJourney.officialMemberStatus,
        }
      : null,
    serviceProfile: record.serviceProfile
      ? {
          currentlyServes: record.serviceProfile.currentlyServes,
          currentMinistryIds: record.currentMinistries.map((item) => item.ministryId),
          desiredMinistryIds: record.desiredMinistries.map((item) => item.ministryId),
          availabilitySlots: record.serviceAvailabilities.map((item) => item.slot),
          instrumentalPraiseInstrument:
            record.serviceProfile.instrumentalPraiseInstrument,
          otherDesiredMinistry: record.serviceProfile.otherDesiredMinistry,
        }
      : null,
    professionalProfile: record.professionalProfile
      ? {
          currentProfession: record.professionalProfile.currentProfession,
          mutiraoAvailability: record.professionalProfile.mutiraoAvailability,
          skills: record.practicalSkills.map((item) => ({
            skill: item.skill,
            hasDriverLicense: item.hasDriverLicense,
            hasOwnVehicle: item.hasOwnVehicle,
            languages: item.languages,
            otherSkill: item.otherSkill,
          })),
        }
      : null,
    finalNotes: record.finalNotes
      ? {
          healthLimitations: record.finalNotes.healthLimitations,
          leadershipNotes: record.finalNotes.leadershipNotes,
        }
      : null,
    ministriesById: Object.fromEntries(
      ministries.map((ministry) => [ministry.id, ministry.name]),
    ),
  };
}
