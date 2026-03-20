import { z } from "zod";

export const ChurchFormSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
});

export type ChurchFormData = z.infer<typeof ChurchFormSchema>;

export const churchFormDefaultValues: ChurchFormData = {
  name: "",
};
