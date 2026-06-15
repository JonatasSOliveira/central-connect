import type { MemberMinistryInterest } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

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
