import { z } from "zod";
import { MutiraoAvailability } from "@/domain/enums/MutiraoAvailability";
import { PracticalSkill } from "@/domain/enums/PracticalSkill";

export const SelfSignupProfessionalProfileSchema = z
  .object({
    currentProfession: z.string().min(1, "Profissão é obrigatória"),
    skills: z.array(z.enum(PracticalSkill)).default([]),
    hasDriverLicense: z.boolean().nullable().optional(),
    hasOwnVehicle: z.boolean().nullable().optional(),
    languages: z.string().optional().or(z.literal("")),
    otherSkill: z.string().optional().or(z.literal("")),
    mutiraoAvailability: z.enum(MutiraoAvailability),
  })
  .superRefine((data, ctx) => {
    if (data.skills.includes(PracticalSkill.Driving)) {
      if (typeof data.hasDriverLicense !== "boolean") {
        ctx.addIssue({
          code: "custom",
          message: "Informe se possui CNH",
          path: ["hasDriverLicense"],
        });
      }

      if (typeof data.hasOwnVehicle !== "boolean") {
        ctx.addIssue({
          code: "custom",
          message: "Informe se possui veículo próprio",
          path: ["hasOwnVehicle"],
        });
      }
    }

    if (
      data.skills.includes(PracticalSkill.TranslationLanguages) &&
      !data.languages?.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Informe quais idiomas",
        path: ["languages"],
      });
    }

    if (
      data.skills.includes(PracticalSkill.Other) &&
      !data.otherSkill?.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Informe a habilidade",
        path: ["otherSkill"],
      });
    }
  });

export type SelfSignupProfessionalProfileDTO = z.infer<
  typeof SelfSignupProfessionalProfileSchema
>;
