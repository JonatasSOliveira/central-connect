import type { MemberMinistry } from "@/modules/members/domain/entities/MemberMinistry";
import type { BaseRepository } from "@/shared/domain/ports/BaseRepository";

export interface IMemberMinistryRepository
  extends BaseRepository<MemberMinistry> {
  findByMemberId(memberId: string): Promise<MemberMinistry[]>;
  findByChurchId(churchId: string): Promise<MemberMinistry[]>;
  findByMinistryId(ministryId: string): Promise<MemberMinistry[]>;
  findByMemberAndMinistry(
    memberId: string,
    ministryId: string,
  ): Promise<MemberMinistry | null>;
}
