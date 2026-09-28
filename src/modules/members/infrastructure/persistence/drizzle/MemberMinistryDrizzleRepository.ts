import { and, eq, isNull } from "drizzle-orm";

import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
import { memberMinistries } from "@/infra/database/drizzle/schema";
import type { IMemberMinistryRepository } from "@/modules/members/application/ports/IMemberMinistryRepository";
import { MemberMinistry } from "@/modules/members/domain/entities/MemberMinistry";

function toEntity(row: typeof memberMinistries.$inferSelect): MemberMinistry {
  return new MemberMinistry({
    id: row.id,
    memberId: row.memberId,
    churchId: row.churchId,
    ministryId: row.ministryId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  });
}

export class MemberMinistryDrizzleRepository
  implements IMemberMinistryRepository
{
  constructor(private readonly database: DatabaseExecutor) {}

  async findById(id: string): Promise<MemberMinistry | null> {
    const [row] = await this.database
      .select()
      .from(memberMinistries)
      .where(
        and(eq(memberMinistries.id, id), isNull(memberMinistries.deletedAt)),
      )
      .limit(1);

    return row ? toEntity(row) : null;
  }

  async findAll(): Promise<MemberMinistry[]> {
    const rows = await this.database
      .select()
      .from(memberMinistries)
      .where(isNull(memberMinistries.deletedAt));

    return rows.map(toEntity);
  }

  async findByMemberId(memberId: string): Promise<MemberMinistry[]> {
    const rows = await this.database
      .select()
      .from(memberMinistries)
      .where(
        and(
          eq(memberMinistries.memberId, memberId),
          isNull(memberMinistries.deletedAt),
        ),
      );

    return rows.map(toEntity);
  }

  async findByChurchId(churchId: string): Promise<MemberMinistry[]> {
    const rows = await this.database
      .select()
      .from(memberMinistries)
      .where(
        and(
          eq(memberMinistries.churchId, churchId),
          isNull(memberMinistries.deletedAt),
        ),
      );

    return rows.map(toEntity);
  }

  async findByMinistryId(ministryId: string): Promise<MemberMinistry[]> {
    const rows = await this.database
      .select()
      .from(memberMinistries)
      .where(
        and(
          eq(memberMinistries.ministryId, ministryId),
          isNull(memberMinistries.deletedAt),
        ),
      );

    return rows.map(toEntity);
  }

  async findByMemberAndMinistry(
    memberId: string,
    ministryId: string,
  ): Promise<MemberMinistry | null> {
    const [row] = await this.database
      .select()
      .from(memberMinistries)
      .where(
        and(
          eq(memberMinistries.memberId, memberId),
          eq(memberMinistries.ministryId, ministryId),
          isNull(memberMinistries.deletedAt),
        ),
      )
      .limit(1);

    return row ? toEntity(row) : null;
  }

  async create(entity: MemberMinistry): Promise<MemberMinistry> {
    const [row] = await this.database
      .insert(memberMinistries)
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

  async update(entity: MemberMinistry): Promise<MemberMinistry> {
    const [row] = await this.database
      .update(memberMinistries)
      .set({
        churchId: entity.churchId,
        memberId: entity.memberId,
        ministryId: entity.ministryId,
        updatedAt: entity.updatedAt,
      })
      .where(
        and(
          eq(memberMinistries.id, entity.id),
          isNull(memberMinistries.deletedAt),
        ),
      )
      .returning();

    return toEntity(row);
  }

  async delete(id: string): Promise<void> {
    await this.database
      .update(memberMinistries)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(eq(memberMinistries.id, id), isNull(memberMinistries.deletedAt)),
      );
  }
}
