import { and, eq, isNull, lte, or } from "drizzle-orm";
import type { DatabaseClient } from "@/infra/database/contracts/database-client";
import { scaleGenerationJobs } from "@/infra/database/drizzle/schema";
import type { IScaleGenerationJobRepository } from "@/modules/scales/application/ports/IScaleGenerationJobRepository";
import { ScaleGenerationJob } from "@/modules/scales/domain/entities/ScaleGenerationJob";

function toEntity(
  row: typeof scaleGenerationJobs.$inferSelect,
): ScaleGenerationJob {
  return new ScaleGenerationJob({
    id: row.id,
    churchId: row.churchId,
    serviceId: row.serviceId,
    status: row.status as "pending" | "running" | "completed" | "failed",
    scheduledFor: row.scheduledFor,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
    leaseExpiresAt: row.leaseExpiresAt,
    error: row.error,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  });
}

export class ScaleGenerationJobDrizzleRepository
  implements IScaleGenerationJobRepository
{
  constructor(private readonly database: DatabaseClient) {}
  async findById(id: string) {
    const [row] = await this.database
      .select()
      .from(scaleGenerationJobs)
      .where(
        and(
          eq(scaleGenerationJobs.id, id),
          isNull(scaleGenerationJobs.deletedAt),
        ),
      )
      .limit(1);
    return row ? toEntity(row) : null;
  }
  async findAll() {
    const rows = await this.database
      .select()
      .from(scaleGenerationJobs)
      .where(isNull(scaleGenerationJobs.deletedAt));
    return rows.map(toEntity);
  }
  async findByChurchId(churchId: string) {
    const rows = await this.database
      .select()
      .from(scaleGenerationJobs)
      .where(
        and(
          eq(scaleGenerationJobs.churchId, churchId),
          isNull(scaleGenerationJobs.deletedAt),
        ),
      );
    return rows.map(toEntity);
  }
  async findPendingDue(churchId: string, before: Date) {
    const rows = await this.database
      .select()
      .from(scaleGenerationJobs)
      .where(
        and(
          eq(scaleGenerationJobs.churchId, churchId),
          eq(scaleGenerationJobs.status, "pending"),
          lte(scaleGenerationJobs.scheduledFor, before),
          isNull(scaleGenerationJobs.deletedAt),
        ),
      );
    return rows.map(toEntity);
  }
  async findByServiceId(serviceId: string) {
    const [row] = await this.database
      .select()
      .from(scaleGenerationJobs)
      .where(
        and(
          eq(scaleGenerationJobs.serviceId, serviceId),
          isNull(scaleGenerationJobs.deletedAt),
        ),
      )
      .limit(1);
    return row ? toEntity(row) : null;
  }
  async create(entity: ScaleGenerationJob) {
    const [row] = await this.database
      .insert(scaleGenerationJobs)
      .values({
        id: entity.id,
        churchId: entity.churchId,
        serviceId: entity.serviceId,
        status: entity.status,
        scheduledFor: entity.scheduledFor,
        startedAt: entity.startedAt,
        completedAt: entity.completedAt,
        leaseExpiresAt: entity.leaseExpiresAt,
        error: entity.error,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        deletedAt: entity.deletedAt,
      })
      .returning();
    return toEntity(row);
  }
  async update(entity: ScaleGenerationJob) {
    const [row] = await this.database
      .update(scaleGenerationJobs)
      .set({
        status: entity.status,
        scheduledFor: entity.scheduledFor,
        startedAt: entity.startedAt,
        completedAt: entity.completedAt,
        leaseExpiresAt: entity.leaseExpiresAt,
        error: entity.error,
        updatedAt: entity.updatedAt,
      })
      .where(
        and(
          eq(scaleGenerationJobs.id, entity.id),
          isNull(scaleGenerationJobs.deletedAt),
        ),
      )
      .returning();
    return toEntity(row);
  }
  async delete(id: string) {
    await this.database
      .update(scaleGenerationJobs)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(scaleGenerationJobs.id, id),
          isNull(scaleGenerationJobs.deletedAt),
        ),
      );
  }
  async acquireLease(jobId: string, ttlMinutes = 5): Promise<boolean> {
    const leaseExpiresAt = new Date(Date.now() + ttlMinutes * 60_000);
    const now = new Date();
    const result = await this.database
      .update(scaleGenerationJobs)
      .set({
        status: "running",
        startedAt: now,
        leaseExpiresAt,
        updatedAt: now,
      })
      .where(
        and(
          eq(scaleGenerationJobs.id, jobId),
          eq(scaleGenerationJobs.status, "pending"),
          or(
            isNull(scaleGenerationJobs.leaseExpiresAt),
            lte(scaleGenerationJobs.leaseExpiresAt, now),
          ),
          isNull(scaleGenerationJobs.deletedAt),
        ),
      )
      .returning({ id: scaleGenerationJobs.id });
    return result.length > 0;
  }
  async releaseLease(jobId: string) {
    await this.database
      .update(scaleGenerationJobs)
      .set({ leaseExpiresAt: null, updatedAt: new Date() })
      .where(
        and(
          eq(scaleGenerationJobs.id, jobId),
          isNull(scaleGenerationJobs.deletedAt),
        ),
      );
  }
}
