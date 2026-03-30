import type { Member } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

export interface IMemberRepository extends BaseRepository<Member> {
  findByEmail(email: string): Promise<Member | null>;
  findBySearch(search: string): Promise<Member[]>;
  findByIds(ids: string[]): Promise<Member[]>;
}
