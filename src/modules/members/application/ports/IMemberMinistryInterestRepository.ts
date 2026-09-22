import type { MemberMinistryInterest } from "@/modules/members/domain/entities/MemberMinistryInterest";
import type { BaseRepository } from "@/shared/domain/ports/BaseRepository";

export interface IMemberMinistryInterestRepository
  extends BaseRepository<MemberMinistryInterest> {
  findByMemberAndChurch(
    memberId: string,
    churchId: string,
  ): Promise<MemberMinistryInterest[]>;
  findByChurchId(churchId: string): Promise<MemberMinistryInterest[]>;
  replaceByMemberAndChurch(
    memberId: string,
    churchId: string,
    interests: MemberMinistryInterest[],
  ): Promise<void>;
}
