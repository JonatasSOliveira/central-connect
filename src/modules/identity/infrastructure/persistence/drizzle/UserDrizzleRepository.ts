import { and, eq, isNull } from "drizzle-orm";

import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
import { users } from "@/infra/database/drizzle/schema";
import type { IUserRepository } from "@/modules/identity/application/ports/IUserRepository";
import { User } from "@/modules/identity/domain/entities/User";

function toEntity(row: typeof users.$inferSelect): User {
  return new User({
    id: row.id,
    firebaseUid: row.firebaseUid,
    memberId: row.memberId,
    googleAccessToken: row.googleAccessToken,
    googleRefreshToken: row.googleRefreshToken,
    isActive: row.isActive,
    isSuperAdmin: row.isSuperAdmin,
    lastLoginAt: row.lastLoginAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  });
}

export class UserDrizzleRepository implements IUserRepository {
  constructor(private readonly database: DatabaseExecutor) {}

  async findById(id: string): Promise<User | null> {
    const [row] = await this.database
      .select()
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .limit(1);

    return row ? toEntity(row) : null;
  }

  async findAll(): Promise<User[]> {
    const rows = await this.database
      .select()
      .from(users)
      .where(isNull(users.deletedAt));

    return rows.map(toEntity);
  }

  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    const [row] = await this.database
      .select()
      .from(users)
      .where(and(eq(users.firebaseUid, firebaseUid), isNull(users.deletedAt)))
      .limit(1);

    return row ? toEntity(row) : null;
  }

  async findByMemberId(memberId: string): Promise<User | null> {
    const [row] = await this.database
      .select()
      .from(users)
      .where(and(eq(users.memberId, memberId), isNull(users.deletedAt)))
      .limit(1);

    return row ? toEntity(row) : null;
  }

  async create(entity: User): Promise<User> {
    const [row] = await this.database
      .insert(users)
      .values({
        id: entity.id,
        firebaseUid: entity.firebaseUid,
        memberId: entity.memberId,
        googleAccessToken: entity.googleAccessToken,
        googleRefreshToken: entity.googleRefreshToken,
        isActive: entity.isActive,
        isSuperAdmin: entity.isSuperAdmin,
        lastLoginAt: entity.lastLoginAt,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        deletedAt: entity.deletedAt,
      })
      .returning();

    return toEntity(row);
  }

  async update(entity: User): Promise<User> {
    const [row] = await this.database
      .update(users)
      .set({
        firebaseUid: entity.firebaseUid,
        memberId: entity.memberId,
        googleAccessToken: entity.googleAccessToken,
        googleRefreshToken: entity.googleRefreshToken,
        isActive: entity.isActive,
        isSuperAdmin: entity.isSuperAdmin,
        lastLoginAt: entity.lastLoginAt,
        updatedAt: entity.updatedAt,
      })
      .where(and(eq(users.id, entity.id), isNull(users.deletedAt)))
      .returning();

    return toEntity(row);
  }

  async delete(id: string): Promise<void> {
    await this.database
      .update(users)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(users.id, id), isNull(users.deletedAt)));
  }
}
