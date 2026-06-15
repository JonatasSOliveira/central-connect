import { describe, expect, it } from "vitest";
import { PracticalSkill } from "@/domain/enums/PracticalSkill";
import { WaterBaptismStatus } from "@/domain/enums/WaterBaptismStatus";
import {
  buildMemberProfileQuery,
  toggleFilterValue,
} from "./memberProfileFilterParams";

describe("memberProfileFilterParams", () => {
  it("serializes repeated filter values", () => {
    const query = buildMemberProfileQuery({
      practicalSkills: [PracticalSkill.IT, PracticalSkill.Driving],
      waterBaptized: [WaterBaptismStatus.WantsBaptism],
      hasChildren: true,
    });

    const params = new URLSearchParams(query);

    expect(params.getAll("practicalSkills")).toEqual([
      PracticalSkill.IT,
      PracticalSkill.Driving,
    ]);
    expect(params.getAll("waterBaptized")).toEqual([
      WaterBaptismStatus.WantsBaptism,
    ]);
    expect(params.get("hasChildren")).toBe("true");
  });

  it("toggles array filter values", () => {
    expect(toggleFilterValue([PracticalSkill.IT], PracticalSkill.Driving)).toEqual([
      PracticalSkill.IT,
      PracticalSkill.Driving,
    ]);
    expect(toggleFilterValue([PracticalSkill.IT], PracticalSkill.IT)).toBeUndefined();
  });
});
