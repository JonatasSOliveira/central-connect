import { describe, expect, it } from "vitest";
import { FinalizeSelfSignupInputSchema } from "./FinalizeSelfSignupDTO";

const basePayload = {
  googleToken: "token",
  fullName: "Joao da Silva",
  phone: "11999999999",
  acceptedTerms: true,
  ministryIds: ["m1"],
};

describe("FinalizeSelfSignupInputSchema", () => {
  it("accepts payload when terms are accepted", () => {
    const result = FinalizeSelfSignupInputSchema.safeParse(basePayload);
    expect(result.success).toBe(true);
  });

  it("rejects payload when terms are not accepted", () => {
    const result = FinalizeSelfSignupInputSchema.safeParse({
      ...basePayload,
      acceptedTerms: false,
    });

    expect(result.success).toBe(false);
  });

  it("accepts payload with ministryIds", () => {
    const result = FinalizeSelfSignupInputSchema.safeParse({
      ...basePayload,
      ministryIds: ["m1", "m2"],
    });

    expect(result.success).toBe(true);
  });

  it("rejects payload with empty ministryIds and no confirmation", () => {
    const result = FinalizeSelfSignupInputSchema.safeParse({
      ...basePayload,
      ministryIds: [],
      confirmNoMinistry: false,
    });

    expect(result.success).toBe(false);
  });

  it("accepts payload with empty ministryIds when confirmed", () => {
    const result = FinalizeSelfSignupInputSchema.safeParse({
      ...basePayload,
      ministryIds: [],
      confirmNoMinistry: true,
    });

    expect(result.success).toBe(true);
  });
});
