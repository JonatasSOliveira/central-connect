import type {
  CountByValue,
  MemberProfileSummaryDTO,
  MinistryCount,
} from "@/application/dtos/member-profile/MemberProfileDTO";
import type { Ministry } from "@/domain/entities";
import {
  hasProfileData,
  type MemberProfileRecord,
} from "./memberProfileModel";

function sortByCountThenLabel<T extends { count: number }>(
  items: T[],
  getLabel: (item: T) => string,
): T[] {
  return items.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return getLabel(a).localeCompare(getLabel(b), "pt-BR");
  });
}

function countValues<T extends string>(values: T[]): CountByValue<T>[] {
  const counts = new Map<T, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return sortByCountThenLabel(
    Array.from(counts.entries()).map(([value, count]) => ({ value, count })),
    (item) => item.value,
  );
}

function countMinistries(ids: string[], ministries: Ministry[]): MinistryCount[] {
  const counts = new Map<string, number>();
  const namesById = new Map(ministries.map((ministry) => [ministry.id, ministry.name]));

  for (const id of ids) {
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  return sortByCountThenLabel(
    Array.from(counts.entries()).map(([ministryId, count]) => ({
      ministryId,
      ministryName: namesById.get(ministryId) ?? "Ministerio nao encontrado",
      count,
    })),
    (item) => item.ministryName,
  );
}

export function buildMemberProfileSummary(
  allRecords: MemberProfileRecord[],
  filteredRecords: MemberProfileRecord[],
  ministries: Ministry[],
): MemberProfileSummaryDTO {
  return {
    totalMembersInChurch: allRecords.length,
    totalWithProfile: allRecords.filter(hasProfileData).length,
    totalFiltered: filteredRecords.length,
    byPracticalSkill: countValues(
      filteredRecords.flatMap((record) =>
        record.practicalSkills.map((item) => item.skill),
      ),
    ),
    byMaritalStatus: countValues(
      filteredRecords.flatMap((record) =>
        record.personalInfo ? [record.personalInfo.maritalStatus] : [],
      ),
    ),
    byAcceptedJesus: countValues(
      filteredRecords.flatMap((record) =>
        record.spiritualJourney ? [record.spiritualJourney.acceptedJesus] : [],
      ),
    ),
    byWaterBaptism: countValues(
      filteredRecords.flatMap((record) =>
        record.spiritualJourney ? [record.spiritualJourney.waterBaptized] : [],
      ),
    ),
    byCurrentMinistry: countMinistries(
      filteredRecords.flatMap((record) =>
        record.currentMinistries.map((item) => item.ministryId),
      ),
      ministries,
    ),
    byDesiredMinistry: countMinistries(
      filteredRecords.flatMap((record) =>
        record.desiredMinistries.map((item) => item.ministryId),
      ),
      ministries,
    ),
    byServiceAvailability: countValues(
      filteredRecords.flatMap((record) =>
        record.serviceAvailabilities.map((item) => item.slot),
      ),
    ),
    byMutiraoAvailability: countValues(
      filteredRecords.flatMap((record) =>
        record.professionalProfile
          ? [record.professionalProfile.mutiraoAvailability]
          : [],
      ),
    ),
  };
}
