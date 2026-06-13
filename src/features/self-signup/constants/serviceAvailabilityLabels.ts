import { ServiceAvailabilitySlot } from "@/domain/enums/ServiceAvailabilitySlot";

export const serviceAvailabilityLabels: Record<
  ServiceAvailabilitySlot,
  string
> = {
  [ServiceAvailabilitySlot.SundayMorning]: "Domingo manhã",
  [ServiceAvailabilitySlot.SundayNight]: "Domingo noite",
  [ServiceAvailabilitySlot.Tuesday]: "Terça",
  [ServiceAvailabilitySlot.Wednesday]: "Quarta",
  [ServiceAvailabilitySlot.Thursday]: "Quinta",
  [ServiceAvailabilitySlot.Friday]: "Sexta",
  [ServiceAvailabilitySlot.Saturday]: "Sábado",
};
