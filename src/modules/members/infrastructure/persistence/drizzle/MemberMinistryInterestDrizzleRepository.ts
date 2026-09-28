import { and, eq, isNull } from "drizzle-orm";

import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
import { memberMinistryInterests } from "@/infra/database/drizzle/schema";
import type { IMemberMinistryInterestRepository } from "@/modules/members/application/ports/IMemberMinistryInterestRepository";
import { MemberMinistryInterest } from "@/modules/members/domain/entities/MemberMinistryInterest";

function toEntity(
  row: typeof memberMinistryInterests.$inferSelect,
): MemberMinistryInterest {
  return new MemberMinistryInterest({
    id: row.id,
    memberId: row.memberId,
    churchId: row.churchId,
    ministryId: row.ministryId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  });
}

export class MemberMinistryInterestDrizzleRepository
  implements IMemberMinistryInterestRepository
{
  constructor(private readonly database: DatabaseExecutor) {}

  async findById(id: string): Promise<MemberMinistryInterest | null> {
    const [row] = await this.database
      .select()
      .from(memberMinistryInterests)
      .where(
        and(
          eq(memberMinistryInterests.id, id),
          isNull(memberMinistryInterests.deletedAt),
        ),
      )
      .limit(1);

    return row ? toEntity(row) : null;
  }

  async findAll(): Promise<MemberMinistryInterest[]> {
    const rows = await this.database
      .select()
      .from(memberMinistryInterests)
      .where(isNull(memberMinistryInterests.deletedAt));

    return rows.map(toEntity);
  }

  async findByMemberAndChurch(
    memberId: string,
    churchId: string,
  ): Promise<MemberMinistryInterest[]> {
    const rows = await this.database
      .select()
      .from(memberMinistryInterests)
      .where(
        and(
          eq(memberMinistryInterests.memberId, memberId),
          eq(memberMinistryInterests.churchId, churchId),
          isNull(memberMinistryInterests.deletedAt),
        ),
      );

    return rows.map(toEntity);
  }

  async findByChurchId(churchId: string): Promise<MemberMinistryInterest[]> {
    const rows = await this.database
      .select()
      .from(memberMinistryInterests)
      .where(
        and(
          eq(memberMinistryInterests.churchId, churchId),
          isNull(memberMinistryInterests.deletedAt),
        ),
      );

    return rows.map(toEntity);
  }

  async create(
    entity: MemberMinistryInterest,
  ): Promise<MemberMinistryInterest> {
    const [row] = await this.database
      .insert(memberMinistryInterests)
      .values({
        id: entity.id,
        memberId: entity.memberId,
        churchId: entity.churchId,
        ministryId: entity.ministryId,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        deletedAt: entity.deletedAt,
      })
      .returning();

    return toEntity(row);
  }

  async update(
    entity: MemberMinistryInterest,
  ): Promise<MemberMinistryInterest> {
    const [row] = await this.database
      .update(memberMinistryInterests)
      .set({ updatedAt: entity.updatedAt, ministryId: entity.ministryId })
      .where(
        and(
          eq(memberMinistryInterests.id, entity.id),
          isNull(memberMinistryInterests.deletedAt),
        ),
      )
      .returning();

    return toEntity(row);
  }

  async delete(id: string): Promise<void> {
    await this.database
      .update(memberMinistryInterests)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(memberMinistryInterests.id, id),
          isNull(memberMinistryInterests.deletedAt),
        ),
      );
  }

  async replaceByMemberAndChurch(
    memberId: string,
    churchId: string,
    interests: MemberMinistryInterest[],
  ): Promise<void> {
    await this.database.transaction(async (transaction) => {
      const now = new Date();
      await transaction
        .update(memberMinistryInterests)
        .set({ deletedAt: now, updatedAt: now })
        .where(
          and(
            eq(memberMinistryInterests.memberId, memberId),
            eq(memberMinistryInterests.churchId, churchId),
            isNull(memberMinistryInterests.deletedAt),
          ),
        );

      if (interests.length === 0) return;

      await transaction.insert(memberMinistryInterests).values(
        interests.map((interest) => ({
          id: interest.id,
          memberId: interest.memberId,
          churchId: interest.churchId,
          ministryId: interest.ministryId,
          createdAt: interest.createdAt,
          updatedAt: interest.updatedAt,
          deletedAt: interest.deletedAt,
        })),
      );
    });
  }
}
