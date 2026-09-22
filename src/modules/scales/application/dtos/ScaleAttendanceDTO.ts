import { z } from "zod";

export const ScaleAttendanceStatusSchema = z.enum(["draft", "published"]);

export const ScaleAttendanceMemberStatusSchema = z.enum([
  "present",
  "absent_unexcused",
  "absent_excused",
]);

export const SaveScaleAttendanceEntrySchema = z
  .object({
    scaleMemberId: z.string().min(1, "Membro da escala é obrigatório"),
    status: ScaleAttendanceMemberStatusSchema,
    justification: z.string().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    const justification = data.justification?.trim() ?? "";
    if (data.status === "absent_excused" && !justification) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["justification"],
        message: "Justificativa é obrigatória para falta justificada",
      });
    }
  });

export const SaveScaleAttendanceSchema = z.object({
  entries: z.array(SaveScaleAttendanceEntrySchema).default([]),
});

export const ScaleAttendanceEntrySchema = z.object({
  id: z.string().nullable(),
  scaleMemberId: z.string(),
  memberId: z.string(),
  memberName: z.string(),
  status: z
    .enum(["pending", "present", "absent_unexcused", "absent_excused"])
    .default("pending"),
  justification: z.string().nullable(),
  checkedAt: z.date().nullable(),
  checkedByUserId: z.string().nullable(),
});

export const ScaleAttendanceDetailSchema = z.object({
  id: z.string().nullable(),
  scaleId: z.string(),
  churchId: z.string(),
  serviceDate: z.date(),
  status: ScaleAttendanceStatusSchema,
  publishedAt: z.date().nullable(),
  publishedByUserId: z.string().nullable(),
  entries: z.array(ScaleAttendanceEntrySchema),
});

export type SaveScaleAttendanceInput = z.input<
  typeof SaveScaleAttendanceSchema
>;
export type SaveScaleAttendanceEntryInput = z.input<
  typeof SaveScaleAttendanceEntrySchema
>;
export type ScaleAttendanceDetailDTO = z.infer<
  typeof ScaleAttendanceDetailSchema
>;
