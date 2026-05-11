import { describe, expect, it } from "vitest";
import { canSelectChurch } from "./canSelectChurch";

describe("canSelectChurch", () => {
  it("allows super admin to select any church", () => {
    const allowed = canSelectChurch(
      {
        isSuperAdmin: true,
        churches: [],
      },
      "church-any",
    );

    expect(allowed).toBe(true);
  });

  it("allows selecting a linked church", () => {
    const allowed = canSelectChurch(
      {
        isSuperAdmin: false,
        churches: [{ churchId: "church-1" }],
      },
      "church-1",
    );

    expect(allowed).toBe(true);
  });

  it("blocks selecting an unrelated church", () => {
    const allowed = canSelectChurch(
      {
        isSuperAdmin: false,
        churches: [{ churchId: "church-1" }],
      },
      "church-2",
    );

    expect(allowed).toBe(false);
  });
});
