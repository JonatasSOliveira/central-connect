import type { IScaleGenerationContextReader } from "../ports/generation/IScaleGenerationContextReader";
import type { IScaleGenerationCandidateReader } from "../ports/generation/IScaleGenerationCandidateReader";
import type {
  IScaleGenerationWriter,
  SaveGeneratedScaleInput,
} from "../ports/generation/IScaleGenerationWriter";
import type { IScaleGenerationHistoryReader } from "../ports/generation/IScaleGenerationHistoryReader";
import type { Result } from "@/shared/types/Result";
import { ScaleGenerationErrors } from "../errors/ScaleGenerationErrors";
import {
  evaluateConsecutiveScales,
  isAvailableOnDay,
} from "../../domain/policies/scale-generation-policies";

export type SaveGeneratedScaleUseCaseInput = SaveGeneratedScaleInput;

export type SaveGeneratedScaleUseCaseOutput = {
  scales: Awaited<ReturnType<IScaleGenerationWriter["save"]>>;
};

export class SaveGeneratedScale {
  constructor(
    private readonly writer: IScaleGenerationWriter,
    private readonly contextReader: IScaleGenerationContextReader,
    private readonly candidateReader: IScaleGenerationCandidateReader,
    private readonly historyReader: IScaleGenerationHistoryReader,
  ) {}

