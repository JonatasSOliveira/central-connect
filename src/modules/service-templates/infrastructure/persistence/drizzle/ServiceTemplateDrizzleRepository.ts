import { and, eq, isNull } from "drizzle-orm";
import type { DatabaseClient } from "@/infra/database/contracts/database-client";
import { serviceTemplates } from "@/infra/database/drizzle/schema";
import type { IServiceTemplateRepository } from "@/modules/service-templates/application/ports/IServiceTemplateRepository";
import { ServiceTemplate } from "@/modules/service-templates/domain/entities/ServiceTemplate";
import type { DayOfWeek } from "@/shared/domain/entities/DayOfWeek";

function toEntity(row: typeof serviceTemplates.$inferSelect): ServiceTemplate {
  return new ServiceTemplate({
    id: row.id,
    churchId: row.churchId,
    title: row.title,
    dayOfWeek: row.dayOfWeek as DayOfWeek,
    time: row.time,
    location: row.location,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  });
}

export class ServiceTemplateDrizzleRepository
  implements IServiceTemplateRepository
{
  constructor(private readonly database: DatabaseClient) {}

  async findById(id: string): Promise<ServiceTemplate | null> {
    const [row] = await this.database
      .select()
      .from(serviceTemplates)
      .where(
        and(eq(serviceTemplates.id, id), isNull(serviceTemplates.deletedAt)),
      )
      .limit(1);
    return row ? toEntity(row) : null;
  }

  async findAll(): Promise<ServiceTemplate[]> {
    const rows = await this.database
      .select()
      .from(serviceTemplates)
      .where(isNull(serviceTemplates.deletedAt));
    return rows.map(toEntity);
  }

  async findByChurchId(churchId: string): Promise<ServiceTemplate[]> {
    const rows = await this.database
      .select()
      .from(serviceTemplates)
      .where(
        and(
          eq(serviceTemplates.churchId, churchId),
          isNull(serviceTemplates.deletedAt),
        ),
      );
    return rows.map(toEntity);
  }

  async findActiveByChurchId(churchId: string): Promise<ServiceTemplate[]> {
    const rows = await this.database
      .select()
      .from(serviceTemplates)
      .where(
        and(
          eq(serviceTemplates.churchId, churchId),
          eq(serviceTemplates.isActive, true),
          isNull(serviceTemplates.deletedAt),
        ),
      );
    return rows.map(toEntity);
  }

  async create(entity: ServiceTemplate): Promise<ServiceTemplate> {
    const [row] = await this.database
      .insert(serviceTemplates)
      .values({
        id: entity.id,
        churchId: entity.churchId,
        title: entity.title,
        dayOfWeek: entity.dayOfWeek,
        time: entity.time,
        location: entity.location,
        isActive: entity.isActive,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        deletedAt: entity.deletedAt,
      })
      .returning();
    return toEntity(row);
  }

  async update(entity: ServiceTemplate): Promise<ServiceTemplate> {
    const [row] = await this.database
      .update(serviceTemplates)
      .set({
        title: entity.title,
        dayOfWeek: entity.dayOfWeek,
        time: entity.time,
        location: entity.location,
        isActive: entity.isActive,
        updatedAt: entity.updatedAt,
      })
      .where(
        and(eq(serviceTemplates.id, entity.id), isNull(serviceTemplates.deletedAt)),
      )
      .returning();
    return toEntity(row);
  }

  async delete(id: string): Promise<void> {
    await this.database
      .update(serviceTemplates)
      .set({ isActive: false, deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(serviceTemplates.id, id), isNull(serviceTemplates.deletedAt)));
  }
}
