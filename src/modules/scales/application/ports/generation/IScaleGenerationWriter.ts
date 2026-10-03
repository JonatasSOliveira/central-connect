import type { ScaleStatus } from "@/modules/scales/domain/entities/Scale";

export type SaveGeneratedScaleAssignment = {
  memberId: string;
  ministryRoleId: string;
};

export type SaveGeneratedScaleMinistry = {
  ministryId: string;
  assignments: SaveGeneratedScaleAssignment[];
};

export type SaveGeneratedScaleInput = {
  churchId: string;
  serviceId: string;
  ministries: SaveGeneratedScaleMinistry[];
  status: ScaleStatus;
  mode: "preserve-existing" | "replace-existing";
  actorUserId: string;
  confirmations?: ScaleGenerationConfirmation[];
};

export type ScaleGenerationConfirmation =
  | "incomplete"
  | "availability"
  | "consecutive_limit"
  | "same_time_conflict"
  | "replace_existing";

export type SavedGeneratedScale = {
  scaleId: string;
  ministryId: string;
  memberCount: number;
  status: ScaleStatus;
};

export interface IScaleGenerationWriter {
  save(input: SaveGeneratedScaleInput): Promise<SavedGeneratedScale[]>;
}
