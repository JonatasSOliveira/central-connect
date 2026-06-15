import type { MemberProfileFilters } from "@/application/dtos/member-profile/MemberProfileDTO";
import type { MemberProfileRecord } from "./memberProfileModel";

function matchesAny<T extends string>(
  selected: T[] | undefined,
  value: T | null | undefined,
): boolean {
  return !selected?.length || (value !== null && value !== undefined && selected.includes(value));
}

function matchesAnyFromList<T extends string>(
  selected: T[] | undefined,
  values: T[],
): boolean {
  return !selected?.length || values.some((value) => selected.includes(value));
}

function matchesBoolean(
  selected: boolean | undefined,
  value: boolean | null | undefined,
): boolean {
  return selected === undefined || value === selected;
}

export function matchesMemberProfileFilters(
  record: MemberProfileRecord,
  filters: MemberProfileFilters,
): boolean {
  const practicalSkills = record.practicalSkills.map((item) => item.skill);
  const currentMinistryIds = record.currentMinistries.map((item) => item.ministryId);
  const desiredMinistryIds = record.desiredMinistries.map((item) => item.ministryId);
  const availabilitySlots = record.serviceAvailabilities.map((item) => item.slot);
  const drivingSkill = record.practicalSkills.find((item) => item.hasDriverLicense !== null || item.hasOwnVehicle !== null);

  return (
    matchesAnyFromList(filters.practicalSkills, practicalSkills) &&
    matchesAny(filters.acceptedJesus, record.spiritualJourney?.acceptedJesus) &&
    matchesAny(filters.waterBaptized, record.spiritualJourney?.waterBaptized) &&
    matchesAny(filters.maritalStatus, record.personalInfo?.maritalStatus) &&
    matchesAnyFromList(filters.currentMinistryIds, currentMinistryIds) &&
    matchesAnyFromList(filters.desiredMinistryIds, desiredMinistryIds) &&
    matchesAnyFromList(filters.availabilitySlots, availabilitySlots) &&
    matchesAny(filters.discipleshipStatus, record.spiritualJourney?.discipleshipStatus) &&
    matchesAny(filters.smallGroupStatus, record.spiritualJourney?.smallGroupStatus) &&
    matchesAny(filters.churchAttendanceTime, record.spiritualJourney?.churchAttendanceTime) &&
    matchesAny(filters.officialMemberStatus, record.spiritualJourney?.officialMemberStatus) &&
    matchesBoolean(filters.hasChildren, record.personalInfo?.hasChildren) &&
    matchesBoolean(filters.hasDriverLicense, drivingSkill?.hasDriverLicense) &&
    matchesBoolean(filters.hasOwnVehicle, drivingSkill?.hasOwnVehicle) &&
    matchesAny(filters.mutiraoAvailability, record.professionalProfile?.mutiraoAvailability)
  );
}