  async execute(
    input: SaveGeneratedScaleUseCaseInput,
  ): Promise<Result<SaveGeneratedScaleUseCaseOutput>> {
    const memberIds = input.ministries.flatMap((ministry) =>
      ministry.assignments.map((assignment) => assignment.memberId),
    );
    const ministryIds = input.ministries.map((ministry) => ministry.ministryId);
    if (new Set(ministryIds).size !== ministryIds.length) {
      return this.failure(ScaleGenerationErrors.DUPLICATE_MINISTRY);
    }
    if (new Set(memberIds).size !== memberIds.length) {
      return this.failure(ScaleGenerationErrors.DUPLICATE_MEMBER);
    }

    const uniqueMinistryIds = [...new Set(ministryIds)];
    const ministries = await this.contextReader.findMinistries(
      input.churchId,
      uniqueMinistryIds,
    );
    if (ministries.length !== uniqueMinistryIds.length) {
      return this.failure(ScaleGenerationErrors.MINISTRY_INVALID);
    }

    const roleIds = ministries.flatMap((ministry) =>
      ministry.roles.map((role) => role.id),
    );
    const service = await this.contextReader.findService(
      input.churchId,
      input.serviceId,
    );
    if (!service) return this.failure(ScaleGenerationErrors.CONTEXT_INVALID);
    const candidates = await this.candidateReader.findCandidates({
      churchId: input.churchId,
      ministryIds: uniqueMinistryIds,
      roleIds,
      serviceDayOfWeek: service.service.dayOfWeek,
      includeUnavailable: true,
    });
    const [histories, conflicts] = await Promise.all([
      this.historyReader.findParticipationHistory(
        input.churchId,
        candidates.map((candidate) => candidate.memberId),
        service.service.date,
      ),
      this.historyReader.findExactTimeConflicts(
        input.churchId,
        candidates.map((candidate) => candidate.memberId),
        service.service.date,
        service.service.time,
        input.serviceId,
      ),
    ]);
    const historyByMember = new Map(
      histories.map((history) => [history.memberId, history.participationHistory]),
    );
    const candidatesWithHistory = candidates.map((candidate) => ({
      ...candidate,
      participationHistory: historyByMember.get(candidate.memberId) ?? [],
    }));
    const eligibleAssignments = new Set(
      candidatesWithHistory.flatMap((candidate) =>
        candidate.authorizedRoleIds.map(
          (roleId) => `${candidate.memberId}:${roleId}`,
        ),
      ),
    );
    if (
      input.ministries.some((ministry) =>
        ministry.assignments.some(
          (assignment) =>
            !eligibleAssignments.has(
              `${assignment.memberId}:${assignment.ministryRoleId}`,
            ),
        ),
      )
    ) {
      return this.failure(ScaleGenerationErrors.MEMBER_NOT_ELIGIBLE);
    }

    const confirmations = new Set(input.confirmations ?? []);
    const unavailable = input.ministries.some((ministry) =>
      ministry.assignments.some((assignment) => {
        const candidate = candidatesWithHistory.find(
          (item) => item.memberId === assignment.memberId,
        );
        return (
          candidate !== undefined &&
          !isAvailableOnDay(candidate.availableDays, service.service.dayOfWeek)
        );
      }),
    );
    if (unavailable && !confirmations.has("availability")) {
      return this.failure(ScaleGenerationErrors.AVAILABILITY_CONFIRMATION_REQUIRED);
    }

    const consecutiveLimitExceeded = input.ministries.some((ministry) =>
      ministry.assignments.some((assignment) => {
        const candidate = candidatesWithHistory.find(
          (item) => item.memberId === assignment.memberId,
        );
        return (
          candidate !== undefined &&
          evaluateConsecutiveScales(
            service.service,
            candidate,
            service.maxConsecutiveScales,
          ).exceedsLimit
        );
      }),
    );
    if (
      consecutiveLimitExceeded &&
      !confirmations.has("consecutive_limit")
    ) {
      return this.failure(
        ScaleGenerationErrors.CONSECUTIVE_LIMIT_CONFIRMATION_REQUIRED,
      );
    }

    const hasTimeConflict = input.ministries.some((ministry) =>
      ministry.assignments.some((assignment) => conflicts.includes(assignment.memberId)),
    );
    if (hasTimeConflict && !confirmations.has("same_time_conflict")) {
      return this.failure(ScaleGenerationErrors.TIME_CONFLICT_CONFIRMATION_REQUIRED);
    }

    const existingAssignments = await this.contextReader.findExistingAssignments(
      input.serviceId,
      uniqueMinistryIds,
    );
    if (
      input.mode === "preserve-existing" &&
      input.ministries.some((ministry) =>
        ministry.assignments.some((assignment) =>
          existingAssignments.some(
            (existing) =>
              existing.memberId === assignment.memberId &&
              existing.ministryId !== ministry.ministryId,
          ),
        ),
      )
    ) {
      return this.failure(ScaleGenerationErrors.EXISTING_ASSIGNMENT_CONFLICT);
    }

    if (
      input.mode === "replace-existing" &&
      existingAssignments.length > 0 &&
      !confirmations.has("replace_existing")
    ) {
      return this.failure(ScaleGenerationErrors.REPLACE_CONFIRMATION_REQUIRED);
    }

    const roleCount = this.countFinalRoleAssignments(input, existingAssignments);
    const isIncomplete = ministries.some((ministry) =>
      ministry.roles.some(
        (role) => (roleCount.get(role.id) ?? 0) < role.requiredCount,
      ),
    );
    if (input.status === "published" && isIncomplete && !confirmations.has("incomplete")) {
      return this.failure(ScaleGenerationErrors.INCOMPLETE_CONFIRMATION_REQUIRED);
    }

    try {
      return { ok: true, value: { scales: await this.writer.save(input) } };
    } catch (error) {
      return this.failure(
        error instanceof Error && error.message.startsWith("SCALE_GENERATION_")
          ? { code: error.message, message: error.message }
          : ScaleGenerationErrors.SAVE_FAILED,
      );
    }
  }

  private countFinalRoleAssignments(
    input: SaveGeneratedScaleUseCaseInput,
    existingAssignments: Awaited<
      ReturnType<IScaleGenerationContextReader["findExistingAssignments"]>
    >,
  ): Map<string, number> {
    const count = new Map<string, number>();
    const existingMembers = new Set(
      input.mode === "preserve-existing"
        ? existingAssignments.map(
            (assignment) => `${assignment.ministryId}:${assignment.memberId}`,
          )
        : [],
    );
    const assignments = [
      ...(input.mode === "preserve-existing" ? existingAssignments : []),
      ...input.ministries.flatMap((ministry) =>
        ministry.assignments
          .filter(
            (assignment) =>
              !existingMembers.has(`${ministry.ministryId}:${assignment.memberId}`),
          )
          .map((assignment) => ({
            roleId: assignment.ministryRoleId,
          })),
      ),
    ];
    for (const assignment of assignments) {
      count.set(assignment.roleId, (count.get(assignment.roleId) ?? 0) + 1);
    }
    return count;
  }

  private failure(
    error: { code: string; message: string },
  ): Result<SaveGeneratedScaleUseCaseOutput> {
    return { ok: false, error };
  }
}
