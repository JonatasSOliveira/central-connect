import { and, eq, isNull } from "drizzle-orm";
import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
import { memberSpiritualJourneys } from "@/infra/database/drizzle/schema";
import type { IMemberSpiritualJourneyRepository } from "@/modules/member-profiles/application/ports/IMemberSpiritualJourneyRepository";
import { MemberSpiritualJourney } from "@/modules/member-profiles/domain/entities/MemberSpiritualJourney";

const toEntity = (row: typeof memberSpiritualJourneys.$inferSelect) =>
  new MemberSpiritualJourney(
    row as ConstructorParameters<typeof MemberSpiritualJourney>[0],
  );

export class MemberSpiritualJourneyDrizzleRepository
  implements IMemberSpiritualJourneyRepository
{
  constructor(private readonly database: DatabaseExecutor) {}
  async findById(id: string) {
    const [row] = await this.database
      .select()
      .from(memberSpiritualJourneys)
      .where(
        and(
          eq(memberSpiritualJourneys.id, id),
          isNull(memberSpiritualJourneys.deletedAt),
        ),
      )
      .limit(1);
    return row ? toEntity(row) : null;
  }
  async findAll() {
    const rows = await this.database
      .select()
      .from(memberSpiritualJourneys)
      .where(isNull(memberSpiritualJourneys.deletedAt));
    return rows.map(toEntity);
  }
  async findByMemberAndChurch(memberId: string, churchId: string) {
    const [row] = await this.database
      .select()
      .from(memberSpiritualJourneys)
      .where(
        and(
          eq(memberSpiritualJourneys.memberId, memberId),
          eq(memberSpiritualJourneys.churchId, churchId),
          isNull(memberSpiritualJourneys.deletedAt),
        ),
      )
      .limit(1);
    return row ? toEntity(row) : null;
  }
  async findByChurchId(churchId: string) {
    const rows = await this.database
      .select()
      .from(memberSpiritualJourneys)
      .where(
        and(
          eq(memberSpiritualJourneys.churchId, churchId),
          isNull(memberSpiritualJourneys.deletedAt),
        ),
      );
    return rows.map(toEntity);
  }
  async create(entity: MemberSpiritualJourney) {
    const [row] = await this.database
      .insert(memberSpiritualJourneys)
      .values(entity)
      .returning();
    return toEntity(row);
  }
  async update(entity: MemberSpiritualJourney) {
    const [row] = await this.database
      .update(memberSpiritualJourneys)
      .set({
        acceptedJesus: entity.acceptedJesus,
        waterBaptized: entity.waterBaptized,
        baptismDetails: entity.baptismDetails,
        discipleshipStatus: entity.discipleshipStatus,
        churchAttendanceTime: entity.churchAttendanceTime,
        smallGroupStatus: entity.smallGroupStatus,
        officialMemberStatus: entity.officialMemberStatus,
        updatedAt: entity.updatedAt,
      })
      .where(
        and(
          eq(memberSpiritualJourneys.id, entity.id),
          isNull(memberSpiritualJourneys.deletedAt),
        ),
      )
      .returning();
    return toEntity(row);
  }
  async delete(id: string) {
    await this.database
      .update(memberSpiritualJourneys)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(memberSpiritualJourneys.id, id),
          isNull(memberSpiritualJourneys.deletedAt),
        ),
      );
  }
  async upsertByMemberAndChurch(entity: MemberSpiritualJourney) {
    const [row] = await this.database
      .insert(memberSpiritualJourneys)
      .values(entity)
      .onConflictDoUpdate({
        target: [
          memberSpiritualJourneys.memberId,
          memberSpiritualJourneys.churchId,
        ],
        set: {
          acceptedJesus: entity.acceptedJesus,
          waterBaptized: entity.waterBaptized,
          baptismDetails: entity.baptismDetails,
          discipleshipStatus: entity.discipleshipStatus,
          churchAttendanceTime: entity.churchAttendanceTime,
          smallGroupStatus: entity.smallGroupStatus,
          officialMemberStatus: entity.officialMemberStatus,
          updatedAt: entity.updatedAt,
          deletedAt: null,
        },
      })
      .returning();
    return toEntity(row);
  }
}
