import { and, desc, eq, isNull } from "drizzle-orm";

import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
import { legalConsents } from "@/infra/database/drizzle/schema";
import type { ILegalConsentRepository } from "@/modules/identity/application/ports/ILegalConsentRepository";
import { LegalConsent } from "@/modules/identity/domain/entities/LegalConsent";

function toEntity(row: typeof legalConsents.$inferSelect): LegalConsent {
  return new LegalConsent({
    id: row.id,
    memberId: row.memberId,
    userId: row.userId,
    churchId: row.churchId,
    termsVersion: row.termsVersion,
    privacyPolicyVersion: row.privacyPolicyVersion,
    acceptedAt: row.acceptedAt,
    ipAddress: row.ipAddress,
    userAgent: row.userAgent,
    source: row.source as "self-signup",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  });
}

export class LegalConsentDrizzleRepository implements ILegalConsentRepository {
  constructor(private readonly database: DatabaseExecutor) {}

  async create(entity: LegalConsent): Promise<LegalConsent> {
    const [row] = await this.database
      .insert(legalConsents)
      .values({
        id: entity.id,
        memberId: entity.memberId,
        userId: entity.userId,
        churchId: entity.churchId,
        termsVersion: entity.termsVersion,
        privacyPolicyVersion: entity.privacyPolicyVersion,
        acceptedAt: entity.acceptedAt,
        ipAddress: entity.ipAddress,
        userAgent: entity.userAgent,
        source: entity.source,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        deletedAt: entity.deletedAt,
      })
      .returning();

    return toEntity(row);
  }

  async findLatestByMemberAndChurch(
    memberId: string,
    churchId: string,
  ): Promise<LegalConsent | null> {
    const [row] = await this.database
      .select()
      .from(legalConsents)
      .where(
        and(
          eq(legalConsents.memberId, memberId),
          eq(legalConsents.churchId, churchId),
          isNull(legalConsents.deletedAt),
        ),
      )
      .orderBy(desc(legalConsents.acceptedAt))
      .limit(1);

    return row ? toEntity(row) : null;
  }
}
