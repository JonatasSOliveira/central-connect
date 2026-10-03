import { describe, expect, it, vi } from "vitest";
import { GenerateScalePreview } from "./GenerateScalePreview";
import { SaveGeneratedScale } from "./SaveGeneratedScale";
import type { IScaleGenerationContextReader } from "../ports/generation/IScaleGenerationContextReader";
import type { IScaleGenerationHistoryReader } from "../ports/generation/IScaleGenerationHistoryReader";
import type { IScaleGenerationWriter } from "../ports/generation/IScaleGenerationWriter";

const serviceContext = {
  service: {
    id: "service-1",
    churchId: "church-1",
    date: new Date("2026-10-04T00:00:00.000Z"),
    time: "19:00",
    dayOfWeek: "Sunday" as const,
  },
  serviceTitle: "Culto de Celebração",
  maxConsecutiveScales: 2,
};

function contextReader(): IScaleGenerationContextReader {
  return {
    findService: vi.fn().mockResolvedValue(serviceContext),
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
}

describe("generation application contracts", () => {
  it("monta a prévia sem persistir dados", async () => {
    const context = contextReader();
    const history: IScaleGenerationHistoryReader = {
      findParticipationHistory: vi
        .fn()
        .mockResolvedValue([
          { memberId: "member-1", participationHistory: [] },
        ]),
      findExactTimeConflicts: vi.fn().mockResolvedValue([]),
    };
    const useCase = new GenerateScalePreview(
      context,
      {
        findCandidates: vi.fn().mockResolvedValue([
          {
            memberId: "member-1",
            fullName: "Ana Silva",
            authorizedRoleIds: ["role-1"],
            availableDays: ["Sunday"],
            participationHistory: [],
          },
        ]),
      },
      history,
    );

    const result = await useCase.execute({
      churchId: "church-1",
      serviceId: "service-1",
      ministryIds: ["ministry-1"],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.preview.ministries[0].ministryName).toBe("Louvor");
    expect(result.value.preview.ministries[0].roles[0].roleName).toBe("Voz");
    expect(
      result.value.preview.ministries[0].roles[0].assignments[0].memberName,
    ).toBe("Ana Silva");
  });

  it("rejeita duplicidade de membro antes de chamar o writer", async () => {
    const writer: IScaleGenerationWriter = { save: vi.fn() };
    const useCase = new SaveGeneratedScale(
      writer,
      contextReader(),
      {
        findCandidates: vi.fn().mockResolvedValue([
          {
            memberId: "member-1",
            fullName: "Ana Silva",
            authorizedRoleIds: ["role-1"],
            availableDays: ["Sunday"],
            participationHistory: [],
          },
        ]),
      },
      {
        findParticipationHistory: vi.fn().mockResolvedValue([]),
        findExactTimeConflicts: vi.fn().mockResolvedValue([]),
      },
    );

    const result = await useCase.execute({
      churchId: "church-1",
      serviceId: "service-1",
      actorUserId: "user-1",
      status: "draft",
      mode: "replace-existing",
      ministries: [
        {
          ministryId: "ministry-1",
          assignments: [{ memberId: "member-1", ministryRoleId: "role-1" }],
        },
        {
          ministryId: "ministry-2",
          assignments: [{ memberId: "member-1", ministryRoleId: "role-2" }],
        },
      ],
    });

    expect(result).toEqual({
      ok: false,
      error: {
        code: "SCALE_GENERATION_DUPLICATE_MEMBER",
        message: "O mesmo membro não pode ser escalado duas vezes no culto",
      },
    });
    expect(writer.save).not.toHaveBeenCalled();
  });

  it("exige confirmação para publicar uma escala incompleta", async () => {
    const writer: IScaleGenerationWriter = {
      save: vi.fn().mockResolvedValue([]),
    };
    const useCase = new SaveGeneratedScale(
      writer,
      contextReader(),
      { findCandidates: vi.fn().mockResolvedValue([]) },
      {
        findParticipationHistory: vi.fn().mockResolvedValue([]),
        findExactTimeConflicts: vi.fn().mockResolvedValue([]),
      },
    );

    const result = await useCase.execute({
      churchId: "church-1",
      serviceId: "service-1",
      actorUserId: "user-1",
      status: "published",
      mode: "replace-existing",
      ministries: [{ ministryId: "ministry-1", assignments: [] }],
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe(
      "SCALE_GENERATION_INCOMPLETE_CONFIRMATION_REQUIRED",
    );
    expect(writer.save).not.toHaveBeenCalled();
  });
});
