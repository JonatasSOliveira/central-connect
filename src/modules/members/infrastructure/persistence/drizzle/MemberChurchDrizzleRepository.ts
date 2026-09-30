import { and, eq, isNull } from "drizzle-orm";

import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
import { memberChurches } from "@/infra/database/drizzle/schema";
import type { IMemberChurchRepository } from "@/modules/members/application/ports/IMemberChurchRepository";
import { MemberChurch } from "@/modules/members/domain/entities/MemberChurch";

function toEntity(row: typeof memberChurches.$inferSelect): MemberChurch {
  return new MemberChurch({
    id: row.id,
    memberId: row.memberId,
    churchId: row.churchId,
    roleId: row.roleId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  });
}

export class MemberChurchDrizzleRepository implements IMemberChurchRepository {
  constructor(private readonly database: DatabaseExecutor) {}

  async findById(id: string): Promise<MemberChurch | null> {
    const [row] = await this.database
      .select()
      .from(memberChurches)
      .where(and(eq(memberChurches.id, id), isNull(memberChurches.deletedAt)))
      .limit(1);

    return row ? toEntity(row) : null;
  }

  async findAll(): Promise<MemberChurch[]> {
    const rows = await this.database
      .select()
      .from(memberChurches)
      .where(isNull(memberChurches.deletedAt));

    return rows.map(toEntity);
  }

  async findByMemberId(memberId: string): Promise<MemberChurch[]> {
    const rows = await this.database
      .select()
      .from(memberChurches)
      .where(
        and(
          eq(memberChurches.memberId, memberId),
          isNull(memberChurches.deletedAt),
        ),
      );

    return rows.map(toEntity);
  }

  async findByMemberIdAndChurchId(
    memberId: string,
    churchId: string,
  ): Promise<MemberChurch | null> {
    const [row] = await this.database
      .select()
      .from(memberChurches)
      .where(
        and(
          eq(memberChurches.memberId, memberId),
          eq(memberChurches.churchId, churchId),
          isNull(memberChurches.deletedAt),
        ),
      )
      .limit(1);

    return row ? toEntity(row) : null;
  }

  async findByChurchId(churchId: string): Promise<MemberChurch[]> {
    const rows = await this.database
      .select()
      .from(memberChurches)
      .where(
        and(
          eq(memberChurches.churchId, churchId),
          isNull(memberChurches.deletedAt),
        ),
      );

    return rows.map(toEntity);
  }

  async create(entity: MemberChurch): Promise<MemberChurch> {
    const [row] = await this.database
      .insert(memberChurches)
      .values({
        id: entity.id,
        memberId: entity.memberId,
        churchId: entity.churchId,
        roleId: entity.roleId,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        deletedAt: entity.deletedAt,
      })
      .returning();

    return toEntity(row);
  }

  async upsert(entity: MemberChurch): Promise<MemberChurch> {
    const [row] = await this.database
      .insert(memberChurches)
      .values({
        id: entity.id,
        memberId: entity.memberId,
        churchId: entity.churchId,
        roleId: entity.roleId,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        deletedAt: entity.deletedAt,
      })
      .onConflictDoUpdate({
        target: [memberChurches.memberId, memberChurches.churchId],
        set: {
          roleId: entity.roleId,
          updatedAt: entity.updatedAt,
          deletedAt: null,
        },
      })
      .returning();

    return toEntity(row);
  }

  async update(entity: MemberChurch): Promise<MemberChurch> {
    const [row] = await this.database
      .update(memberChurches)
      .set({ roleId: entity.roleId, updatedAt: entity.updatedAt })
      .where(
        and(eq(memberChurches.id, entity.id), isNull(memberChurches.deletedAt)),
      )
      .returning();

    return toEntity(row);
  }

  async delete(id: string): Promise<void> {
    await this.database
      .update(memberChurches)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(memberChurches.id, id), isNull(memberChurches.deletedAt)));
  }
}
