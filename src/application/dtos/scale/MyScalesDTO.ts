import { z } from "zod";

export const MyScalesPeriodSchema = z.enum(["upcoming", "past"]);

export type MyScalesPeriod = z.infer<typeof MyScalesPeriodSchema>;

export const MyScaleListItemSchema = z.object({
  scaleId: z.string(),
  serviceId: z.string(),
  serviceTitle: z.string(),
  serviceDate: z.date(),
  serviceTime: z.string(),
  ministryId: z.string(),
  ministryName: z.string(),
  ministryRoleId: z.string(),
  ministryRoleName: z.string(),
  scaleNotes: z.string().nullable(),
  memberNotes: z.string().nullable(),
});

export type MyScaleListItemDTO = z.infer<typeof MyScaleListItemSchema>;

export const ListMyScalesQuerySchema = z.object({
  period: MyScalesPeriodSchema.default("upcoming"),
});

export type ListMyScalesQuery = z.infer<typeof ListMyScalesQuerySchema>;
