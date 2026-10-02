import { z } from "zod";
import { serviceDateSchema } from "./service-date-schema";

export const ListServicesQuerySchema = z.object({
  churchId: z.string(),
  startDate: serviceDateSchema.optional(),
  endDate: serviceDateSchema.optional(),
}).superRefine((value, context) => {
  if (Boolean(value.startDate) !== Boolean(value.endDate)) {
    context.addIssue({
      code: "custom",
      message: "Informe a data inicial e a data final",
      path: [value.startDate ? "endDate" : "startDate"],
    });
  }

  if (value.startDate && value.endDate && value.startDate > value.endDate) {
    context.addIssue({
      code: "custom",
      message: "A data inicial deve ser anterior ou igual à data final",
      path: ["endDate"],
    });
  }
});

export type ListServicesQuery = z.infer<typeof ListServicesQuerySchema>;

export type ServiceListItem = {
  id: string;
  churchId: string;
  serviceTemplateId: string | null;
  title: string;
  date: Date;
  time: string;
  location: string | null;
  description: string | null;
  createdAt: Date;
};

export type ListServicesOutput = {
  services: ServiceListItem[];
};
