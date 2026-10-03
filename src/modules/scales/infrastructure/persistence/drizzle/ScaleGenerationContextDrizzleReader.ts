import { and, asc, eq, inArray, isNull } from "drizzle-orm";
import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
import {
  churches,
  ministries,
  ministryRoles,
  scaleMembers,
  scales,
  services,
} from "@/infra/database/drizzle/schema";
import type {
  IScaleGenerationContextReader,
  ScaleGenerationExistingAssignment,
  ScaleGenerationMinistryContext,
  ScaleGenerationServiceContext,
} from "@/modules/scales/application/ports/generation/IScaleGenerationContextReader";
import { DEFAULT_MAX_CONSECUTIVE_SCALES_PER_MEMBER } from "@/shared/constants/scaleRules";
import type { DayOfWeek } from "@/shared/domain/entities/DayOfWeek";

export class ScaleGenerationContextDrizzleReader
  implements IScaleGenerationContextReader
{
  constructor(private readonly database: DatabaseExecutor) {}

  async findService(
    churchId: string,
    serviceId: string,
  ): Promise<ScaleGenerationServiceContext | null> {
    const [row] = await this.database
      .select({
        service: services,
        maxConsecutive: churches.maxConsecutiveScalesPerMember,
      })
      .from(services)
      .innerJoin(churches, eq(churches.id, services.churchId))
      .where(
        and(
          eq(services.id, serviceId),
          eq(services.churchId, churchId),
          isNull(services.deletedAt),
          isNull(churches.deletedAt),
        ),
      )
      .limit(1);

    if (!row) return null;
    return {
      service: {
        id: row.service.id,
        churchId: row.service.churchId,
        date: row.service.date,
        time: row.service.time,
        dayOfWeek: row.service.dayOfWeek as DayOfWeek,
      },
      serviceTitle: row.service.title,
      maxConsecutiveScales:
        row.maxConsecutive ?? DEFAULT_MAX_CONSECUTIVE_SCALES_PER_MEMBER,
    };
  }

  async findMinistries(
    churchId: string,
    ministryIds: string[],
  ): Promise<ScaleGenerationMinistryContext[]> {
    if (ministryIds.length === 0) return [];
    const uniqueIds = [...new Set(ministryIds)];
    const rows = await this.database
      .select({ ministry: ministries, role: ministryRoles })
      .from(ministries)
      .leftJoin(
        ministryRoles,
        and(
          eq(ministryRoles.ministryId, ministries.id),
          isNull(ministryRoles.deletedAt),
        ),
      )
      .where(
        and(
          eq(ministries.churchId, churchId),
          inArray(ministries.id, uniqueIds),
          isNull(ministries.deletedAt),
        ),
      )
      .orderBy(asc(ministryRoles.displayOrder), asc(ministryRoles.name));

    const byMinistry = new Map<string, ScaleGenerationMinistryContext>();
    for (const row of rows) {
      const current = byMinistry.get(row.ministry.id) ?? {
        id: row.ministry.id,
        name: row.ministry.name,
        roles: [],
      };
      if (row.role) {
        current.roles.push({
          id: row.role.id,
          name: row.role.name,
          ministryId: row.role.ministryId,
          requiredCount: row.role.requiredCount,
          displayOrder: row.role.displayOrder,
        });
      }
      byMinistry.set(row.ministry.id, current);
    }
    return uniqueIds.flatMap((id) => {
      const ministry = byMinistry.get(id);
      return ministry ? [ministry] : [];
    });
  }

  async findExistingAssignments(
    serviceId: string,
    ministryIds: string[],
  ): Promise<ScaleGenerationExistingAssignment[]> {
    if (ministryIds.length === 0) return [];
    const rows = await this.database
      .select({
        memberId: scaleMembers.memberId,
        ministryId: scales.ministryId,
        roleId: scaleMembers.ministryRoleId,
      })
      .from(scaleMembers)
      .innerJoin(scales, eq(scales.id, scaleMembers.scaleId))
      .where(
        and(
          eq(scales.serviceId, serviceId),
          inArray(scales.ministryId, [...new Set(ministryIds)]),
          isNull(scales.deletedAt),
          isNull(scaleMembers.deletedAt),
        ),
      );
    return rows;
  }
}
