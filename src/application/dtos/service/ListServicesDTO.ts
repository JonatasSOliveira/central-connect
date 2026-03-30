import { z } from "zod";

export const ListServicesQuerySchema = z.object({
  churchId: z.string(),
  startDate: z
    .string()
    .transform((val) => new Date(val))
    .optional(),
  endDate: z
    .string()
    .transform((val) => new Date(val))
    .optional(),
});

export type ListServicesQuery = z.infer<typeof ListServicesQuerySchema>;

export type ServiceListItem = {
  id: string;
  churchId: string;
  serviceTemplateId: string | null;
  title: string;
  date: Date;
  time: string;
  shift: string | null;
  location: string | null;
  description: string | null;
};

export type ListServicesOutput = {
  services: ServiceListItem[];
};
