import { describe, expect, it } from "vitest";
import { AcceptedJesusStatus } from "@/domain/enums/AcceptedJesusStatus";
import { MaritalStatus } from "@/domain/enums/MaritalStatus";
import { PracticalSkill } from "@/domain/enums/PracticalSkill";
import { matchesMemberProfileFilters } from "./memberProfileFilters";
import type { MemberProfileRecord } from "./memberProfileModel";

function makeRecord(): MemberProfileRecord {
  return {
    personalInfo: {
      maritalStatus: MaritalStatus.Married,
      hasChildren: true,
    },
    spiritualJourney: {
      acceptedJesus: AcceptedJesusStatus.Yes,
    },
    currentMinistries: [{ ministryId: "m1" }],
    desiredMinistries: [{ ministryId: "m2" }],
    serviceAvailabilities: [],
    practicalSkills: [
      {
        skill: PracticalSkill.IT,
        hasDriverLicense: null,
        hasOwnVehicle: null,
      },
      {
        skill: PracticalSkill.Driving,
        hasDriverLicense: true,
        hasOwnVehicle: false,
      },
    ],
  } as unknown as MemberProfileRecord;
}

describe("matchesMemberProfileFilters", () => {
  it("matches combined enum, relation, and boolean filters", () => {
    expect(
      matchesMemberProfileFilters(makeRecord(), {
        practicalSkills: [PracticalSkill.IT],
        acceptedJesus: [AcceptedJesusStatus.Yes],
        maritalStatus: [MaritalStatus.Married],
        currentMinistryIds: ["m1"],
        desiredMinistryIds: ["m2"],
        hasChildren: true,
        hasDriverLicense: true,
        hasOwnVehicle: false,
      }),
    ).toBe(true);
  });

  it("rejects records outside the selected filter", () => {
    expect(
      matchesMemberProfileFilters(makeRecord(), {
        practicalSkills: [PracticalSkill.Health],
      }),
    ).toBe(false);
  });
});
