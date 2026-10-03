import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getChurchIdFromSession, validateSession } from "@/shared/presentation/http/auth";
import { Permission } from "@/shared/domain/enums/Permission";
import { createScaleGenerationHandlers } from "./scale-generation-handlers";

vi.mock("@/shared/presentation/http/auth", () => ({
  getChurchIdFromSession: vi.fn(),
  validateSession: vi.fn(),
}));

const mockedGetChurchId = vi.mocked(getChurchIdFromSession);
const mockedValidateSession = vi.mocked(validateSession);

function request(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/scales/generate/preview", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

type PreviewDependencies = {
  scale: {
    generateScalePreview: {
      execute: ReturnType<typeof vi.fn>;
    };
    saveGeneratedScale: {
      execute: ReturnType<typeof vi.fn>;
    };
  };
};

function dependencies(): PreviewDependencies {
  return {
    scale: {
      generateScalePreview: {
        execute: vi.fn().mockResolvedValue({
          ok: true,
          value: { serviceId: "service-1", assignments: [] },
        }),
      },
      saveGeneratedScale: {
        execute: vi.fn().mockResolvedValue({
          ok: true,
          value: { scales: [] },
        }),
      },
    },
  };
}

describe("scale generation HTTP handlers", () => {
  beforeEach(() => {
    mockedValidateSession.mockResolvedValue({
      ok: true,
      user: {
        userId: "user-1",
        memberId: "member-1",
        churchId: "church-1",
        isSuperAdmin: false,
        permissions: [Permission.SCALE_WRITE],
      },
    } as never);
    mockedGetChurchId.mockReturnValue("church-1");
  });

  it("returns an unauthorized response without a valid session", async () => {
    mockedValidateSession.mockResolvedValue({
      ok: false,
      error: { code: "UNAUTHORIZED", message: "Não autenticado" },
    } as never);
    const deps = dependencies();
    const response = await createScaleGenerationHandlers(deps as never).preview(
      request({ serviceId: "service-1", ministryIds: ["ministry-1"] }),
    );

    expect(response.status).toBe(401);
    expect(deps.scale.generateScalePreview.execute).not.toHaveBeenCalled();
  });

  it("requires scale write permission", async () => {
    mockedValidateSession.mockResolvedValue({
      ok: true,
      user: {
        userId: "user-1",
        memberId: "member-1",
        churchId: "church-1",
        isSuperAdmin: false,
        permissions: [],
      },
    } as never);
    const deps = dependencies();
    const response = await createScaleGenerationHandlers(deps as never).preview(
      request({ serviceId: "service-1", ministryIds: ["ministry-1"] }),
    );

    expect(response.status).toBe(403);
    expect(deps.scale.generateScalePreview.execute).not.toHaveBeenCalled();
  });

  it("rejects an invalid preview payload", async () => {
    const deps = dependencies();
    const response = await createScaleGenerationHandlers(deps as never).preview(
      request({ serviceId: "not-a-uuid", ministryIds: [] }),
    );

    expect(response.status).toBe(400);
    expect(deps.scale.generateScalePreview.execute).not.toHaveBeenCalled();
  });

  it("uses the selected church and does not persist the preview", async () => {
    const deps = dependencies();
    const response = await createScaleGenerationHandlers(deps as never).preview(
      request({
        serviceId: "550e8400-e29b-41d4-a716-446655440000",
        ministryIds: ["650e8400-e29b-41d4-a716-446655440000"],
      }),
    );

    expect(response.status).toBe(200);
    expect(deps.scale.generateScalePreview.execute).toHaveBeenCalledWith({
      churchId: "church-1",
      serviceId: "550e8400-e29b-41d4-a716-446655440000",
      ministryIds: ["650e8400-e29b-41d4-a716-446655440000"],
      mode: "preserve-existing",
    });
  });

  it("saves a validated proposal using the authenticated church", async () => {
    const deps = dependencies();
    const response = await createScaleGenerationHandlers(deps as never).save(
      request({
        serviceId: "550e8400-e29b-41d4-a716-446655440000",
        ministries: [
          {
            ministryId: "650e8400-e29b-41d4-a716-446655440000",
            assignments: [],
          },
        ],
        status: "draft",
        mode: "replace-existing",
        confirmations: ["replace_existing"],
      }),
    );

    expect(response.status).toBe(200);
    expect(deps.scale.saveGeneratedScale.execute).toHaveBeenCalledWith({
      churchId: "church-1",
      actorUserId: "user-1",
      serviceId: "550e8400-e29b-41d4-a716-446655440000",
      ministries: [
        {
          ministryId: "650e8400-e29b-41d4-a716-446655440000",
          assignments: [],
        },
      ],
      status: "draft",
      mode: "replace-existing",
      confirmations: ["replace_existing"],
    });
  });
});
