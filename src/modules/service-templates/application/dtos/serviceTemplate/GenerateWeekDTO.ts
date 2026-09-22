import { z } from "zod";

export const GenerateWeekInputSchema = z.object({
  churchId: z.string(),
  weekStartDate: z.string().transform((val) => new Date(val)),
});

export type GenerateWeekInput = z.infer<typeof GenerateWeekInputSchema>;

export const GenerateWeekOutputSchema = z.object({
  createdCount: z.number(),
  skippedCount: z.number(),
  services: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      date: z.date(),
      time: z.string(),
    }),
  ),
});

export type GenerateWeekOutput = z.infer<typeof GenerateWeekOutputSchema>;
