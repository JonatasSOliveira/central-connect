import { describe, expect, it } from "vitest";
import { FinalizeSelfSignupInputSchema } from "./FinalizeSelfSignupDTO";

const validPayload = {
  googleToken: "token",
  fullName: "Joao da Silva",
  phone: "11999999999",
  acceptedTerms: true,
};

describe("FinalizeSelfSignupInputSchema", () => {
  it("accepts payload when terms are accepted", () => {
    const result = FinalizeSelfSignupInputSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rejects payload when terms are not accepted", () => {
    const result = FinalizeSelfSignupInputSchema.safeParse({
      ...validPayload,
      acceptedTerms: false,
    });

    expect(result.success).toBe(false);
  });
});
