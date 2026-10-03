import { describe, expect, it } from "vitest";
import {
  evaluateConsecutiveScales,
  hasCurrentServiceAssignment,
  hasExactTimeConflict,
  isAuthorizedForRole,
  isAvailableOnDay,
} from "./scale-generation-policies";
import type {
  ScaleGenerationCandidate,
  ScaleGenerationRole,
  ScaleGenerationService,
  ScaleParticipation,
} from "../types/scale-generation-types";

const service: ScaleGenerationService = {
  id: "service-1",
  churchId: "church-1",
  date: new Date("2026-10-04T00:00:00.000Z"),
  time: "19:00",
  dayOfWeek: "Sunday",
};

const role: ScaleGenerationRole = {
  id: "role-1",
  ministryId: "ministry-1",
  requiredCount: 1,
  displayOrder: 1,
};

function participation(
  date: string,
  participated = true,
  time = "19:00",
): ScaleParticipation {
  return {
    serviceId: date,
    serviceDate: new Date(`${date}T00:00:00.000Z`),
    serviceTime: time,
    dayOfWeek: "Sunday",
    participated,
  };
}

function candidate(overrides: Partial<ScaleGenerationCandidate> = {}) {
  return {
    memberId: "member-1",
    fullName: "Ana Silva",
    authorizedRoleIds: ["role-1"],
    availableDays: ["Sunday"],
    participationHistory: [] as ScaleParticipation[],
    ...overrides,
  } satisfies ScaleGenerationCandidate;
}

describe("scale generation policies", () => {
  it("trata disponibilidade nula como disponibilidade total", () => {
    expect(isAvailableOnDay(null, "Sunday")).toBe(true);
    expect(isAvailableOnDay(["Monday"], "Sunday")).toBe(false);
  });

  it("considera somente conflito participado no mesmo horário", () => {
    expect(hasExactTimeConflict(service, [participation("2026-10-04")])).toBe(
      true,
    );
    expect(
      hasExactTimeConflict(service, [
        participation("2026-10-04", true, "20:00"),
      ]),
    ).toBe(false);
    expect(
      hasExactTimeConflict(service, [participation("2026-10-04", false)]),
    ).toBe(false);
  });

  it("interrompe a sequência no primeiro culto não participado", () => {
    const result = evaluateConsecutiveScales(
      service,
      candidate({
        participationHistory: [
          participation("2026-09-27"),
          participation("2026-09-20", false),
          participation("2026-09-13"),
        ],
      }),
      2,
    );

    expect(result).toEqual({ currentStreak: 1, exceedsLimit: false });
  });

  it("reconhece autorização e atribuição atual", () => {
    expect(isAuthorizedForRole(candidate(), role)).toBe(true);
    expect(
      isAuthorizedForRole(candidate({ authorizedRoleIds: [] }), role),
    ).toBe(false);
    expect(
      hasCurrentServiceAssignment(candidate(), [
        { memberId: "member-1", ministryId: "ministry-1", roleId: "role-1" },
      ]),
    ).toBe(true);
  });
});
