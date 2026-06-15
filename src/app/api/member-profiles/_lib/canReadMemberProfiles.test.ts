import { describe, expect, it } from "vitest";
import { Permission } from "@/domain/enums/Permission";
import { canReadMemberProfiles } from "./canReadMemberProfiles";

describe("canReadMemberProfiles", () => {
  it("allows super admin to read any church", () => {
    expect(
      canReadMemberProfiles(
        { isSuperAdmin: true, churchId: null, permissions: [] },
        "church-1",
      ),
    ).toBe(true);
  });

  it("allows users with member profile read in the selected church", () => {
    expect(
      canReadMemberProfiles(
        {
          isSuperAdmin: false,
          churchId: "church-1",
          permissions: [Permission.MEMBER_PROFILE_READ],
        },
        "church-1",
      ),
    ).toBe(true);
  });

  it("does not allow member read without profile read", () => {
    expect(
      canReadMemberProfiles(
        {
          isSuperAdmin: false,
          churchId: "church-1",
          permissions: [Permission.MEMBER_READ],
        },
        "church-1",
      ),
    ).toBe(false);
  });
});
