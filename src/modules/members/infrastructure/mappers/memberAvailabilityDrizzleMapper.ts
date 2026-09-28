import {
  MemberAvailability,
  type MemberAvailabilityParams,
} from "@/modules/members/domain/entities/MemberAvailability";
import type { AvailabilityMode } from "@/shared/domain/entities/AvailabilityMode";
import type { DayOfWeek } from "@/shared/domain/entities/DayOfWeek";
import type { memberAvailabilities } from "@/infra/database/drizzle/schema";

const DEFAULT_AVAILABILITY_MODE: AvailabilityMode = "BLOCK_LIST";

const VALID_DAYS: DayOfWeek[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function normalizeMode(value: string): AvailabilityMode {
  return value === "ALLOW_LIST" || value === "BLOCK_LIST"
    ? value
    : DEFAULT_AVAILABILITY_MODE;
}

function normalizeDays(value: unknown): DayOfWeek[] {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (day): day is DayOfWeek =>
      typeof day === "string" && VALID_DAYS.includes(day as DayOfWeek),
  );
}

export function memberAvailabilityFromDrizzle(
  row: typeof memberAvailabilities.$inferSelect,
): MemberAvailability {
  const params: MemberAvailabilityParams = {
    id: row.id,
    memberId: row.memberId,
    mode: normalizeMode(row.mode),
    daysOfWeek: normalizeDays(row.daysOfWeek),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  };

  return new MemberAvailability(params);
}

export function memberAvailabilityToDrizzle(entity: MemberAvailability) {
  return {
    id: entity.id,
    memberId: entity.memberId,
    mode: entity.mode,
    daysOfWeek: entity.daysOfWeek,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    deletedAt: entity.deletedAt,
  };
}
