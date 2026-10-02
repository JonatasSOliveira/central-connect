import { describe, expect, it } from "vitest";
import {
  getServiceDayIndex,
  isValidServiceDate,
  parseServiceDate,
} from "./ServiceDate";

describe("ServiceDate", () => {
  it("aceita datas reais e preserva o dia em UTC", () => {
    const date = parseServiceDate("2026-10-01");

    if (!date) throw new Error("A data deveria ser válida");

    expect(date.toISOString()).toBe("2026-10-01T12:00:00.000Z");
    expect(getServiceDayIndex(date)).toBe(4);
  });

  it("rejeita datas inexistentes", () => {
    expect(isValidServiceDate("2026-02-29")).toBe(false);
    expect(isValidServiceDate("2026-04-31")).toBe(false);
  });

  it("aceita 29 de fevereiro em ano bissexto", () => {
    expect(isValidServiceDate("2028-02-29")).toBe(true);
  });

  it("rejeita formatos que não são somente data", () => {
    expect(parseServiceDate("2026-10-01T19:00:00Z")).toBeNull();
    expect(parseServiceDate("01/10/2026")).toBeNull();
  });
});
