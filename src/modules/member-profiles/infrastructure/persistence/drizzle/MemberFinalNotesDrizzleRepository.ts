import { and, eq, isNull } from "drizzle-orm";
import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
import { memberFinalNotes } from "@/infra/database/drizzle/schema";
import type { IMemberFinalNotesRepository } from "@/modules/member-profiles/application/ports/IMemberFinalNotesRepository";
import { MemberFinalNotes } from "@/modules/member-profiles/domain/entities/MemberFinalNotes";

const toEntity = (row: typeof memberFinalNotes.$inferSelect) =>
  new MemberFinalNotes(row);

export class MemberFinalNotesDrizzleRepository
  implements IMemberFinalNotesRepository
{
  constructor(private readonly database: DatabaseExecutor) {}
  async findById(id: string) {
    const [row] = await this.database
      .select()
      .from(memberFinalNotes)
      .where(
        and(eq(memberFinalNotes.id, id), isNull(memberFinalNotes.deletedAt)),
      )
      .limit(1);
    return row ? toEntity(row) : null;
  }
  async findAll() {
    const rows = await this.database
      .select()
      .from(memberFinalNotes)
      .where(isNull(memberFinalNotes.deletedAt));
    return rows.map(toEntity);
  }
  async findByMemberAndChurch(memberId: string, churchId: string) {
    const [row] = await this.database
      .select()
      .from(memberFinalNotes)
      .where(
        and(
          eq(memberFinalNotes.memberId, memberId),
          eq(memberFinalNotes.churchId, churchId),
          isNull(memberFinalNotes.deletedAt),
        ),
      )
      .limit(1);
    return row ? toEntity(row) : null;
  }
  async findByChurchId(churchId: string) {
    const rows = await this.database
      .select()
      .from(memberFinalNotes)
      .where(
        and(
          eq(memberFinalNotes.churchId, churchId),
          isNull(memberFinalNotes.deletedAt),
        ),
      );
    return rows.map(toEntity);
  }
  async create(entity: MemberFinalNotes) {
    const [row] = await this.database
      .insert(memberFinalNotes)
      .values(entity)
      .returning();
    return toEntity(row);
  }
  async update(entity: MemberFinalNotes) {
    const [row] = await this.database
      .update(memberFinalNotes)
      .set({
        healthLimitations: entity.healthLimitations,
        leadershipNotes: entity.leadershipNotes,
        updatedAt: entity.updatedAt,
      })
      .where(
        and(
          eq(memberFinalNotes.id, entity.id),
          isNull(memberFinalNotes.deletedAt),
        ),
      )
      .returning();
    return toEntity(row);
  }
  async delete(id: string) {
    await this.database
      .update(memberFinalNotes)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(eq(memberFinalNotes.id, id), isNull(memberFinalNotes.deletedAt)),
      );
  }
  async upsertByMemberAndChurch(entity: MemberFinalNotes) {
    const [row] = await this.database
      .insert(memberFinalNotes)
      .values(entity)
      .onConflictDoUpdate({
        target: [memberFinalNotes.memberId, memberFinalNotes.churchId],
        set: {
          healthLimitations: entity.healthLimitations,
          leadershipNotes: entity.leadershipNotes,
          updatedAt: entity.updatedAt,
          deletedAt: null,
        },
      })
      .returning();
    return toEntity(row);
  }
}
