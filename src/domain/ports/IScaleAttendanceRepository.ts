import type { ScaleAttendance } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

export interface IScaleAttendanceRepository
  extends BaseRepository<ScaleAttendance> {
  findByScaleId(scaleId: string): Promise<ScaleAttendance | null>;
}
