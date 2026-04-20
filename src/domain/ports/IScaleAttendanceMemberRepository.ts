import type { ScaleAttendanceMember } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

export interface IScaleAttendanceMemberRepository
  extends BaseRepository<ScaleAttendanceMember> {
  findByScaleAttendanceId(
    scaleAttendanceId: string,
  ): Promise<ScaleAttendanceMember[]>;
  findByScaleMemberId(
    scaleMemberId: string,
  ): Promise<ScaleAttendanceMember | null>;
  findByScaleId(scaleId: string): Promise<ScaleAttendanceMember[]>;
  findByScaleIds(scaleIds: string[]): Promise<ScaleAttendanceMember[]>;
  deleteByScaleId(scaleId: string): Promise<void>;
}
