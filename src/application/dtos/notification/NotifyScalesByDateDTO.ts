import { z } from "zod";

export const NotifyScalesByDateSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida. Use o formato YYYY-MM-DD"),
});

export type NotifyScalesByDateInput = z.infer<typeof NotifyScalesByDateSchema>;
