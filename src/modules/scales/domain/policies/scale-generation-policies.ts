import type { DayOfWeek } from "@/shared/domain/entities/DayOfWeek";
import type {
  ExistingScaleAssignment,
  ScaleGenerationCandidate,
  ScaleGenerationRole,
  ScaleGenerationService,
  ScaleParticipation,
} from "../types/scale-generation-types";

export function isAvailableOnDay(
  availableDays: DayOfWeek[] | null,
  day: DayOfWeek,
): boolean {
  return availableDays === null || availableDays.includes(day);
}

export function hasExactTimeConflict(
  service: ScaleGenerationService,
  history: ScaleParticipation[],
): boolean {
  const serviceDate = dateKey(service.date);
  return history.some(
    (item) =>
      item.participated &&
      dateKey(item.serviceDate) === serviceDate &&
      item.serviceTime === service.time,
  );
}

export function evaluateConsecutiveScales(
  service: ScaleGenerationService,
  candidate: ScaleGenerationCandidate,
  limit: number,
): { currentStreak: number; exceedsLimit: boolean } {
  const compatibleHistory = candidate.participationHistory
    .filter((item) => dateKey(item.serviceDate) < dateKey(service.date))
    .filter((item) => isAvailableOnDay(candidate.availableDays, item.dayOfWeek))
    .sort((a, b) => dateKey(b.serviceDate).localeCompare(dateKey(a.serviceDate)));

  let currentStreak = 0;
  for (const item of compatibleHistory) {
    if (!item.participated) break;
    currentStreak += 1;
  }

  return {
    currentStreak,
    exceedsLimit: currentStreak >= limit,
  };
}

export function isAuthorizedForRole(
  candidate: ScaleGenerationCandidate,
  role: ScaleGenerationRole,
): boolean {
  return candidate.authorizedRoleIds.includes(role.id);
}

export function hasCurrentServiceAssignment(
  candidate: ScaleGenerationCandidate,
  assignments: ExistingScaleAssignment[],
): boolean {
  return assignments.some((assignment) => assignment.memberId === candidate.memberId);
}

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}
