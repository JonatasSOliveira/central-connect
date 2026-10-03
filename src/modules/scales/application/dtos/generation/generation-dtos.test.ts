import { describe, expect, it } from "vitest";
import { GenerateScalePreviewSchema } from "./GenerateScalePreviewDTO";
import {
  PublishGeneratedScalesSchema,
  UnpublishGeneratedScalesSchema,
} from "./PublishGeneratedScalesDTO";
import { SaveGeneratedScaleSchema } from "./SaveGeneratedScaleDTO";

const serviceId = "550e8400-e29b-41d4-a716-446655440000";
const ministryId = "650e8400-e29b-41d4-a716-446655440000";
const scaleId = "750e8400-e29b-41d4-a716-446655440000";

describe("generation DTO schemas", () => {
  it("aplica preserve-existing como modo padrão da prévia", () => {
    const result = GenerateScalePreviewSchema.parse({
      serviceId,
      ministryIds: [ministryId],
    });

    expect(result.mode).toBe("preserve-existing");
  });

  it("rejeita payload de prévia sem ministérios", () => {
    expect(
      GenerateScalePreviewSchema.safeParse({ serviceId, ministryIds: [] })
        .success,
    ).toBe(false);
  });

  it("aceita confirmação de substituição somente ao salvar", () => {
    const save = SaveGeneratedScaleSchema.safeParse({
      serviceId,
      ministries: [{ ministryId, assignments: [] }],
      status: "draft",
      mode: "replace-existing",
      confirmations: ["replace_existing"],
    });
    const publish = PublishGeneratedScalesSchema.safeParse({
      serviceId,
      scaleIds: [scaleId],
      confirmations: ["replace_existing"],
    });

    expect(save.success).toBe(true);
    expect(publish.success).toBe(false);
  });

  it("exige identificadores válidos para publicação e despublicação", () => {
    expect(
      PublishGeneratedScalesSchema.safeParse({ serviceId, scaleIds: [scaleId] })
        .success,
    ).toBe(true);
    expect(
      UnpublishGeneratedScalesSchema.safeParse({ serviceId, scaleIds: [] })
        .success,
    ).toBe(false);
  });
});
