import type { Invite } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

export interface IInviteRepository extends BaseRepository<Invite> {
  findByEmail(email: string): Promise<Invite | null>;
  findByEmailAndChurchId(
    email: string,
    churchId: string,
  ): Promise<Invite | null>;
  markAsUsed(inviteId: string): Promise<void>;
}
