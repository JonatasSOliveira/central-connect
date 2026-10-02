import { describe, expect, it } from "vitest";
import { formatCalendarPeriodLabel } from "./calendar-period-label";

describe("formatCalendarPeriodLabel", () => {
  it("formats a month without capitalizing the preposition", () => {
    expect(
      formatCalendarPeriodLabel(
        "dayGridMonth",
        new Date(2026, 9, 1),
        new Date(2026, 10, 1),
      ),
    ).toBe("Outubro de 2026");
  });

  it("formats a period between two months", () => {
    expect(
      formatCalendarPeriodLabel(
        "dayGridWeek",
        new Date(2026, 8, 27),
        new Date(2026, 9, 4),
      ),
    ).toBe("27 de setembro de 2026 a 3 de outubro de 2026");
  });
});
