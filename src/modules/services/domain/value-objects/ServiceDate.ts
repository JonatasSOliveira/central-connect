const SERVICE_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseServiceDate(value: string): Date | null {
  const match = SERVICE_DATE_PATTERN.exec(value);
  if (!match) return null;

  const [, yearValue, monthValue, dayValue] = match;
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(12, 0, 0, 0);

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

export function isValidServiceDate(value: string): boolean {
  return parseServiceDate(value) !== null;
}

export function getServiceDayIndex(date: Date): number {
  return date.getUTCDay();
}
