import type {
  Member,
  MemberFinalNotes,
  MemberMinistry,
  MemberMinistryInterest,
  MemberPersonalInfo,
  MemberPracticalSkill,
  MemberProfessionalProfile,
  MemberServiceAvailability,
  MemberServiceProfile,
  MemberSpiritualJourney,
} from "@/domain/entities";

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
