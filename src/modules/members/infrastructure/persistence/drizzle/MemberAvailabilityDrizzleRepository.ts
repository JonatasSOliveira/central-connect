import { and, eq, inArray, isNull } from "drizzle-orm";

import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
import { memberAvailabilities } from "@/infra/database/drizzle/schema";
import type { IMemberAvailabilityRepository } from "@/modules/members/application/ports/IMemberAvailabilityRepository";
import type { MemberAvailability } from "@/modules/members/domain/entities/MemberAvailability";
import {
  memberAvailabilityFromDrizzle,
  memberAvailabilityToDrizzle,
} from "../../mappers/memberAvailabilityDrizzleMapper";

export class MemberAvailabilityDrizzleRepository
  implements IMemberAvailabilityRepository
{
  constructor(private readonly database: DatabaseExecutor) {}

  async findById(id: string): Promise<MemberAvailability | null> {
    const [row] = await this.database
      .select()
      .from(memberAvailabilities)
      .where(
        and(
          eq(memberAvailabilities.id, id),
          isNull(memberAvailabilities.deletedAt),
        ),
      )
      .limit(1);

    return row ? memberAvailabilityFromDrizzle(row) : null;
  }

  async findAll(): Promise<MemberAvailability[]> {
    const rows = await this.database
      .select()
      .from(memberAvailabilities)
      .where(isNull(memberAvailabilities.deletedAt));

    return rows.map(memberAvailabilityFromDrizzle);
  }

  async findByMemberId(memberId: string): Promise<MemberAvailability | null> {
    const [row] = await this.database
      .select()
      .from(memberAvailabilities)
      .where(
        and(
          eq(memberAvailabilities.memberId, memberId),
          isNull(memberAvailabilities.deletedAt),
        ),
      )
      .limit(1);

    return row ? memberAvailabilityFromDrizzle(row) : null;
  }

  async findByMemberIds(memberIds: string[]): Promise<MemberAvailability[]> {
    if (memberIds.length === 0) return [];

    const rows = await this.database
      .select()
      .from(memberAvailabilities)
      .where(
        and(
          inArray(memberAvailabilities.memberId, memberIds),
          isNull(memberAvailabilities.deletedAt),
        ),
      );

    return rows.map(memberAvailabilityFromDrizzle);
  }

  async create(entity: MemberAvailability): Promise<MemberAvailability> {
    return this.upsert(entity);
  }

  async update(entity: MemberAvailability): Promise<MemberAvailability> {
    return this.upsert(entity);
  }

  async upsert(entity: MemberAvailability): Promise<MemberAvailability> {
    const values = memberAvailabilityToDrizzle(entity);
    const [row] = await this.database
      .insert(memberAvailabilities)
      .values(values)
      .onConflictDoUpdate({
        target: memberAvailabilities.memberId,
        set: {
          daysOfWeek: entity.daysOfWeek,
          updatedAt: entity.updatedAt,
          deletedAt: null,
        },
      })
      .returning();

    return memberAvailabilityFromDrizzle(row);
  }

  async delete(id: string): Promise<void> {
    await this.database
      .update(memberAvailabilities)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(memberAvailabilities.id, id),
          isNull(memberAvailabilities.deletedAt),
        ),
      );
  }

  async deleteByMemberId(memberId: string): Promise<void> {
    await this.database
      .update(memberAvailabilities)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(memberAvailabilities.memberId, memberId),
          isNull(memberAvailabilities.deletedAt),
        ),
      );
  }
}
