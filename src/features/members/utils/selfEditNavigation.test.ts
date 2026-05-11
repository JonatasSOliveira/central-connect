import { describe, expect, it } from "vitest";
import { shouldNavigateBack } from "./selfEditNavigation";

describe("shouldNavigateBack", () => {
  it("returns true for self edit with browser history", () => {
    expect(shouldNavigateBack(true, 2)).toBe(true);
  });

  it("returns false for self edit without browser history", () => {
    expect(shouldNavigateBack(true, 1)).toBe(false);
  });

  it("returns false for non self edit", () => {
    expect(shouldNavigateBack(false, 10)).toBe(false);
  });
});
