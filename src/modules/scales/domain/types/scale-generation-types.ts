import type { DayOfWeek } from "@/shared/domain/entities/DayOfWeek";

export type ScaleGenerationService = {
  id: string;
  churchId: string;
  date: Date;
  time: string;
  dayOfWeek: DayOfWeek;
};

export type ScaleGenerationRole = {
  id: string;
  ministryId: string;
  requiredCount: number;
  displayOrder: number;
};

export type ScaleGenerationMinistry = {
  id: string;
  roles: ScaleGenerationRole[];
};

export type ScaleParticipation = {
  serviceId: string;
  serviceDate: Date;
  serviceTime: string;
  dayOfWeek: DayOfWeek;
  participated: boolean;
};

export type ScaleGenerationCandidate = {
  memberId: string;
  fullName: string;
  authorizedRoleIds: string[];
  availableDays: DayOfWeek[] | null;
  participationHistory: ScaleParticipation[];
};

export type ExistingScaleAssignment = {
  memberId: string;
  ministryId: string;
  roleId: string;
};

export type ScaleGenerationIssueCode =
  | "NO_ELIGIBLE_CANDIDATE"
  | "INSUFFICIENT_CANDIDATES"
  | "CONSECUTIVE_LIMIT_REACHED"
  | "TIME_CONFLICT"
  | "ALL_CANDIDATES_UNAVAILABLE"
  | "ALL_CANDIDATES_IN_CONFLICT"
  | "ALL_CANDIDATES_AT_CONSECUTIVE_LIMIT";

export type ScaleGenerationIssue = {
  code: ScaleGenerationIssueCode;
  message: string;
  memberId?: string;
};

export type ScaleAssignmentReason =
  | "existing_assignment"
  | "longest_without_participation"
  | "scarce_candidate"
  | "balanced_distribution"
  | "random_tiebreak";

export type ScaleAssignment = {
  memberId: string;
  ministryId: string;
  roleId: string;
  reason: ScaleAssignmentReason;
};

export type ScaleRolePlan = {
  roleId: string;
  requiredCount: number;
  assignments: ScaleAssignment[];
  missingCount: number;
  issues: ScaleGenerationIssue[];
};

export type ScaleMinistryPlan = {
  ministryId: string;
  isComplete: boolean;
  roles: ScaleRolePlan[];
};

export type ScaleGenerationPlan = {
  serviceId: string;
  ministries: ScaleMinistryPlan[];
  warnings: ScaleGenerationIssue[];
};
