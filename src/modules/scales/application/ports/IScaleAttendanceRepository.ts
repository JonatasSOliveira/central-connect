import type { ScaleAttendance } from "@/modules/scales/domain/entities/ScaleAttendance";
import type { BaseRepository } from "@/shared/domain/ports/BaseRepository";

export interface IScaleAttendanceRepository
  extends BaseRepository<ScaleAttendance> {
  findByScaleId(scaleId: string): Promise<ScaleAttendance | null>;
  findByScaleIds(scaleIds: string[]): Promise<ScaleAttendance[]>;
}
