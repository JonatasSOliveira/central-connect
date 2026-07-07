import type { MemberMinistry } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

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
