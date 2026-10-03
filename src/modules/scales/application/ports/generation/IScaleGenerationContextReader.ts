import type {
  ScaleGenerationMinistry,
  ScaleGenerationService,
  ScaleParticipation,
} from "@/modules/scales/domain/types/scale-generation-types";
import type { DayOfWeek } from "@/shared/domain/entities/DayOfWeek";

export type ScaleGenerationServiceContext = {
  service: ScaleGenerationService;
  serviceTitle: string;
  maxConsecutiveScales: number;
};

export type ScaleGenerationMinistryContext = Omit<
  ScaleGenerationMinistry,
  "roles"
> & {
  name: string;
  roles: (ScaleGenerationMinistry["roles"][number] & { name: string })[];
};

export type ScaleGenerationCandidateContext = {
  memberId: string;
  fullName: string;
  authorizedRoleIds: string[];
  availableDays: DayOfWeek[] | null;
  participationHistory: ScaleParticipation[];
};

export type ScaleGenerationExistingAssignment = {
  memberId: string;
  ministryId: string;
  roleId: string;
};

export interface IScaleGenerationContextReader {
  findService(
    churchId: string,
    serviceId: string,
  ): Promise<ScaleGenerationServiceContext | null>;

  findMinistries(
    churchId: string,
    ministryIds: string[],
  ): Promise<ScaleGenerationMinistryContext[]>;

  findExistingAssignments(
    serviceId: string,
    ministryIds: string[],
  ): Promise<ScaleGenerationExistingAssignment[]>;
}
