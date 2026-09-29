import { describe, expect, it } from "vitest";
import { getAuthenticatedRoute } from "./getAuthenticatedRoute";

describe("getAuthenticatedRoute", () => {
  it("sends unauthenticated users to login", () => {
    expect(
      getAuthenticatedRoute({
        isAuthenticated: false,
        isSuperAdmin: false,
        churchId: null,
        hasChurches: false,
      }),
    ).toBe("/login");
  });

  it("sends a superadmin without churches to home", () => {
    expect(
      getAuthenticatedRoute({
        isAuthenticated: true,
        isSuperAdmin: true,
        churchId: null,
        hasChurches: false,
      }),
    ).toBe("/home");
  });

  it("sends a superadmin with churches and no selection to church selection", () => {
    expect(
      getAuthenticatedRoute({
        isAuthenticated: true,
        isSuperAdmin: true,
        churchId: null,
        hasChurches: true,
      }),
    ).toBe("/select-church");
  });

  it("sends a user with a selected church to home", () => {
    expect(
      getAuthenticatedRoute({
        isAuthenticated: true,
        isSuperAdmin: false,
        churchId: "church-1",
        hasChurches: true,
      }),
    ).toBe("/home");
  });

  it("sends a user without a selected church to church selection", () => {
    expect(
      getAuthenticatedRoute({
        isAuthenticated: true,
        isSuperAdmin: false,
        churchId: null,
        hasChurches: true,
      }),
    ).toBe("/select-church");
  });
});
