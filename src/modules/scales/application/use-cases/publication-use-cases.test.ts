import { describe, expect, it, vi } from "vitest";
import { Scale } from "../../domain/entities/Scale";
import type { IScaleGenerationContextReader } from "../ports/generation/IScaleGenerationContextReader";
import type { IScaleMemberRepository } from "../ports/IScaleMemberRepository";
import type { IScaleRepository } from "../ports/IScaleRepository";
import { PublishGeneratedScales } from "./PublishGeneratedScales";
import { UnpublishGeneratedScales } from "./UnpublishGeneratedScales";

const scale = new Scale({
  id: "scale-1",
  serviceId: "service-1",
  ministryId: "ministry-1",
  status: "draft",
  createdAt: new Date(),
  updatedAt: new Date(),
});

function contextReader(): IScaleGenerationContextReader {
  return {
    findService: vi.fn().mockResolvedValue({
      service: {
        id: "service-1",
        churchId: "church-1",
        date: new Date("2026-10-04T00:00:00.000Z"),
        time: "19:00",
        dayOfWeek: "Sunday",
      },
      serviceTitle: "Culto de Celebração",
      maxConsecutiveScales: 2,
    }),
    findMinistries: vi.fn(),
    findExistingAssignments: vi.fn(),
  };
}

describe("scale publication use cases", () => {
  it("converts the selected scales into a published proposal", async () => {
    const saveGeneratedScale = { execute: vi.fn().mockResolvedValue({ ok: true, value: {} }) };
    const scaleRepository = {
      findById: vi.fn().mockResolvedValue(scale),
    } as unknown as IScaleRepository;
    const memberRepository = {
      findByScaleId: vi.fn().mockResolvedValue([
        { memberId: "member-1", ministryRoleId: "role-1" },
      ]),
    } as unknown as IScaleMemberRepository;
    const useCase = new PublishGeneratedScales(
      scaleRepository,
      memberRepository,
      contextReader(),
      saveGeneratedScale,
    );

    const result = await useCase.execute({
      churchId: "church-1",
      serviceId: "service-1",
      scaleIds: ["scale-1"],
      publishedByUserId: "user-1",
      confirmations: ["incomplete"],
    });

    expect(result.ok).toBe(true);
    expect(saveGeneratedScale.execute).toHaveBeenCalledWith({
      churchId: "church-1",
      serviceId: "service-1",
      ministries: [
        {
          ministryId: "ministry-1",
          assignments: [{ memberId: "member-1", ministryRoleId: "role-1" }],
        },
      ],
      status: "published",
      mode: "preserve-existing",
      actorUserId: "user-1",
      confirmations: ["incomplete"],
    });
  });

  it("returns selected scales to draft without deleting members", async () => {
    const scaleRepository = {
      findById: vi.fn().mockResolvedValue(scale),
      update: vi.fn().mockResolvedValue({ ...scale, status: "draft" }),
    } as unknown as IScaleRepository;
    const useCase = new UnpublishGeneratedScales(
      scaleRepository,
      contextReader(),
    );

    const result = await useCase.execute({
      churchId: "church-1",
      serviceId: "service-1",
      scaleIds: ["scale-1"],
      unpublishedByUserId: "user-1",
    });

    expect(result).toEqual({ ok: true, value: { scaleIds: ["scale-1"] } });
    expect(scaleRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "draft",
        publishedAt: null,
        publishedByUserId: null,
      }),
    );
  });
});
