import type { ScaleAttendanceMember } from "@/modules/scales/domain/entities/ScaleAttendanceMember";
import type { BaseRepository } from "@/shared/domain/ports/BaseRepository";

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
