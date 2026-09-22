import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { validateSession } from "@/app/api/_lib/auth";
import { createPushTokenHandlers } from "./push-token-handlers";

vi.mock("@/app/api/_lib/auth", () => ({
  validateSession: vi.fn(),
}));

const mockedValidateSession = vi.mocked(validateSession);

function request(method: "POST" | "DELETE", body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/push-tokens", {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function dependencies() {
  return {
    upsertMemberPushToken: {
      execute: vi.fn().mockResolvedValue({
        ok: true,
        value: { tokenId: "token-1" },
      }),
    },
    deactivateMemberPushToken: {
      execute: vi.fn().mockResolvedValue({
        ok: true,
        value: { success: true },
      }),
    },
  } as unknown as Parameters<typeof createPushTokenHandlers>[0];
}

describe("push token HTTP handlers", () => {
  beforeEach(() => {
    mockedValidateSession.mockResolvedValue({
      ok: true,
      user: {
        userId: "user-1",
        memberId: "member-1",
        churchId: "church-1",
      },
    } as never);
  });

  it("registers a valid token", async () => {
    const deps = dependencies();
    const handlers = createPushTokenHandlers(deps);

    const response = await handlers.register(
      request("POST", { token: "push-token", platform: "web" }),
    );

    expect(response.status).toBe(200);
    expect(deps.upsertMemberPushToken.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        churchId: "church-1",
        memberId: "member-1",
        token: "push-token",
      }),
    );
  });

  it("rejects an invalid token payload", async () => {
    const deps = dependencies();
    const handlers = createPushTokenHandlers(deps);

    const response = await handlers.register(request("POST", { token: "" }));

    expect(response.status).toBe(400);
    expect(deps.upsertMemberPushToken.execute).not.toHaveBeenCalled();
  });

  it("deactivates a token for the authenticated member", async () => {
    const deps = dependencies();
    const handlers = createPushTokenHandlers(deps);

    const response = await handlers.deactivate(
      request("DELETE", { token: "push-token" }),
    );

    expect(response.status).toBe(200);
    expect(deps.deactivateMemberPushToken.execute).toHaveBeenCalledWith({
      churchId: "church-1",
      memberId: "member-1",
      token: "push-token",
    });
  });
});
