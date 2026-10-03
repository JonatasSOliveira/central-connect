import type {
  ExistingScaleAssignment,
  ScaleAssignment,
  ScaleGenerationCandidate,
  ScaleGenerationIssue,
  ScaleGenerationMinistry,
  ScaleGenerationPlan,
  ScaleGenerationRole,
  ScaleGenerationService,
} from "../types/scale-generation-types";
import { isAuthorizedForRole } from "../policies/scale-generation-policies";
import { ScaleAssignmentSelector } from "./ScaleAssignmentSelector";

export type ScaleAssignmentPlannerInput = {
  service: ScaleGenerationService;
  ministries: ScaleGenerationMinistry[];
  candidates: ScaleGenerationCandidate[];
  existingAssignments?: ExistingScaleAssignment[];
  maxConsecutiveScales: number;
  blockedMemberIds?: Set<string>;
  randomSeed?: string;
  random?: () => number;
};

export class ScaleAssignmentPlanner {
  plan(input: ScaleAssignmentPlannerInput): ScaleGenerationPlan {
    const existingAssignments = input.existingAssignments ?? [];
    const blockedMemberIds = input.blockedMemberIds ?? new Set<string>();
    const selectedMemberIds = new Set(
      existingAssignments.map((assignment) => assignment.memberId),
    );
    const randomRanks = this.createRandomRanks(
      input.candidates,
      input.random ?? this.createSeededRandom(input.randomSeed),
    );
    const allRoles = input.ministries.flatMap((ministry) => ministry.roles);
    const alternativeCounts = this.countAlternatives(allRoles, input.candidates);
    const selector = new ScaleAssignmentSelector(
      {
        service: input.service,
        candidates: input.candidates,
        maxConsecutiveScales: input.maxConsecutiveScales,
        existingMemberIds: selectedMemberIds,
        blockedMemberIds,
      },
      randomRanks,
      alternativeCounts,
    );
    const roleOrder = [...allRoles].sort((a, b) => {
      const candidateDiff =
        selector.countAvailableCandidates(a, selectedMemberIds) -
        selector.countAvailableCandidates(b, selectedMemberIds);
      return candidateDiff || b.requiredCount - a.requiredCount;
    });

    const rolePlans = new Map<string, RolePlanningState>();
    for (const assignment of existingAssignments) {
      const state = rolePlans.get(assignment.roleId) ?? {
        assignments: [],
        issues: [],
      };
      state.assignments.push({
        memberId: assignment.memberId,
        ministryId: assignment.ministryId,
        roleId: assignment.roleId,
        reason: "existing_assignment",
      });
      rolePlans.set(assignment.roleId, state);
    }
    for (const role of roleOrder) {
      const state = rolePlans.get(role.id) ?? {
        assignments: [],
        issues: [],
      };
      for (let index = state.assignments.length; index < role.requiredCount; index += 1) {
        const score = selector.select(role, selectedMemberIds);
        if (!score) {
          state.issues.push(selector.createMissingIssue(role, selectedMemberIds));
          break;
        }
        selectedMemberIds.add(score.candidate.memberId);
        state.assignments.push({
          memberId: score.candidate.memberId,
          ministryId: role.ministryId,
          roleId: role.id,
          reason: score.reason,
        });
      }
      rolePlans.set(role.id, state);
    }

    return {
      serviceId: input.service.id,
      ministries: input.ministries.map((ministry) => ({
        ministryId: ministry.id,
        isComplete: ministry.roles.every(
          (role) => (rolePlans.get(role.id)?.assignments.length ?? 0) >= role.requiredCount,
        ),
        roles: [...ministry.roles]
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((role) => this.toRolePlan(role, rolePlans.get(role.id))),
      })),
      warnings: this.collectWarnings(rolePlans),
    };
  }

  private countAlternatives(
    roles: ScaleGenerationRole[],
    candidates: ScaleGenerationCandidate[],
  ): Map<string, number> {
    return new Map(
      candidates.map((candidate) => [
        candidate.memberId,
        roles.filter((role) => isAuthorizedForRole(candidate, role)).length,
      ]),
    );
  }

  private createRandomRanks(
    candidates: ScaleGenerationCandidate[],
    random: () => number = Math.random,
  ): Map<string, number> {
    return new Map(candidates.map((candidate) => [candidate.memberId, random()]));
  }

  private createSeededRandom(seed: string | undefined): () => number {
    if (!seed) return Math.random;
    let value = 0;
    for (const character of seed) {
      value = (value * 31 + character.charCodeAt(0)) >>> 0;
    }
    return () => {
      value += 0x6d2b79f5;
      let result = value;
      result = Math.imul(result ^ (result >>> 15), result | 1);
      result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
      return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
    };
  }

  private toRolePlan(
    role: ScaleGenerationRole,
    state: RolePlanningState | undefined,
  ) {
    const assignments = state?.assignments ?? [];
    return {
      roleId: role.id,
      requiredCount: role.requiredCount,
      assignments,
      missingCount: Math.max(role.requiredCount - assignments.length, 0),
      issues: state?.issues ?? [],
    };
  }

  private collectWarnings(
    rolePlans: Map<string, RolePlanningState>,
  ): ScaleGenerationIssue[] {
    return [...rolePlans.values()].flatMap((state) => state.issues);
  }
}

type RolePlanningState = {
  assignments: ScaleAssignment[];
  issues: ScaleGenerationIssue[];
};
