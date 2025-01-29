export enum DayOfWeek {
  Sunday = 'sunday',
  Monday = 'monday',
  Tuesday = 'tuesday',
  Wednesday = 'wednesday',
  Thursday = 'thursday ',
  Friday = 'friday',
  Saturday = 'saturday',
}

export const DayOfWeekLabels: Record<DayOfWeek, string> = {
  [DayOfWeek.Sunday]: 'Domingo',
  [DayOfWeek.Monday]: 'Segunda-feira',
  [DayOfWeek.Tuesday]: 'Terça-feira',
  [DayOfWeek.Wednesday]: 'Quarta-feira',
  [DayOfWeek.Thursday]: 'Quinta-feira',
  [DayOfWeek.Friday]: 'Sexta-feira',
  [DayOfWeek.Saturday]: 'Sábado',
}
