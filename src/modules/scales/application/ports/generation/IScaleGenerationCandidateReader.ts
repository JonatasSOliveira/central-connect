import type { DayOfWeek } from "@/shared/domain/entities/DayOfWeek";
import type { ScaleGenerationCandidateContext } from "./IScaleGenerationContextReader";

export type FindScaleGenerationCandidatesInput = {
  churchId: string;
  ministryIds: string[];
  roleIds: string[];
  serviceDayOfWeek: DayOfWeek;
  includeUnavailable?: boolean;
};

export interface IScaleGenerationCandidateReader {
  findCandidates(
    input: FindScaleGenerationCandidatesInput,
  ): Promise<ScaleGenerationCandidateContext[]>;
}
