import { and, eq, isNull } from "drizzle-orm";
import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
import { memberMinistryRoles } from "@/infra/database/drizzle/schema";
import type { IMemberMinistryRoleRepository } from "@/modules/members/application/ports/IMemberMinistryRoleRepository";
import { MemberMinistryRole } from "@/modules/members/domain/entities/MemberMinistryRole";
function toEntity(
  row: typeof memberMinistryRoles.$inferSelect,
): MemberMinistryRole {
  return new MemberMinistryRole({
    id: row.id,
    churchId: row.churchId,
    memberId: row.memberId,
    ministryId: row.ministryId,
    ministryRoleId: row.ministryRoleId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  });
}
export class MemberMinistryRoleDrizzleRepository
  implements IMemberMinistryRoleRepository
{
  constructor(private readonly database: DatabaseExecutor) {}
  async findById(id: string): Promise<MemberMinistryRole | null> {
    const [row] = await this.database
      .select()
      .from(memberMinistryRoles)
      .where(
        and(
          eq(memberMinistryRoles.id, id),
          isNull(memberMinistryRoles.deletedAt),
        ),
      )
      .limit(1);

    return row ? toEntity(row) : null;
  }
  async findAll(): Promise<MemberMinistryRole[]> {
    const rows = await this.database
      .select()
      .from(memberMinistryRoles)
      .where(isNull(memberMinistryRoles.deletedAt));

    return rows.map(toEntity);
  }
  async findByMemberAndMinistry(
    memberId: string,
    ministryId: string,
  ): Promise<MemberMinistryRole[]> {
    const rows = await this.database
      .select()
      .from(memberMinistryRoles)
      .where(
        and(
          eq(memberMinistryRoles.memberId, memberId),
          eq(memberMinistryRoles.ministryId, ministryId),
          isNull(memberMinistryRoles.deletedAt),
        ),
      );

    return rows.map(toEntity);
  }
  async findByMemberId(memberId: string): Promise<MemberMinistryRole[]> {
    const rows = await this.database
      .select()
      .from(memberMinistryRoles)
      .where(
        and(
          eq(memberMinistryRoles.memberId, memberId),
          isNull(memberMinistryRoles.deletedAt),
        ),
      );

    return rows.map(toEntity);
  }
  async findByMinistryRoleId(
    ministryRoleId: string,
  ): Promise<MemberMinistryRole[]> {
    const rows = await this.database
      .select()
      .from(memberMinistryRoles)
      .where(
        and(
          eq(memberMinistryRoles.ministryRoleId, ministryRoleId),
          isNull(memberMinistryRoles.deletedAt),
        ),
      );

    return rows.map(toEntity);
  }
  async findByMinistryId(ministryId: string): Promise<MemberMinistryRole[]> {
    const rows = await this.database
      .select()
      .from(memberMinistryRoles)
      .where(
        and(
          eq(memberMinistryRoles.ministryId, ministryId),
          isNull(memberMinistryRoles.deletedAt),
        ),
      );

    return rows.map(toEntity);
  }
  async findByChurchIdAndMinistryId(
    churchId: string,
    ministryId: string,
  ): Promise<MemberMinistryRole[]> {
    const rows = await this.database
      .select()
      .from(memberMinistryRoles)
      .where(
        and(
          eq(memberMinistryRoles.churchId, churchId),
          eq(memberMinistryRoles.ministryId, ministryId),
          isNull(memberMinistryRoles.deletedAt),
        ),
      );

    return rows.map(toEntity);
  }
  async findByChurchMemberAndMinistry(
    churchId: string,
    memberId: string,
    ministryId: string,
  ): Promise<MemberMinistryRole[]> {
    const rows = await this.database
      .select()
      .from(memberMinistryRoles)
      .where(
        and(
          eq(memberMinistryRoles.churchId, churchId),
          eq(memberMinistryRoles.memberId, memberId),
          eq(memberMinistryRoles.ministryId, ministryId),
          isNull(memberMinistryRoles.deletedAt),
        ),
      );

    return rows.map(toEntity);
  }
  async create(entity: MemberMinistryRole): Promise<MemberMinistryRole> {
    const [row] = await this.database
      .insert(memberMinistryRoles)
      .values({
        id: entity.id,
        churchId: entity.churchId,
        memberId: entity.memberId,
        ministryId: entity.ministryId,
        ministryRoleId: entity.ministryRoleId,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        deletedAt: entity.deletedAt,
      })
      .returning();

    return toEntity(row);
  }
  async upsert(entity: MemberMinistryRole): Promise<MemberMinistryRole> {
    const [row] = await this.database
      .insert(memberMinistryRoles)
      .values({
        id: entity.id,
        churchId: entity.churchId,
        memberId: entity.memberId,
        ministryId: entity.ministryId,
        ministryRoleId: entity.ministryRoleId,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        deletedAt: null,
      })
      .onConflictDoUpdate({
        target: [
          memberMinistryRoles.memberId,
          memberMinistryRoles.ministryRoleId,
        ],
        set: {
          churchId: entity.churchId,
          ministryId: entity.ministryId,
          updatedAt: entity.updatedAt,
          deletedAt: null,
        },
      })
      .returning();

    return toEntity(row);
  }
  async update(entity: MemberMinistryRole): Promise<MemberMinistryRole> {
    const [row] = await this.database
      .update(memberMinistryRoles)
      .set({
        churchId: entity.churchId,
        memberId: entity.memberId,
        ministryId: entity.ministryId,
        ministryRoleId: entity.ministryRoleId,
        updatedAt: entity.updatedAt,
      })
      .where(
        and(
          eq(memberMinistryRoles.id, entity.id),
          isNull(memberMinistryRoles.deletedAt),
        ),
      )
      .returning();

    return toEntity(row);
  }
  async delete(id: string): Promise<void> {
    await this.database
      .update(memberMinistryRoles)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(memberMinistryRoles.id, id),
          isNull(memberMinistryRoles.deletedAt),
        ),
      );
  }
}
