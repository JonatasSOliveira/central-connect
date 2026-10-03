import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Permission } from "@/shared/domain/enums/Permission";
import {
  getChurchIdFromSession,
  validateSession,
} from "@/shared/presentation/http/auth";
import { createScalePublicationHandlers } from "./scale-publication-handlers";

vi.mock("@/shared/presentation/http/auth", () => ({
  getChurchIdFromSession: vi.fn(),
  validateSession: vi.fn(),
}));

const mockedGetChurchId = vi.mocked(getChurchIdFromSession);
const mockedValidateSession = vi.mocked(validateSession);
const serviceId = "550e8400-e29b-41d4-a716-446655440000";
const scaleId = "750e8400-e29b-41d4-a716-446655440000";

function request(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/scales/publish", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function dependencies() {
  return {
    scale: {
      publishGeneratedScales: {
        execute: vi.fn().mockResolvedValue({ ok: true, value: {} }),
      },
      unpublishGeneratedScales: {
        execute: vi.fn().mockResolvedValue({ ok: true, value: {} }),
      },
    },
  };
}

describe("scale publication HTTP handlers", () => {
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

  it("rejeita publicação sem permissão", async () => {
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
    const response = await createScalePublicationHandlers(
      deps as never,
    ).publish(request({ serviceId, scaleIds: [scaleId] }));

    expect(response.status).toBe(403);
    expect(deps.scale.publishGeneratedScales.execute).not.toHaveBeenCalled();
  });

  it("rejeita payload inválido antes do caso de uso", async () => {
    const deps = dependencies();
    const response = await createScalePublicationHandlers(
      deps as never,
    ).publish(request({ serviceId: "invalid", scaleIds: [] }));

    expect(response.status).toBe(400);
    expect(deps.scale.publishGeneratedScales.execute).not.toHaveBeenCalled();
  });

  it("repassa igreja e usuário autenticados ao publicar", async () => {
    const deps = dependencies();
    const response = await createScalePublicationHandlers(
      deps as never,
    ).publish(
      request({
        serviceId,
        scaleIds: [scaleId],
        confirmations: ["incomplete"],
      }),
    );

    expect(response.status).toBe(200);
    expect(deps.scale.publishGeneratedScales.execute).toHaveBeenCalledWith({
      churchId: "church-1",
      serviceId,
      scaleIds: [scaleId],
      confirmations: ["incomplete"],
      publishedByUserId: "user-1",
    });
  });

  it("repassa usuário autenticado ao despublicar", async () => {
    const deps = dependencies();
    const response = await createScalePublicationHandlers(
      deps as never,
    ).unpublish(request({ serviceId, scaleIds: [scaleId] }));

    expect(response.status).toBe(200);
    expect(deps.scale.unpublishGeneratedScales.execute).toHaveBeenCalledWith({
      churchId: "church-1",
      serviceId,
      scaleIds: [scaleId],
      unpublishedByUserId: "user-1",
    });
  });
});
