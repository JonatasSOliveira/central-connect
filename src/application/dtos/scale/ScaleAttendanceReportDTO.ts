import { z } from "zod";
import { ScaleAttendanceStatusSchema } from "./ScaleAttendanceDTO";

export const ScaleAttendanceReportQuerySchema = z
  .object({
    churchId: z.string().min(1),
    startDate: z.string().transform((value) => new Date(value)),
    endDate: z.string().transform((value) => new Date(value)),
    ministryId: z.string().min(1).optional(),
  })
  .refine((data) => !Number.isNaN(data.startDate.getTime()), {
    message: "Data inicial inválida",
    path: ["startDate"],
  })
  .refine((data) => !Number.isNaN(data.endDate.getTime()), {
    message: "Data final inválida",
    path: ["endDate"],
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "Data final deve ser maior ou igual à data inicial",
    path: ["endDate"],
  });

export const ScaleAttendanceReportMinistryOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const ScaleAttendanceReportItemSchema = z.object({
  scaleId: z.string(),
  serviceTitle: z.string(),
  serviceDate: z.date(),
  serviceTime: z.string(),
  ministryId: z.string(),
  ministryName: z.string(),
  attendanceStatus: ScaleAttendanceStatusSchema,
  memberCount: z.number().int().nonnegative(),
  checkedCount: z.number().int().nonnegative(),
  pendingCount: z.number().int().nonnegative(),
  presentCount: z.number().int().nonnegative(),
  absentUnexcusedCount: z.number().int().nonnegative(),
  absentExcusedCount: z.number().int().nonnegative(),
});

export const ScaleAttendanceReportSummarySchema = z.object({
  scaleCount: z.number().int().nonnegative(),
  memberCount: z.number().int().nonnegative(),
  checkedCount: z.number().int().nonnegative(),
  pendingCount: z.number().int().nonnegative(),
  presentCount: z.number().int().nonnegative(),
  absentUnexcusedCount: z.number().int().nonnegative(),
  absentExcusedCount: z.number().int().nonnegative(),
  publishedCount: z.number().int().nonnegative(),
  draftCount: z.number().int().nonnegative(),
  completionRate: z.number().int().min(0).max(100),
});

export type ScaleAttendanceReportQueryDTO = z.infer<
  typeof ScaleAttendanceReportQuerySchema
>;
export type ScaleAttendanceReportMinistryOptionDTO = z.infer<
  typeof ScaleAttendanceReportMinistryOptionSchema
>;
export type ScaleAttendanceReportItemDTO = z.infer<
  typeof ScaleAttendanceReportItemSchema
>;
export type ScaleAttendanceReportSummaryDTO = z.infer<
  typeof ScaleAttendanceReportSummarySchema
>;
