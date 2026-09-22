import type { MemberFinalNotes } from "@/modules/member-profiles/domain/entities/MemberFinalNotes";
import type { MemberPersonalInfo } from "@/modules/member-profiles/domain/entities/MemberPersonalInfo";
import type { MemberPracticalSkill } from "@/modules/member-profiles/domain/entities/MemberPracticalSkill";
import type { MemberProfessionalProfile } from "@/modules/member-profiles/domain/entities/MemberProfessionalProfile";
import type { MemberServiceAvailability } from "@/modules/member-profiles/domain/entities/MemberServiceAvailability";
import type { MemberServiceProfile } from "@/modules/member-profiles/domain/entities/MemberServiceProfile";
import type { MemberSpiritualJourney } from "@/modules/member-profiles/domain/entities/MemberSpiritualJourney";
import type { Member } from "@/modules/members/domain/entities/Member";
import type { MemberMinistry } from "@/modules/members/domain/entities/MemberMinistry";
import type { MemberMinistryInterest } from "@/modules/members/domain/entities/MemberMinistryInterest";

export type MemberProfileRecord = {
  member: Member;
  personalInfo: MemberPersonalInfo | null;
  spiritualJourney: MemberSpiritualJourney | null;
  serviceProfile: MemberServiceProfile | null;
  professionalProfile: MemberProfessionalProfile | null;
  finalNotes: MemberFinalNotes | null;
  currentMinistries: MemberMinistry[];
  desiredMinistries: MemberMinistryInterest[];
  serviceAvailabilities: MemberServiceAvailability[];
  practicalSkills: MemberPracticalSkill[];
};

export function hasProfileData(record: MemberProfileRecord): boolean {
  return (
    record.personalInfo !== null ||
    record.spiritualJourney !== null ||
    record.serviceProfile !== null ||
    record.professionalProfile !== null ||
    record.finalNotes !== null ||
    record.currentMinistries.length > 0 ||
    record.desiredMinistries.length > 0 ||
    record.serviceAvailabilities.length > 0 ||
    record.practicalSkills.length > 0
  );
}

export function hasCompleteProfile(record: MemberProfileRecord): boolean {
  return (
    record.personalInfo !== null &&
    record.spiritualJourney !== null &&
    record.serviceProfile !== null &&
    record.professionalProfile !== null &&
    record.finalNotes !== null
  );
}

export function groupByMemberId<T extends { memberId: string }>(
  items: T[],
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();

  for (const item of items) {
    const existing = grouped.get(item.memberId) ?? [];
    existing.push(item);
    grouped.set(item.memberId, existing);
  }

  return grouped;
}

export function indexByMemberId<T extends { memberId: string }>(
  items: T[],
): Map<string, T> {
  return new Map(items.map((item) => [item.memberId, item]));
}
