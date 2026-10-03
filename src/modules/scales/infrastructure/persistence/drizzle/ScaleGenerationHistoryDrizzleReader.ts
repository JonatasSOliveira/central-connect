import { and, asc, eq, inArray, isNull, lt, ne } from "drizzle-orm";
import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
import { scaleMembers, scales, services } from "@/infra/database/drizzle/schema";
import type {
  IScaleGenerationHistoryReader,
  ScaleMemberParticipationHistory,
} from "@/modules/scales/application/ports/generation/IScaleGenerationHistoryReader";
import type { DayOfWeek } from "@/shared/domain/entities/DayOfWeek";

export class ScaleGenerationHistoryDrizzleReader
  implements IScaleGenerationHistoryReader
{
  constructor(private readonly database: DatabaseExecutor) {}

  async findParticipationHistory(
    churchId: string,
    memberIds: string[],
    beforeDate: Date,
  ): Promise<ScaleMemberParticipationHistory[]> {
    if (memberIds.length === 0) return [];
    const serviceRows = await this.database
      .select({
        id: services.id,
        date: services.date,
        time: services.time,
        dayOfWeek: services.dayOfWeek,
      })
      .from(services)
      .where(
        and(
          eq(services.churchId, churchId),
          lt(services.date, beforeDate),
          isNull(services.deletedAt),
        ),
      )
      .orderBy(asc(services.date), asc(services.time));

    const assignmentRows = await this.database
      .select({ serviceId: services.id, memberId: scaleMembers.memberId })
      .from(scaleMembers)
      .innerJoin(scales, eq(scales.id, scaleMembers.scaleId))
      .innerJoin(services, eq(services.id, scales.serviceId))
      .where(
        and(
          eq(services.churchId, churchId),
          lt(services.date, beforeDate),
          inArray(scaleMembers.memberId, [...new Set(memberIds)]),
          isNull(services.deletedAt),
          isNull(scales.deletedAt),
          isNull(scaleMembers.deletedAt),
        ),
      );

    const assigned = new Set(
      assignmentRows.map((row) => `${row.memberId}:${row.serviceId}`),
    );
    return memberIds.map((memberId) => ({
      memberId,
      participationHistory: serviceRows.map((service) => ({
        serviceId: service.id,
        serviceDate: service.date,
        serviceTime: service.time,
        dayOfWeek: service.dayOfWeek as DayOfWeek,
        participated: assigned.has(`${memberId}:${service.id}`),
      })),
    }));
  }

  async findExactTimeConflicts(
    churchId: string,
    memberIds: string[],
    serviceDate: Date,
    serviceTime: string,
    excludeServiceId?: string,
  ): Promise<string[]> {
    if (memberIds.length === 0) return [];
    const rows = await this.database
      .select({ memberId: scaleMembers.memberId })
      .from(scaleMembers)
      .innerJoin(scales, eq(scales.id, scaleMembers.scaleId))
      .innerJoin(services, eq(services.id, scales.serviceId))
      .where(
        and(
          eq(services.churchId, churchId),
          eq(services.date, serviceDate),
          eq(services.time, serviceTime),
          ...(excludeServiceId ? [ne(services.id, excludeServiceId)] : []),
          inArray(scaleMembers.memberId, [...new Set(memberIds)]),
          isNull(services.deletedAt),
          isNull(scales.deletedAt),
          isNull(scaleMembers.deletedAt),
        ),
      );
    return [...new Set(rows.map((row) => row.memberId))];
  }
}
