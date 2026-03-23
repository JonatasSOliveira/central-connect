import type { IInviteRepository } from "@/domain/ports/IInviteRepository";
import { InviteFirebaseRepository } from "@/infra/firebase-admin/repositories/InviteFirebaseRepository";

class InviteContainer {
  private static _inviteRepository: IInviteRepository | null = null;

  private constructor() {}

  static get inviteRepository(): IInviteRepository {
    if (!InviteContainer._inviteRepository) {
      InviteContainer._inviteRepository = new InviteFirebaseRepository();
    }
    return InviteContainer._inviteRepository;
  }
}

export const inviteContainer = InviteContainer;
