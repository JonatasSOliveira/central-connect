import type { User } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

export interface IUserRepository extends BaseRepository<User> {
  findByEmail(email: string): Promise<User | null>;
}
