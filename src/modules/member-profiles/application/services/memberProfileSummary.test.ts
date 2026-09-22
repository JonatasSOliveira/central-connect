import { describe, expect, it } from "vitest";
import type { Ministry } from "@/modules/ministries/domain/entities/Ministry";
import { AcceptedJesusStatus } from "@/shared/domain/enums/AcceptedJesusStatus";
import { MaritalStatus } from "@/shared/domain/enums/MaritalStatus";
import { PracticalSkill } from "@/shared/domain/enums/PracticalSkill";
import type { MemberProfileRecord } from "./memberProfileModel";
import { buildMemberProfileSummary } from "./memberProfileSummary";

const ministries = [
  { id: "m1", name: "Louvor" },
  { id: "m2", name: "Midia" },
] as unknown as Ministry[];

function record(params: {
  skill: PracticalSkill;
  ministryId: string;
  acceptedJesus: AcceptedJesusStatus;
  maritalStatus: MaritalStatus;
}): MemberProfileRecord {
  return {
    personalInfo: { maritalStatus: params.maritalStatus },
    spiritualJourney: { acceptedJesus: params.acceptedJesus },
    professionalProfile: null,
    currentMinistries: [{ ministryId: params.ministryId }],
    desiredMinistries: [],
    serviceAvailabilities: [],
    practicalSkills: [{ skill: params.skill }],
  } as unknown as MemberProfileRecord;
}

describe("buildMemberProfileSummary", () => {
  it("counts filtered records by skills and ministries", () => {
    const records = [
      record({
        skill: PracticalSkill.IT,
        ministryId: "m1",
        acceptedJesus: AcceptedJesusStatus.Yes,
        maritalStatus: MaritalStatus.Married,
      }),
      record({
        skill: PracticalSkill.IT,
        ministryId: "m2",
        acceptedJesus: AcceptedJesusStatus.No,
        maritalStatus: MaritalStatus.Single,
      }),
    ];

    const summary = buildMemberProfileSummary(
      records,
      records.slice(0, 1),
      ministries,
    );

    expect(summary.totalMembersInChurch).toBe(2);
    expect(summary.totalWithProfile).toBe(2);
    expect(summary.totalFiltered).toBe(1);
    expect(summary.byPracticalSkill).toEqual([
      { value: PracticalSkill.IT, count: 1 },
    ]);
    expect(summary.byCurrentMinistry).toEqual([
      { ministryId: "m1", ministryName: "Louvor", count: 1 },
    ]);
  });
});
