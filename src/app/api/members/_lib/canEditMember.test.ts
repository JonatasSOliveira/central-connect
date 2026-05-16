import { describe, expect, it } from "vitest";
import { Permission } from "@/domain/enums/Permission";
import { canEditMember } from "./canEditMember";

describe("canEditMember", () => {
  it("allows editing when user is super admin", () => {
    const result = canEditMember(
      {
        isSuperAdmin: true,
        permissions: [],
        memberId: "member-1",
      },
      "member-2",
    );

    expect(result).toBe(true);
  });

  it("allows editing own profile with MEMBER_SELF_WRITE", () => {
    const result = canEditMember(
      {
        isSuperAdmin: false,
        permissions: [Permission.MEMBER_SELF_WRITE],
        memberId: "member-1",
      },
      "member-1",
    );

    expect(result).toBe(true);
  });

  it("blocks editing another profile with only MEMBER_SELF_WRITE", () => {
    const result = canEditMember(
      {
        isSuperAdmin: false,
        permissions: [Permission.MEMBER_SELF_WRITE],
        memberId: "member-1",
      },
      "member-2",
    );

    expect(result).toBe(false);
  });
});
