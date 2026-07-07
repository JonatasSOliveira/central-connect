import { describe, expect, it } from "vitest";
import { Member } from "@/domain/entities/Member";
import { memberToPersistence } from "./memberMapper";

describe("memberMapper", () => {
  it("persists only core member fields", () => {
    const member = new Member({
      id: "member-1",
      email: "membro@example.com",
      fullName: "Membro Teste",
      phone: "(11) 99999-9999",
      birthDate: new Date("1990-01-01T00:00:00.000Z"),
      notes: "Observacao interna",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    });

    const data = memberToPersistence(member);

    expect(data).toEqual(
      expect.objectContaining({
        email: "membro@example.com",
        fullName: "Membro Teste",
        phoneNormalized: "11999999999",
        notes: "Observacao interna",
      }),
    );
    expect(data).not.toHaveProperty("spiritualJourney");
    expect(data).not.toHaveProperty("serviceProfile");
    expect(data).not.toHaveProperty("professionalProfile");
    expect(data).not.toHaveProperty("healthLimitations");
    expect(data).not.toHaveProperty("leadershipNotes");
  });
});
