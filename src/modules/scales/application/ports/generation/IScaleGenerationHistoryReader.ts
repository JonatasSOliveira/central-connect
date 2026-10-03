import type { ScaleParticipation } from "@/modules/scales/domain/types/scale-generation-types";

export type ScaleMemberParticipationHistory = {
  memberId: string;
  participationHistory: ScaleParticipation[];
};

export interface IScaleGenerationHistoryReader {
  findParticipationHistory(
    churchId: string,
    memberIds: string[],
    beforeDate: Date,
  ): Promise<ScaleMemberParticipationHistory[]>;

  findExactTimeConflicts(
    churchId: string,
    memberIds: string[],
    serviceDate: Date,
    serviceTime: string,
    excludeServiceId?: string,
  ): Promise<string[]>;
}
