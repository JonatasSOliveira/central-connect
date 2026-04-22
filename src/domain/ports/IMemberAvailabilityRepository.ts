import type { MemberAvailability } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

export interface IMemberAvailabilityRepository
  extends BaseRepository<MemberAvailability> {
  findByMemberAndChurch(
    memberId: string,
    churchId: string,
  ): Promise<MemberAvailability | null>;
  findByChurchId(churchId: string): Promise<MemberAvailability[]>;
  upsert(entity: MemberAvailability): Promise<MemberAvailability>;
  deleteByMemberAndChurch(memberId: string, churchId: string): Promise<void>;
}
