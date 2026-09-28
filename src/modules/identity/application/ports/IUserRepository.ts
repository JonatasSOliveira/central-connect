import type { User } from "@/modules/identity/domain/entities/User";
import type { BaseRepository } from "@/shared/domain/ports/BaseRepository";

export interface IUserRepository extends BaseRepository<User> {
  findByFirebaseUid(firebaseUid: string): Promise<User | null>;
  findByMemberId(memberId: string): Promise<User | null>;
}
