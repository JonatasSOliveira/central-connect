import { z } from "zod";
import { ScaleAttendanceStatusSchema } from "./ScaleAttendanceDTO";

export const AttendanceTimelineFilterSchema = z.enum([
  "today",
  "upcoming",
  "overdue",
]);

export const ListScaleAttendancesQuerySchema = z.object({
  churchId: z.string().min(1),
  filter: AttendanceTimelineFilterSchema.default("today"),
});

export const ScaleAttendanceListItemSchema = z.object({
  scaleId: z.string(),
  churchId: z.string(),
  serviceId: z.string(),
  serviceTitle: z.string(),
  serviceDate: z.date(),
  serviceTime: z.string(),
  ministryId: z.string(),
  ministryName: z.string(),
  attendanceStatus: ScaleAttendanceStatusSchema,
  memberCount: z.number().int().nonnegative(),
  checkedCount: z.number().int().nonnegative(),
});

export type AttendanceTimelineFilter = z.infer<
  typeof AttendanceTimelineFilterSchema
>;
export type ScaleAttendanceListItemDTO = z.infer<
  typeof ScaleAttendanceListItemSchema
>;
