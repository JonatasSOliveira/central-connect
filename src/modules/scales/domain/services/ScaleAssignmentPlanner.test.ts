import { describe, expect, it } from "vitest";
import { ScaleAssignmentPlanner } from "./ScaleAssignmentPlanner";
import type {
  ScaleGenerationCandidate,
  ScaleGenerationMinistry,
  ScaleGenerationService,
} from "../types/scale-generation-types";

const service: ScaleGenerationService = {
  id: "service-1",
  churchId: "church-1",
  date: new Date("2026-10-04T00:00:00.000Z"),
  time: "19:00",
  dayOfWeek: "Sunday",
};

const ministries: ScaleGenerationMinistry[] = [
  {
    id: "worship",
    roles: [
      { id: "voice", ministryId: "worship", requiredCount: 1, displayOrder: 2 },
      { id: "drums", ministryId: "worship", requiredCount: 1, displayOrder: 1 },
    ],
  },
  {
    id: "deacons",
    roles: [
      { id: "monitors", ministryId: "deacons", requiredCount: 1, displayOrder: 1 },
    ],
  },
];

function candidate(
  memberId: string,
  authorizedRoleIds: string[],
  overrides: Partial<ScaleGenerationCandidate> = {},
): ScaleGenerationCandidate {
  return {
    memberId,
    fullName: memberId,
    authorizedRoleIds,
    availableDays: ["Sunday"],
    participationHistory: [],
    ...overrides,
  };
}

describe("ScaleAssignmentPlanner", () => {
  it("aloca globalmente e não coloca a mesma pessoa em dois ministérios", () => {
    const plan = new ScaleAssignmentPlanner().plan({
      service,
      ministries,
      maxConsecutiveScales: 2,
      candidates: [
        candidate("versatile", ["voice", "drums", "monitors"]),
        candidate("drummer", ["drums"]),
        candidate("monitor", ["monitors"]),
      ],
      random: () => 0.5,
    });

    const assignments = plan.ministries.flatMap((ministry) =>
      ministry.roles.flatMap((role) => role.assignments),
    );
    expect(assignments).toHaveLength(3);
    expect(new Set(assignments.map((assignment) => assignment.memberId)).size).toBe(3);
  });

  it("prioriza a função mais escassa e mantém a ordem visual da função", () => {
    const plan = new ScaleAssignmentPlanner().plan({
      service,
      ministries: [ministries[0]],
      maxConsecutiveScales: 2,
      candidates: [
        candidate("versatile", ["voice", "drums"]),
        candidate("drummer", ["drums"]),
      ],
      random: () => 0.5,
    });

    expect(plan.ministries[0].roles.map((role) => role.roleId)).toEqual([
      "drums",
      "voice",
    ]);
    expect(plan.ministries[0].roles[0].assignments[0].memberId).toBe("drummer");
  });

  it("retorna função incompleta quando não há candidato suficiente", () => {
    const plan = new ScaleAssignmentPlanner().plan({
      service,
      ministries: [ministries[1]],
      maxConsecutiveScales: 2,
      candidates: [],
    });

    const role = plan.ministries[0].roles[0];
    expect(role.missingCount).toBe(1);
    expect(role.issues[0].code).toBe("NO_ELIGIBLE_CANDIDATE");
  });

  it("respeita disponibilidade e limite de consecutividade", () => {
    const plan = new ScaleAssignmentPlanner().plan({
      service,
      ministries: [ministries[1]],
      maxConsecutiveScales: 2,
      candidates: [
        candidate("unavailable", ["monitors"], { availableDays: ["Monday"] }),
        candidate("at-limit", ["monitors"], {
          participationHistory: [
            {
              serviceId: "old-2",
              serviceDate: new Date("2026-09-27T00:00:00.000Z"),
              serviceTime: "19:00",
              dayOfWeek: "Sunday",
              participated: true,
            },
            {
              serviceId: "old-1",
              serviceDate: new Date("2026-09-20T00:00:00.000Z"),
              serviceTime: "19:00",
              dayOfWeek: "Sunday",
              participated: true,
            },
          ],
        }),
      ],
    });

    expect(plan.ministries[0].roles[0].missingCount).toBe(1);
  });

  it("bloqueia conflito de mesma data e horário", () => {
    const plan = new ScaleAssignmentPlanner().plan({
      service,
      ministries: [ministries[1]],
      maxConsecutiveScales: 2,
      candidates: [
        candidate("conflicted", ["monitors"], {
          participationHistory: [
            {
              serviceId: "other",
              serviceDate: new Date("2026-10-04T00:00:00.000Z"),
              serviceTime: "19:00",
              dayOfWeek: "Sunday",
              participated: true,
            },
          ],
        }),
      ],
    });

    expect(plan.ministries[0].roles[0].missingCount).toBe(1);
  });

  it("preserva atribuições existentes na prévia", () => {
    const plan = new ScaleAssignmentPlanner().plan({
      service,
      ministries: [ministries[1]],
      maxConsecutiveScales: 2,
      candidates: [],
      existingAssignments: [
        { memberId: "monitor", ministryId: "deacons", roleId: "monitors" },
      ],
    });

    expect(plan.ministries[0].roles[0].assignments).toEqual([
      {
        memberId: "monitor",
        ministryId: "deacons",
        roleId: "monitors",
        reason: "existing_assignment",
      },
    ]);
    expect(plan.ministries[0].isComplete).toBe(true);
  });

  it("prioriza quem participou há mais tempo", () => {
    const plan = new ScaleAssignmentPlanner().plan({
      service,
      ministries: [ministries[1]],
      maxConsecutiveScales: 2,
      candidates: [
        candidate("recent", ["monitors"], {
          participationHistory: [
            {
              serviceId: "recent-service",
              serviceDate: new Date("2026-09-27T00:00:00.000Z"),
              serviceTime: "19:00",
              dayOfWeek: "Sunday",
              participated: true,
            },
          ],
        }),
        candidate("old", ["monitors"], {
          participationHistory: [
            {
              serviceId: "old-service",
              serviceDate: new Date("2026-08-30T00:00:00.000Z"),
              serviceTime: "19:00",
              dayOfWeek: "Sunday",
              participated: true,
            },
          ],
        }),
      ],
      randomSeed: "stable-seed",
    });

    expect(plan.ministries[0].roles[0].assignments[0].memberId).toBe("old");
  });

  it("mantém a aleatoriedade estável para a mesma semente", () => {
    const input = {
      service,
      ministries: [ministries[1]],
      maxConsecutiveScales: 2,
      candidates: [candidate("one", ["monitors"]), candidate("two", ["monitors"])],
      randomSeed: "stable-seed",
    };

    const first = new ScaleAssignmentPlanner().plan(input);
    const second = new ScaleAssignmentPlanner().plan(input);
    expect(first.ministries[0].roles[0].assignments).toEqual(
      second.ministries[0].roles[0].assignments,
    );
  });
});
