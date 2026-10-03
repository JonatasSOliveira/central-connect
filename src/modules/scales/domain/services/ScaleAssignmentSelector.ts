import type {
  ScaleAssignment,
  ScaleGenerationCandidate,
  ScaleGenerationIssue,
  ScaleGenerationRole,
  ScaleGenerationService,
} from "../types/scale-generation-types";
import {
  evaluateConsecutiveScales,
  hasExactTimeConflict,
  isAuthorizedForRole,
  isAvailableOnDay,
} from "../policies/scale-generation-policies";

type SelectionInput = {
  service: ScaleGenerationService;
  candidates: ScaleGenerationCandidate[];
  maxConsecutiveScales: number;
  existingMemberIds: Set<string>;
  blockedMemberIds: Set<string>;
};

export type CandidateScore = {
  candidate: ScaleGenerationCandidate;
  alternativeCount: number;
  currentStreak: number;
  reason: ScaleAssignment["reason"];
};

export class ScaleAssignmentSelector {
  constructor(
    private readonly input: SelectionInput,
    private readonly randomRanks: Map<string, number>,
    private readonly alternativeCounts: Map<string, number>,
  ) {}

  select(
    role: ScaleGenerationRole,
    selectedMemberIds: Set<string>,
  ): CandidateScore | null {
    const scores = this.input.candidates
      .filter((candidate) => !selectedMemberIds.has(candidate.memberId))
      .filter((candidate) => isAuthorizedForRole(candidate, role))
      .filter((candidate) =>
        isAvailableOnDay(candidate.availableDays, this.input.service.dayOfWeek),
      )
      .filter((candidate) => !this.input.existingMemberIds.has(candidate.memberId))
      .filter((candidate) => !this.input.blockedMemberIds.has(candidate.memberId))
      .filter(
        (candidate) =>
          !hasExactTimeConflict(
            this.input.service,
            candidate.participationHistory,
          ),
      )
      .map((candidate) => {
        const consecutive = evaluateConsecutiveScales(
          this.input.service,
          candidate,
          this.input.maxConsecutiveScales,
        );
        if (consecutive.exceedsLimit) return null;
        return {
          candidate,
          alternativeCount: this.alternativeCounts.get(candidate.memberId) ?? 0,
          currentStreak: consecutive.currentStreak,
          reason: this.getReason(candidate, consecutive.currentStreak),
        };
      })
      .filter((score): score is CandidateScore => score !== null);

    scores.sort((a, b) => {
      const alternatives = a.alternativeCount - b.alternativeCount;
      if (alternatives !== 0) return alternatives;
      const recent = this.recentCount(a.candidate) - this.recentCount(b.candidate);
      if (recent !== 0) return recent;
      const lastParticipation = this.lastParticipationAt(a.candidate);
      const otherLastParticipation = this.lastParticipationAt(b.candidate);
      if (lastParticipation === null && otherLastParticipation !== null) return -1;
      if (lastParticipation !== null && otherLastParticipation === null) return 1;
      if (lastParticipation !== null && otherLastParticipation !== null) {
        const lastDiff = lastParticipation.getTime() - otherLastParticipation.getTime();
        if (lastDiff !== 0) return lastDiff;
      }
      const streak = a.currentStreak - b.currentStreak;
      if (streak !== 0) return streak;
      return (
        (this.randomRanks.get(a.candidate.memberId) ?? 0) -
        (this.randomRanks.get(b.candidate.memberId) ?? 0)
      );
    });
    return scores[0] ?? null;
  }

  countAvailableCandidates(
    role: ScaleGenerationRole,
    selectedMemberIds: Set<string>,
  ): number {
    return this.input.candidates.filter(
      (candidate) =>
        !selectedMemberIds.has(candidate.memberId) &&
        !this.input.existingMemberIds.has(candidate.memberId) &&
        !this.input.blockedMemberIds.has(candidate.memberId) &&
        isAuthorizedForRole(candidate, role) &&
        isAvailableOnDay(candidate.availableDays, this.input.service.dayOfWeek) &&
        !hasExactTimeConflict(this.input.service, candidate.participationHistory) &&
        !evaluateConsecutiveScales(
          this.input.service,
          candidate,
          this.input.maxConsecutiveScales,
        ).exceedsLimit,
    ).length;
  }

  createMissingIssue(
    role: ScaleGenerationRole,
    selectedMemberIds: Set<string>,
  ): ScaleGenerationIssue {
    const eligible = this.countAvailableCandidates(role, selectedMemberIds);
    const authorized = this.input.candidates.filter((candidate) =>
      isAuthorizedForRole(candidate, role),
    );
    const available = authorized.filter((candidate) =>
      isAvailableOnDay(candidate.availableDays, this.input.service.dayOfWeek),
    );
    const withoutTimeConflict = available.filter(
      (candidate) =>
        !hasExactTimeConflict(this.input.service, candidate.participationHistory),
    );
    const withoutConsecutiveLimit = withoutTimeConflict.filter(
      (candidate) =>
        !evaluateConsecutiveScales(
          this.input.service,
          candidate,
          this.input.maxConsecutiveScales,
        ).exceedsLimit,
    );
    const code =
      eligible > 0
        ? "INSUFFICIENT_CANDIDATES"
        : authorized.length === 0
          ? "NO_ELIGIBLE_CANDIDATE"
          : available.length === 0
            ? "ALL_CANDIDATES_UNAVAILABLE"
            : withoutTimeConflict.length === 0
              ? "ALL_CANDIDATES_IN_CONFLICT"
              : withoutConsecutiveLimit.length === 0
                ? "ALL_CANDIDATES_AT_CONSECUTIVE_LIMIT"
                : "NO_ELIGIBLE_CANDIDATE";
    return {
      code,
      message:
        code === "ALL_CANDIDATES_UNAVAILABLE"
          ? "Todas as pessoas elegíveis estão indisponíveis neste dia."
          : code === "ALL_CANDIDATES_IN_CONFLICT"
            ? "Todas as pessoas elegíveis têm conflito neste horário."
            : code === "ALL_CANDIDATES_AT_CONSECUTIVE_LIMIT"
              ? "Todas as pessoas elegíveis atingiram o limite de escalas consecutivas."
              : eligible === 0
          ? "Nenhuma pessoa elegível encontrada para esta função."
              : "Não há pessoas elegíveis suficientes para completar esta função.",
    };
  }

  private recentCount(candidate: ScaleGenerationCandidate): number {
    return candidate.participationHistory.filter((item) => item.participated).length;
  }

  private lastParticipationAt(candidate: ScaleGenerationCandidate): Date | null {
    const dates = candidate.participationHistory
      .filter((item) => item.participated)
      .map((item) => item.serviceDate.getTime());
    if (dates.length === 0) return null;
    return new Date(Math.max(...dates));
  }

  private getReason(
    candidate: ScaleGenerationCandidate,
    currentStreak: number,
  ): ScaleAssignment["reason"] {
    if (currentStreak === 0) return "longest_without_participation";
    if (candidate.authorizedRoleIds.length === 1) return "scarce_candidate";
    return "balanced_distribution";
  }
}
