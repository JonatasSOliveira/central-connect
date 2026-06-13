import { z } from "zod";
import { ServiceAvailabilitySlot } from "@/domain/enums/ServiceAvailabilitySlot";

export const SelfSignupServiceProfileSchema = z
  .object({
    currentlyServes: z.boolean(),
    currentMinistryIds: z.array(z.string()).default([]),
    desiredMinistryIds: z.array(z.string()).default([]),
    instrumentalPraiseInstrument: z.string().optional().or(z.literal("")),
    otherDesiredMinistry: z.string().optional().or(z.literal("")),
    availabilitySlots: z
      .array(z.enum(ServiceAvailabilitySlot))
      .min(1, "Informe ao menos um dia de disponibilidade"),
  })
  .superRefine((data, ctx) => {
    if (data.currentlyServes && data.currentMinistryIds.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Selecione ao menos um ministério em que serve hoje",
        path: ["currentMinistryIds"],
      });
    }
  });

export type SelfSignupServiceProfileDTO = z.infer<
  typeof SelfSignupServiceProfileSchema
>;
