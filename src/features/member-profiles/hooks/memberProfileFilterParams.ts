"use client";

import type { MemberProfileFilters } from "@/application/dtos/member-profile/MemberProfileDTO";

export function buildMemberProfileQuery(
  filters: MemberProfileFilters,
): string {
  const params = new URLSearchParams();

  const appendMany = (key: string, values?: string[]) => {
    for (const value of values ?? []) {
      params.append(key, value);
    }
  };

  appendMany("practicalSkills", filters.practicalSkills);
  appendMany("acceptedJesus", filters.acceptedJesus);
  appendMany("waterBaptized", filters.waterBaptized);
  appendMany("maritalStatus", filters.maritalStatus);
  appendMany("currentMinistryIds", filters.currentMinistryIds);
  appendMany("desiredMinistryIds", filters.desiredMinistryIds);
  appendMany("availabilitySlots", filters.availabilitySlots);
  appendMany("discipleshipStatus", filters.discipleshipStatus);
  appendMany("smallGroupStatus", filters.smallGroupStatus);
  appendMany("churchAttendanceTime", filters.churchAttendanceTime);
  appendMany("officialMemberStatus", filters.officialMemberStatus);
  appendMany("mutiraoAvailability", filters.mutiraoAvailability);

  if (filters.hasChildren !== undefined) {
    params.set("hasChildren", String(filters.hasChildren));
  }
  if (filters.hasDriverLicense !== undefined) {
    params.set("hasDriverLicense", String(filters.hasDriverLicense));
  }
  if (filters.hasOwnVehicle !== undefined) {
    params.set("hasOwnVehicle", String(filters.hasOwnVehicle));
  }

  return params.toString();
}

export function toggleFilterValue<T extends string>(
  current: T[] | undefined,
  value: T,
): T[] | undefined {
  const values = current ?? [];
  const next = values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];

  return next.length > 0 ? next : undefined;
}
