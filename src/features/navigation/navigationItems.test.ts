import { describe, expect, it } from "vitest";
import { Permission } from "@/domain/enums/Permission";
import { getNavigationItems } from "./navigationItems";

describe("getNavigationItems", () => {
  it("shows only member destinations when the user has no management permissions", () => {
    expect(getNavigationItems({}).map((item) => item.href)).toEqual([
      "/home",
      "/my-scales",
      "/more",
    ]);
  });

  it("shows management destinations only for the respective permissions", () => {
    expect(
      getNavigationItems({
        permissions: [Permission.SCALE_READ, Permission.SCALE_ATTENDANCE_READ],
      }).map((item) => item.href),
    ).toEqual(["/home", "/my-scales", "/scales", "/scale-attendances", "/more"]);
  });

  it("shows all navigation destinations to a super admin", () => {
    expect(getNavigationItems({ isSuperAdmin: true })).toHaveLength(5);
  });
});
