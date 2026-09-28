import { and, eq, inArray, isNull, sql } from "drizzle-orm";

import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
import { memberPushTokens } from "@/infra/database/drizzle/schema";
import type { IMemberPushTokenRepository } from "@/modules/notifications/application/ports/IMemberPushTokenRepository";
import type { MemberPushToken } from "@/modules/notifications/domain/entities/MemberPushToken";
import {
  memberPushTokenFromDrizzle,
  memberPushTokenToDrizzle,
} from "../../mappers/memberPushTokenDrizzleMapper";

export class MemberPushTokenDrizzleRepository
  implements IMemberPushTokenRepository
{
  constructor(private readonly database: DatabaseExecutor) {}

  async findById(id: string): Promise<MemberPushToken | null> {
    const [row] = await this.database
      .select()
      .from(memberPushTokens)
      .where(
        and(eq(memberPushTokens.id, id), isNull(memberPushTokens.deletedAt)),
      )
      .limit(1);

    return row ? memberPushTokenFromDrizzle(row) : null;
  }

  async findAll(): Promise<MemberPushToken[]> {
    const rows = await this.database
      .select()
      .from(memberPushTokens)
      .where(isNull(memberPushTokens.deletedAt));

    return rows.map(memberPushTokenFromDrizzle);
  }

  async findByMemberAndToken(
    churchId: string,
    memberId: string,
    token: string,
  ): Promise<MemberPushToken | null> {
    const [row] = await this.database
      .select()
      .from(memberPushTokens)
      .where(
        and(
          eq(memberPushTokens.churchId, churchId),
          eq(memberPushTokens.memberId, memberId),
          eq(memberPushTokens.token, token),
          isNull(memberPushTokens.deletedAt),
        ),
      )
      .limit(1);

    return row ? memberPushTokenFromDrizzle(row) : null;
  }

  async findActiveByChurchAndMemberIds(
    churchId: string,
    memberIds: string[],
  ): Promise<MemberPushToken[]> {
    if (memberIds.length === 0) return [];

    const rows = await this.database
      .select()
      .from(memberPushTokens)
      .where(
        and(
          eq(memberPushTokens.churchId, churchId),
          inArray(memberPushTokens.memberId, memberIds),
          eq(memberPushTokens.isActive, true),
          isNull(memberPushTokens.deletedAt),
        ),
      );

    return rows.map(memberPushTokenFromDrizzle);
  }

  async create(entity: MemberPushToken): Promise<MemberPushToken> {
    const [row] = await this.database
      .insert(memberPushTokens)
      .values(memberPushTokenToDrizzle(entity))
      .returning();

    return memberPushTokenFromDrizzle(row);
  }

  async update(entity: MemberPushToken): Promise<MemberPushToken> {
    const [row] = await this.database
      .update(memberPushTokens)
      .set({
        churchId: entity.churchId,
        memberId: entity.memberId,
        token: entity.token,
        deviceId: entity.deviceId,
        platform: entity.platform,
        isActive: entity.isActive,
        failureCount: entity.failureCount,
        lastSeenAt: entity.lastSeenAt,
        lastFailureAt: entity.lastFailureAt,
        updatedAt: entity.updatedAt,
        deletedAt: entity.deletedAt,
      })
      .where(
        and(
          eq(memberPushTokens.id, entity.id),
          isNull(memberPushTokens.deletedAt),
        ),
      )
      .returning();

    return memberPushTokenFromDrizzle(row);
  }

  async delete(id: string): Promise<void> {
    await this.database
      .update(memberPushTokens)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(eq(memberPushTokens.id, id), isNull(memberPushTokens.deletedAt)),
      );
  }

  async deactivateByToken(token: string): Promise<void> {
    await this.database
      .update(memberPushTokens)
      .set({
        isActive: false,
        lastFailureAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(memberPushTokens.token, token),
          eq(memberPushTokens.isActive, true),
          isNull(memberPushTokens.deletedAt),
        ),
      );
  }

  async deactivateByTokenForMember(
    churchId: string,
    memberId: string,
    token: string,
  ): Promise<void> {
    await this.database
      .update(memberPushTokens)
      .set({
        isActive: false,
        lastFailureAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(memberPushTokens.churchId, churchId),
          eq(memberPushTokens.memberId, memberId),
          eq(memberPushTokens.token, token),
          eq(memberPushTokens.isActive, true),
          isNull(memberPushTokens.deletedAt),
        ),
      );
  }

  async incrementFailureByToken(token: string): Promise<void> {
    await this.database
      .update(memberPushTokens)
      .set({
        failureCount: sql`${memberPushTokens.failureCount} + 1`,
        lastFailureAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(memberPushTokens.token, token),
          isNull(memberPushTokens.deletedAt),
        ),
      );
  }
}
