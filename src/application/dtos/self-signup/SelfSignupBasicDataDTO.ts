import { z } from "zod";
import { MaritalStatus } from "@/domain/enums/MaritalStatus";

export const SelfSignupBasicDataSchema = z
  .object({
    birthDate: z.coerce.date({
      message: "Data de nascimento é obrigatória",
    }),
    maritalStatus: z.enum(MaritalStatus, {
      message: "Estado civil é obrigatório",
    }),
    hasChildren: z.boolean(),
    childrenCount: z.number().int().min(1).nullable().optional(),
    childrenAges: z.string().optional().or(z.literal("")),
    neighborhood: z.string().min(1, "Bairro é obrigatório"),
  })
  .superRefine((data, ctx) => {
    if (data.hasChildren && !data.childrenCount) {
      ctx.addIssue({
        code: "custom",
        message: "Informe a quantidade de filhos",
        path: ["childrenCount"],
      });
    }
  });

export type SelfSignupBasicDataDTO = z.infer<typeof SelfSignupBasicDataSchema>;
