import type { MemberPushToken } from "@/modules/notifications/domain/entities/MemberPushToken";
import type { BaseRepository } from "@/shared/domain/ports/BaseRepository";

export interface IMemberPushTokenRepository
  extends BaseRepository<MemberPushToken> {
  findByMemberAndToken(
    churchId: string,
    memberId: string,
    token: string,
  ): Promise<MemberPushToken | null>;
  findActiveByChurchAndMemberIds(
    churchId: string,
    memberIds: string[],
  ): Promise<MemberPushToken[]>;
  deactivateByToken(token: string): Promise<void>;
  deactivateByTokenForMember(
    churchId: string,
    memberId: string,
    token: string,
  ): Promise<void>;
  incrementFailureByToken(token: string): Promise<void>;
}
