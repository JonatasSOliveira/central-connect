import { and, eq, ilike, inArray, isNull, or } from "drizzle-orm";

import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
import { members } from "@/infra/database/drizzle/schema";
import type { IMemberRepository } from "@/modules/members/application/ports/IMemberRepository";
import { Member } from "@/modules/members/domain/entities/Member";
import { normalizePhone } from "@/shared/utils/phone";

function toEntity(row: typeof members.$inferSelect): Member {
  return new Member({
    id: row.id,
    email: row.email,
    fullName: row.fullName,
    phone: row.phone,
    maxServicesPerMonth: row.maxServicesPerMonth,
    status: row.status as Member["status"],
    avatarUrl: row.avatarUrl,
    birthDate: row.birthDate,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  });
}

function toValues(entity: Member) {
  return {
    id: entity.id,
    email: entity.email,
    fullName: entity.fullName,
    phone: entity.phone,
    phoneNormalized: normalizePhone(entity.phone) || null,
    maxServicesPerMonth: entity.maxServicesPerMonth,
    status: entity.status,
    avatarUrl: entity.avatarUrl,
    birthDate: entity.birthDate,
    notes: entity.notes,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    deletedAt: entity.deletedAt,
  };
}

export class MemberDrizzleRepository implements IMemberRepository {
  constructor(private readonly database: DatabaseExecutor) {}

  async findById(id: string): Promise<Member | null> {
    const [row] = await this.database
      .select()
      .from(members)
      .where(and(eq(members.id, id), isNull(members.deletedAt)))
      .limit(1);

    return row ? toEntity(row) : null;
  }

  async findAll(): Promise<Member[]> {
    const rows = await this.database
      .select()
      .from(members)
      .where(isNull(members.deletedAt));

    return rows.map(toEntity);
  }

  async findByEmail(email: string): Promise<Member | null> {
    if (!email) return null;

    const [row] = await this.database
      .select()
      .from(members)
      .where(and(eq(members.email, email), isNull(members.deletedAt)))
      .limit(1);

    return row ? toEntity(row) : null;
  }

  async findByNormalizedPhone(phoneNormalized: string): Promise<Member | null> {
    if (!phoneNormalized) return null;

    const [row] = await this.database
      .select()
      .from(members)
      .where(
        and(
          eq(members.phoneNormalized, phoneNormalized),
          isNull(members.deletedAt),
        ),
      )
      .limit(1);

    return row ? toEntity(row) : null;
  }

  async findBySearch(search: string): Promise<Member[]> {
    if (!search?.trim()) return this.findAll();

    const term = search.trim();
    const rows = await this.database
      .select()
      .from(members)
      .where(
        and(
          isNull(members.deletedAt),
          or(
            ilike(members.fullName, `%${term}%`),
            ilike(members.email, `%${term}%`),
            ilike(members.phone, `%${term}%`),
          ),
        ),
      )
      .orderBy(members.fullName)
      .limit(100);

    return rows.map(toEntity);
  }

  async findByIds(ids: string[]): Promise<Member[]> {
    if (ids.length === 0) return [];

    const uniqueIds = Array.from(new Set(ids));
    const rows = await this.database
      .select()
      .from(members)
      .where(and(inArray(members.id, uniqueIds), isNull(members.deletedAt)));
    const byId = new Map(rows.map((row) => [row.id, toEntity(row)]));

    return uniqueIds
      .map((id) => byId.get(id))
      .filter((member): member is Member => member !== undefined);
  }

  async create(entity: Member): Promise<Member> {
    const [row] = await this.database
      .insert(members)
      .values(toValues(entity))
      .returning();

    return toEntity(row);
  }

  async update(entity: Member): Promise<Member> {
    const [row] = await this.database
      .update(members)
      .set({ ...toValues(entity), id: undefined })
      .where(and(eq(members.id, entity.id), isNull(members.deletedAt)))
      .returning();

    return toEntity(row);
  }

  async delete(id: string): Promise<void> {
    await this.database
      .update(members)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(members.id, id), isNull(members.deletedAt)));
  }
}
