import { describe, expect, it } from "vitest";
import { MemberAvailability } from "./MemberAvailability";

const baseParams = {
  memberId: "member-1",
  daysOfWeek: ["Sunday" as const],
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

describe("MemberAvailability", () => {
  it("accepts an empty list as a valid rule", () => {
    const availability = new MemberAvailability({
      ...baseParams,
      daysOfWeek: [],
    });

    expect(availability.daysOfWeek).toEqual([]);
  });

  it("rejects duplicated days", () => {
    expect(
      () =>
        new MemberAvailability({
          ...baseParams,
          daysOfWeek: ["Sunday", "Sunday"],
        }),
    ).toThrow("duplicate days");
  });

  it("does not expose a mutable internal days list", () => {
    const availability = new MemberAvailability(baseParams);
    const days = availability.daysOfWeek;

    days.push("Monday");

    expect(availability.daysOfWeek).toEqual(["Sunday"]);
  });
});
