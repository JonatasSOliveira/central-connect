export type AttendanceTimelineFilter = "today" | "upcoming" | "overdue";

export type AttendanceStatus = "draft" | "published";

export type AttendanceMemberStatus =
  | "pending"
  | "present"
  | "absent_unexcused"
  | "absent_excused";

export interface ScaleAttendanceHomeItem {
  scaleId: string;
  churchId: string;
  serviceId: string;
  serviceTitle: string;
  serviceDate: string;
  serviceTime: string;
  ministryId: string;
  ministryName: string;
  attendanceStatus: AttendanceStatus;
  memberCount: number;
  checkedCount: number;
}

export interface ScaleAttendanceEntry {
  id: string | null;
  scaleMemberId: string;
  memberId: string;
  memberName: string;
  status: AttendanceMemberStatus;
  justification: string | null;
  checkedAt: string | null;
  checkedByUserId: string | null;
}

export interface ScaleAttendanceDetail {
  id: string | null;
  scaleId: string;
  churchId: string;
  status: AttendanceStatus;
  publishedAt: string | null;
  publishedByUserId: string | null;
  entries: ScaleAttendanceEntry[];
}
