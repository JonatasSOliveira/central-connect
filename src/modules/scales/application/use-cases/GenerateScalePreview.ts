import type { IScaleGenerationContextReader } from "../ports/generation/IScaleGenerationContextReader";
import type { IScaleGenerationCandidateReader } from "../ports/generation/IScaleGenerationCandidateReader";
import type { IScaleGenerationHistoryReader } from "../ports/generation/IScaleGenerationHistoryReader";
import type { ScaleGenerationPreviewDTO } from "../dtos/generation/ScaleGenerationPreviewDTO";
import { ScaleAssignmentPlanner } from "../../domain/services/ScaleAssignmentPlanner";
import type { ScaleParticipation } from "../../domain/types/scale-generation-types";
import type { Result } from "@/shared/types/Result";
import { ScaleGenerationErrors } from "../errors/ScaleGenerationErrors";

export type GenerateScalePreviewUseCaseInput = {
  churchId: string;
  serviceId: string;
  ministryIds: string[];
  mode?: "preserve-existing" | "replace-existing";
};

export type GenerateScalePreviewUseCaseOutput = {
  preview: ScaleGenerationPreviewDTO;
};

export class GenerateScalePreview {
  constructor(
    private readonly contextReader: IScaleGenerationContextReader,
    private readonly candidateReader: IScaleGenerationCandidateReader,
    private readonly historyReader: IScaleGenerationHistoryReader,
    private readonly planner = new ScaleAssignmentPlanner(),
  ) {}

  async execute(
    input: GenerateScalePreviewUseCaseInput,
  ): Promise<Result<GenerateScalePreviewUseCaseOutput>> {
    const ministryIds = [...new Set(input.ministryIds)];
    if (ministryIds.length === 0) {
      return this.failure(ScaleGenerationErrors.MINISTRIES_REQUIRED);
    }

    const service = await this.contextReader.findService(
      input.churchId,
      input.serviceId,
    );
    if (!service) return this.failure(ScaleGenerationErrors.CONTEXT_INVALID);

    const ministries = await this.contextReader.findMinistries(
      input.churchId,
      ministryIds,
    );
    if (ministries.length !== ministryIds.length) {
      return this.failure(ScaleGenerationErrors.MINISTRY_INVALID);
    }

    const roleIds = ministries.flatMap((ministry) =>
      ministry.roles.map((role) => role.id),
    );
    const [candidates, existingAssignments] = await Promise.all([
      this.candidateReader.findCandidates({
        churchId: input.churchId,
        ministryIds,
        roleIds,
        serviceDayOfWeek: service.service.dayOfWeek,
      }),
      this.contextReader.findExistingAssignments(input.serviceId, ministryIds),
    ]);
    const candidateIds = candidates.map((candidate) => candidate.memberId);
    const [histories, conflictIds] = await Promise.all([
      this.historyReader.findParticipationHistory(
        input.churchId,
        candidateIds,
        service.service.date,
      ),
      this.historyReader.findExactTimeConflicts(
        input.churchId,
        candidateIds,
        service.service.date,
        service.service.time,
      ),
    ]);
    const historyByMember = new Map(
      histories.map((history) => [history.memberId, history.participationHistory]),
    );
    const plan = this.planner.plan({
      service: service.service,
      ministries,
      candidates: candidates.map((candidate) => ({
        ...candidate,
        participationHistory:
          historyByMember.get(candidate.memberId) ?? ([] as ScaleParticipation[]),
      })),
      existingAssignments:
        input.mode === "replace-existing" ? [] : existingAssignments,
      blockedMemberIds: new Set(conflictIds),
      maxConsecutiveScales: service.maxConsecutiveScales,
      randomSeed: crypto.randomUUID(),
    });

    const roleNames = new Map(
      ministries.flatMap((ministry) =>
        ministry.roles.map((role) => [role.id, role.name] as const),
      ),
    );
    const ministryNames = new Map(
      ministries.map((ministry) => [ministry.id, ministry.name]),
    );
    const memberNames = new Map(
      candidates.map((candidate) => [candidate.memberId, candidate.fullName]),
    );
    return {
      ok: true,
      value: {
        preview: {
          ...plan,
          ministries: plan.ministries.map((ministry) => ({
            ...ministry,
            ministryName: ministryNames.get(ministry.ministryId) ?? "Ministério",
            roles: ministry.roles.map((role) => ({
              ...role,
              roleName: roleNames.get(role.roleId) ?? "Função",
              assignments: role.assignments.map((assignment) => ({
                ...assignment,
                memberName: memberNames.get(assignment.memberId) ?? "Membro",
              })),
            })),
          })),
        },
      },
    };
  }

  private failure(
    error: (typeof ScaleGenerationErrors)[keyof typeof ScaleGenerationErrors],
  ): Result<GenerateScalePreviewUseCaseOutput> {
    return { ok: false, error };
  }
}
