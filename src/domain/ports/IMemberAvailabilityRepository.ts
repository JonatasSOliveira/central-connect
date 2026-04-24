import type { MemberAvailability } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

export interface IMemberAvailabilityRepository
  extends BaseRepository<MemberAvailability> {
  findByMemberId(memberId: string): Promise<MemberAvailability | null>;
  findByMemberIds(memberIds: string[]): Promise<MemberAvailability[]>;
  upsert(entity: MemberAvailability): Promise<MemberAvailability>;
  deleteByMemberId(memberId: string): Promise<void>;
}
