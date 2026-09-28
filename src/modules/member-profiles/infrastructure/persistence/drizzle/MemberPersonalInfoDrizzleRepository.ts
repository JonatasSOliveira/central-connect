import { and, eq, isNull } from "drizzle-orm";
import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
import { memberPersonalInfos } from "@/infra/database/drizzle/schema";
import type { IMemberPersonalInfoRepository } from "@/modules/member-profiles/application/ports/IMemberPersonalInfoRepository";
import { MemberPersonalInfo } from "@/modules/member-profiles/domain/entities/MemberPersonalInfo";

const toEntity = (row: typeof memberPersonalInfos.$inferSelect) =>
  new MemberPersonalInfo({
    ...row,
    maritalStatus: row.maritalStatus as NonNullable<
      MemberPersonalInfo["maritalStatus"]
    >,
    hasChildren: row.hasChildren ?? false,
    childrenAges: row.childrenAges,
    neighborhood: row.neighborhood ?? "",
  });

export class MemberPersonalInfoDrizzleRepository
  implements IMemberPersonalInfoRepository
{
  constructor(private readonly database: DatabaseExecutor) {}
  async findById(id: string) {
    const [row] = await this.database
      .select()
      .from(memberPersonalInfos)
      .where(
        and(
          eq(memberPersonalInfos.id, id),
          isNull(memberPersonalInfos.deletedAt),
        ),
      )
      .limit(1);
    return row ? toEntity(row) : null;
  }
  async findAll() {
    const rows = await this.database
      .select()
      .from(memberPersonalInfos)
      .where(isNull(memberPersonalInfos.deletedAt));
    return rows.map(toEntity);
  }
  async findByMemberAndChurch(memberId: string, churchId: string) {
    const [row] = await this.database
      .select()
      .from(memberPersonalInfos)
      .where(
        and(
          eq(memberPersonalInfos.memberId, memberId),
          eq(memberPersonalInfos.churchId, churchId),
          isNull(memberPersonalInfos.deletedAt),
        ),
      )
      .limit(1);
    return row ? toEntity(row) : null;
  }
  async findByChurchId(churchId: string) {
    const rows = await this.database
      .select()
      .from(memberPersonalInfos)
      .where(
        and(
          eq(memberPersonalInfos.churchId, churchId),
          isNull(memberPersonalInfos.deletedAt),
        ),
      );
    return rows.map(toEntity);
  }
  async create(entity: MemberPersonalInfo) {
    const [row] = await this.database
      .insert(memberPersonalInfos)
      .values(entity)
      .returning();
    return toEntity(row);
  }
  async update(entity: MemberPersonalInfo) {
    const [row] = await this.database
      .update(memberPersonalInfos)
      .set({
        maritalStatus: entity.maritalStatus,
        hasChildren: entity.hasChildren,
        childrenCount: entity.childrenCount,
        childrenAges: entity.childrenAges,
        neighborhood: entity.neighborhood,
        updatedAt: entity.updatedAt,
      })
      .where(
        and(
          eq(memberPersonalInfos.id, entity.id),
          isNull(memberPersonalInfos.deletedAt),
        ),
      )
      .returning();
    return toEntity(row);
  }
  async delete(id: string) {
    await this.database
      .update(memberPersonalInfos)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(memberPersonalInfos.id, id),
          isNull(memberPersonalInfos.deletedAt),
        ),
      );
  }
  async upsertByMemberAndChurch(entity: MemberPersonalInfo) {
    const [row] = await this.database
      .insert(memberPersonalInfos)
      .values(entity)
      .onConflictDoUpdate({
        target: [memberPersonalInfos.memberId, memberPersonalInfos.churchId],
        set: {
          maritalStatus: entity.maritalStatus,
          hasChildren: entity.hasChildren,
          childrenCount: entity.childrenCount,
          childrenAges: entity.childrenAges,
          neighborhood: entity.neighborhood,
          updatedAt: entity.updatedAt,
          deletedAt: null,
        },
      })
      .returning();
    return toEntity(row);
  }
}
