import type { MemberMinistryRole } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

export interface IMemberMinistryRoleRepository
  extends BaseRepository<MemberMinistryRole> {
  findByMemberAndMinistry(
    memberId: string,
    ministryId: string,
  ): Promise<MemberMinistryRole[]>;
  findByMemberId(memberId: string): Promise<MemberMinistryRole[]>;
  findByMinistryRoleId(ministryRoleId: string): Promise<MemberMinistryRole[]>;
  findByChurchMemberAndMinistry(
    churchId: string,
    memberId: string,
    ministryId: string,
  ): Promise<MemberMinistryRole[]>;
}
