import type { MemberChurch } from "@/modules/members/domain/entities/MemberChurch";
import type { BaseRepository } from "@/shared/domain/ports/BaseRepository";

export interface IMemberChurchRepository extends BaseRepository<MemberChurch> {
  findByMemberId(memberId: string): Promise<MemberChurch[]>;
  findByMemberIdAndChurchId(
    memberId: string,
    churchId: string,
  ): Promise<MemberChurch | null>;
  findByChurchId(churchId: string): Promise<MemberChurch[]>;
}
