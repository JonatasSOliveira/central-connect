import type { Member } from "@/modules/members/domain/entities/Member";
import type { BaseRepository } from "@/shared/domain/ports/BaseRepository";

export interface IMemberRepository extends BaseRepository<Member> {
  findByEmail(email: string): Promise<Member | null>;
  findByNormalizedPhone(phoneNormalized: string): Promise<Member | null>;
  findBySearch(search: string): Promise<Member[]>;
  findByIds(ids: string[]): Promise<Member[]>;
}
