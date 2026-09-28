import { and, eq, gte, isNull, lte } from "drizzle-orm";
import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
import { services } from "@/infra/database/drizzle/schema";
import type { IServiceRepository } from "@/modules/services/application/ports/IServiceRepository";
import { Service } from "@/modules/services/domain/entities/Service";
import type { DayOfWeek } from "@/shared/domain/entities/DayOfWeek";

function toEntity(row: typeof services.$inferSelect): Service {
  return new Service({
    id: row.id,
    churchId: row.churchId,
    serviceTemplateId: row.serviceTemplateId,
    title: row.title,
    dayOfWeek: row.dayOfWeek as DayOfWeek,
    time: row.time,
    date: row.date,
    location: row.location,
    description: row.description,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  });
}

export class ServiceDrizzleRepository implements IServiceRepository {
  constructor(private readonly database: DatabaseExecutor) {}

  async findById(id: string): Promise<Service | null> {
    const [row] = await this.database
      .select()
      .from(services)
      .where(and(eq(services.id, id), isNull(services.deletedAt)))
      .limit(1);
    return row ? toEntity(row) : null;
  }

  async findAll(): Promise<Service[]> {
    const rows = await this.database
      .select()
      .from(services)
      .where(isNull(services.deletedAt));
    return rows.map(toEntity);
  }

  async findByChurchId(churchId: string): Promise<Service[]> {
    const rows = await this.database
      .select()
      .from(services)
      .where(and(eq(services.churchId, churchId), isNull(services.deletedAt)));
    return rows.map(toEntity);
  }

  async findByDateRange(
    churchId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Service[]> {
    const rows = await this.database
      .select()
      .from(services)
      .where(
        and(
          eq(services.churchId, churchId),
          gte(services.date, startDate),
          lte(services.date, endDate),
          isNull(services.deletedAt),
        ),
      );
    return rows.map(toEntity);
  }

  async findByDateAndLocation(
    churchId: string,
    date: Date,
    time: string,
    location: string | null,
  ): Promise<Service | null> {
    const [row] = await this.database
      .select()
      .from(services)
      .where(
        and(
          eq(services.churchId, churchId),
          eq(services.date, date),
          eq(services.time, time),
          location === null
            ? isNull(services.location)
            : eq(services.location, location),
          isNull(services.deletedAt),
        ),
      )
      .limit(1);
    return row ? toEntity(row) : null;
  }

  async create(entity: Service): Promise<Service> {
    const [row] = await this.database
      .insert(services)
      .values({
        id: entity.id,
        churchId: entity.churchId,
        serviceTemplateId: entity.serviceTemplateId,
        title: entity.title,
        dayOfWeek: entity.dayOfWeek,
        time: entity.time,
        date: entity.date,
        location: entity.location,
        description: entity.description,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        deletedAt: entity.deletedAt,
      })
      .returning();
    return toEntity(row);
  }

  async update(entity: Service): Promise<Service> {
    const [row] = await this.database
      .update(services)
      .set({
        serviceTemplateId: entity.serviceTemplateId,
        title: entity.title,
        dayOfWeek: entity.dayOfWeek,
        time: entity.time,
        date: entity.date,
        location: entity.location,
        description: entity.description,
        updatedAt: entity.updatedAt,
      })
      .where(and(eq(services.id, entity.id), isNull(services.deletedAt)))
      .returning();
    return toEntity(row);
  }

  async delete(id: string): Promise<void> {
    await this.database
      .update(services)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(services.id, id), isNull(services.deletedAt)));
  }
}
