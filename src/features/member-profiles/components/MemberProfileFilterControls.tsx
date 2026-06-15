export type FilterOption<T extends string> = {
  value: T;
  label: string;
};

export function enumOptions<T extends Record<string, string>>(
  enumValue: T,
  labels: Record<T[keyof T], string>,
): FilterOption<T[keyof T]>[] {
  return Object.values(enumValue).map((value) => ({
    value: value as T[keyof T],
    label: labels[value as T[keyof T]],
  }));
}
