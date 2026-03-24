import type { User } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

export interface IUserRepository extends BaseRepository<User> {
  findByMemberId(memberId: string): Promise<User | null>;
}
