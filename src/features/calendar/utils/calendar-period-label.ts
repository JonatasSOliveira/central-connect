const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function toUtcDate(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function formatCalendarDate(date: Date): string {
  return dateFormatter.format(toUtcDate(date));
}

export function formatCalendarPeriodLabel(
  viewType: string,
  start: Date,
  end: Date,
): string {
  const startDate = toUtcDate(start);

  if (viewType === "dayGridMonth") {
    return capitalize(monthFormatter.format(startDate));
  }

  const endDate = new Date(end);
  endDate.setUTCDate(endDate.getUTCDate() - 1);
  const formattedStart = formatCalendarDate(startDate);
  const formattedEnd = formatCalendarDate(endDate);

  if (viewType === "dayGridDay" || viewType === "listDay") {
    return capitalize(formattedStart);
  }

  return `${formattedStart} a ${formattedEnd}`;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
