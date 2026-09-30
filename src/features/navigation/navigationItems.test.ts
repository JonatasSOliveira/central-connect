import { describe, expect, it } from "vitest";
import { Permission } from "@/shared/domain/enums/Permission";
import { getNavigationItems } from "./navigationItems";

describe("getNavigationItems", () => {
  it("shows only the home destination without an authorized scope", () => {
    expect(getNavigationItems({}).map((item) => item.href)).toEqual(["/home"]);
  });

  it("shows churches and members for the current product scope", () => {
    expect(
      getNavigationItems({
        permissions: [Permission.CHURCH_READ, Permission.MEMBER_READ],
        churchId: "church-1",
      }).map((item) => item.href),
    ).toEqual(["/home", "/churches", "/members"]);
  });

  it("does not show members until a church is selected", () => {
    expect(
      getNavigationItems({
        isSuperAdmin: true,
        churchId: null,
      }).map((item) => item.href),
    ).toEqual(["/home", "/churches"]);
  });
});
