import type { MemberChurch } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

export interface IMemberChurchRepository extends BaseRepository<MemberChurch> {
  findByMemberId(memberId: string): Promise<MemberChurch[]>;
  findByMemberIdAndChurchId(
    memberId: string,
    churchId: string,
  ): Promise<MemberChurch | null>;
}
