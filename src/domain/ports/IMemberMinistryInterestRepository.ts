import type { MemberMinistryInterest } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

export interface IMemberMinistryInterestRepository
  extends BaseRepository<MemberMinistryInterest> {
  replaceByMemberAndChurch(
    memberId: string,
    churchId: string,
    interests: MemberMinistryInterest[],
  ): Promise<void>;
}
