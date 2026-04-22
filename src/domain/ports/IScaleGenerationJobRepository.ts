import type { ScaleGenerationJob } from "@/domain/entities/ScaleGenerationJob";
import type { BaseRepository } from "./BaseRepository";

export interface IScaleGenerationJobRepository
  extends BaseRepository<ScaleGenerationJob> {
  findByChurchId(churchId: string): Promise<ScaleGenerationJob[]>;
  findPendingDue(churchId: string, before: Date): Promise<ScaleGenerationJob[]>;
  findByServiceId(serviceId: string): Promise<ScaleGenerationJob | null>;
  acquireLease(jobId: string, ttlMinutes: number): Promise<boolean>;
  releaseLease(jobId: string): Promise<void>;
}