import { describe, expect, it, vi } from "vitest";
import { SaveGeneratedScale } from "./SaveGeneratedScale";
import type { IScaleGenerationContextReader } from "../ports/generation/IScaleGenerationContextReader";
import type { IScaleGenerationHistoryReader } from "../ports/generation/IScaleGenerationHistoryReader";
import type { IScaleGenerationWriter } from "../ports/generation/IScaleGenerationWriter";

const context: IScaleGenerationContextReader = {
  findService: vi.fn().mockResolvedValue({
    service: {
      id: "service-1",
      churchId: "church-1",
      date: new Date("2026-10-04"),
      time: "19:00",
      dayOfWeek: "Sunday",
    },
    serviceTitle: "Culto de Celebração",
    maxConsecutiveScales: 2,
  }),
  findMinistries: vi.fn().mockResolvedValue([
    {
      id: "ministry-1",
      name: "Louvor",
      roles: [
        {
          id: "role-1",
          name: "Voz",
          ministryId: "ministry-1",
          requiredCount: 1,
          displayOrder: 1,
        },
      ],
    },
  ]),
  findExistingAssignments: vi.fn().mockResolvedValue([]),
};

const history: IScaleGenerationHistoryReader = {
  findParticipationHistory: vi.fn().mockResolvedValue([]),
  findExactTimeConflicts: vi.fn().mockResolvedValue([]),
};

describe("SaveGeneratedScale rules", () => {
  it("exige confirmação para disponibilidade incompatível", async () => {
    const writer: IScaleGenerationWriter = { save: vi.fn() };
    const useCase = new SaveGeneratedScale(
      writer,
      context,
      {
        findCandidates: vi.fn().mockResolvedValue([
          {
            memberId: "member-1",
            fullName: "Ana Silva",
            authorizedRoleIds: ["role-1"],
            availableDays: ["Monday"],
            participationHistory: [],
          },
        ]),
      },
      history,
    );

    const result = await useCase.execute({
      churchId: "church-1",
      serviceId: "service-1",
      actorUserId: "user-1",
      status: "draft",
      mode: "preserve-existing",
      ministries: [
        {
          ministryId: "ministry-1",
          assignments: [{ memberId: "member-1", ministryRoleId: "role-1" }],
        },
      ],
    });

    expect(result).toMatchObject({
      ok: false,
      error: {
        code: "SCALE_GENERATION_AVAILABILITY_CONFIRMATION_REQUIRED",
      },
    });
    expect(writer.save).not.toHaveBeenCalled();
  });
});
