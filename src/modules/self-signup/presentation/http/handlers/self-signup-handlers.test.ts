import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
import { createSelfSignupHandlers } from "./self-signup-handlers";

function createRequest(path: string, body?: unknown): NextRequest {
  return new NextRequest(`http://localhost${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": `192.0.2.${Math.floor(Math.random() * 200) + 1}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function createUseCases() {
  return {
    getSelfSignupChurchContext: {
      execute: vi
        .fn()
        .mockResolvedValue({ ok: true, value: { canProceed: true } }),
    },
    lookupMemberByPhone: {
      execute: vi.fn().mockResolvedValue({
        ok: true,
        value: { memberExists: false, prefill: null },
      }),
    },
    finalizeSelfSignup: {
      execute: vi.fn().mockResolvedValue({
        ok: true,
        value: { memberId: "member-1", userId: "user-1", churchId: "church-1" },
      }),
    },
  } as unknown as Parameters<typeof createSelfSignupHandlers>[0];
}

describe("self-signup HTTP handlers", () => {
  it("delegates the public context request", async () => {
    const useCases = createUseCases();
    const handlers = createSelfSignupHandlers(useCases);

    const response = await handlers.context(
      createRequest("/api/self-signup-context"),
      "church-1",
    );

    expect(response.status).toBe(200);
    expect(useCases.getSelfSignupChurchContext.execute).toHaveBeenCalledWith({
      churchId: "church-1",
    });
  });

  it("rejects lookup requests with an invalid payload", async () => {
    const useCases = createUseCases();
    const handlers = createSelfSignupHandlers(useCases);

    const response = await handlers.lookup(
      createRequest("/api/member-lookups", { phone: "123" }),
      "church-2",
    );

    expect(response.status).toBe(400);
    expect(useCases.lookupMemberByPhone.execute).not.toHaveBeenCalled();
  });

  it("finalizes a valid self-signup request", async () => {
    const useCases = createUseCases();
    const handlers = createSelfSignupHandlers(useCases);
    const response = await handlers.finalize(
      createRequest("/api/self-signups", {
        googleToken: "token",
        fullName: "Maria",
        phone: "5511999999999",
        acceptedTerms: true,
        ministryIds: ["ministry-1"],
        confirmNoMinistry: false,
        memberForm: {
          basicData: {
            birthDate: "1990-01-01",
            maritalStatus: "Single",
            hasChildren: false,
            neighborhood: "Centro",
          },
          spiritualJourney: {
            acceptedJesus: "Yes",
            waterBaptized: "No",
            discipleshipStatus: "NotYet",
            churchAttendanceTime: "LessThan6Months",
            smallGroupStatus: "Interested",
            officialMemberStatus: "No",
          },
          serviceProfile: {
            currentlyServes: false,
            currentMinistryIds: [],
            desiredMinistryIds: [],
            availabilitySlots: ["SundayMorning"],
          },
          professionalProfile: {
            currentProfession: "Professor",
            skills: [],
            mutiraoAvailability: "WheneverPossible",
          },
          finalNotes: {},
        },
      }),
      "church-3",
    );

    expect(response.status).toBe(201);
    expect(useCases.finalizeSelfSignup.execute).toHaveBeenCalled();
  });
});
