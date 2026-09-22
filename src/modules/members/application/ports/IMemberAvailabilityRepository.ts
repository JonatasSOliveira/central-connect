import type { MemberAvailability } from "@/modules/members/domain/entities/MemberAvailability";
import type { BaseRepository } from "@/shared/domain/ports/BaseRepository";

export interface IMemberAvailabilityRepository
  extends BaseRepository<MemberAvailability> {
  findByMemberId(memberId: string): Promise<MemberAvailability | null>;
  findByMemberIds(memberIds: string[]): Promise<MemberAvailability[]>;
  upsert(entity: MemberAvailability): Promise<MemberAvailability>;
  deleteByMemberId(memberId: string): Promise<void>;
}
