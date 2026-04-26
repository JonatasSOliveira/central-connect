import type { DocumentData } from "firebase-admin/firestore";
import {
  MemberAvailability,
  type MemberAvailabilityParams,
} from "@/domain/entities/MemberAvailability";
import type { AvailabilityMode } from "@/domain/entities/AvailabilityMode";
import type { DayOfWeek } from "@/domain/entities/DayOfWeek";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "../helpers/firebaseHelpers";

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

function isValidDayOfWeek(value: unknown): value is DayOfWeek {
  return typeof value === "string" && VALID_DAYS.includes(value as DayOfWeek);
}

function normalizeDaysOfWeek(days: unknown): DayOfWeek[] {
  if (!Array.isArray(days)) {
    return [];
  }

  return days.filter(isValidDayOfWeek);
}

function normalizeMode(mode: unknown): AvailabilityMode {
  if (mode === "ALLOW_LIST" || mode === "BLOCK_LIST") {
    return mode;
  }

  return DEFAULT_AVAILABILITY_MODE;
}

export function memberAvailabilityToPersistence(
  memberAvailability: MemberAvailability,
): DocumentData {
  return convertDatesToTimestamps({
    memberId: memberAvailability.memberId,
    mode: memberAvailability.mode,
    daysOfWeek: memberAvailability.daysOfWeek,
    createdAt: memberAvailability.createdAt,
    updatedAt: memberAvailability.updatedAt,
    deletedAt: memberAvailability.deletedAt,
  });
}

export function memberAvailabilityFromPersistence(
  data: DocumentData,
  id: string,
): MemberAvailability {
  const convertedData = convertTimestampsToDates(data);

  const params: MemberAvailabilityParams = {
    id,
    memberId: convertedData.memberId ?? id,
    mode: normalizeMode(convertedData.mode),
    daysOfWeek: normalizeDaysOfWeek(convertedData.daysOfWeek),
    createdAt: convertedData.createdAt,
    updatedAt: convertedData.updatedAt,
  };

  return new MemberAvailability(params);
}
