import { acceptedJesusStatusLabels, churchAttendanceTimeLabels, discipleshipStatusLabels, officialMemberStatusLabels, smallGroupStatusLabels, waterBaptismStatusLabels } from "@/features/self-signup/constants/spiritualJourneyLabels";
import { maritalStatusLabels } from "@/features/self-signup/constants/maritalStatusLabels";
import { mutiraoAvailabilityLabels, practicalSkillLabels } from "@/features/self-signup/constants/practicalSkillLabels";
import { serviceAvailabilityLabels } from "@/features/self-signup/constants/serviceAvailabilityLabels";

export const memberProfileLabels = {
  acceptedJesus: acceptedJesusStatusLabels,
  waterBaptized: waterBaptismStatusLabels,
  discipleshipStatus: discipleshipStatusLabels,
  churchAttendanceTime: churchAttendanceTimeLabels,
  smallGroupStatus: smallGroupStatusLabels,
  officialMemberStatus: officialMemberStatusLabels,
  maritalStatus: maritalStatusLabels,
  practicalSkills: practicalSkillLabels,
  availabilitySlots: serviceAvailabilityLabels,
  mutiraoAvailability: mutiraoAvailabilityLabels,
};

export function yesNoLabel(value: boolean | null | undefined): string {
  if (value === true) return "Sim";
  if (value === false) return "Nao";
  return "Nao informado";
}

export function labelList(
  ids: string[],
  labelsById: Record<string, string>,
): string {
  if (ids.length === 0) return "Nao informado";
  return ids.map((id) => labelsById[id] ?? id).join(", ");
}
