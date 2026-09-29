import { describe, expect, it } from "vitest";
import { getAuthenticatedRoute } from "./getAuthenticatedRoute";

describe("getAuthenticatedRoute", () => {
  it("sends unauthenticated users to login", () => {
    expect(
      getAuthenticatedRoute({
        isAuthenticated: false,
        isSuperAdmin: false,
        churchId: null,
      }),
    ).toBe("/login");
  });

  it("sends a superadmin without a church to home", () => {
    expect(
      getAuthenticatedRoute({
        isAuthenticated: true,
        isSuperAdmin: true,
        churchId: null,
      }),
    ).toBe("/home");
  });

  it("sends a user with a selected church to home", () => {
    expect(
      getAuthenticatedRoute({
        isAuthenticated: true,
        isSuperAdmin: false,
        churchId: "church-1",
      }),
    ).toBe("/home");
  });

  it("sends a user without a selected church to church selection", () => {
    expect(
      getAuthenticatedRoute({
        isAuthenticated: true,
        isSuperAdmin: false,
        churchId: null,
      }),
    ).toBe("/select-church");
  });
});
