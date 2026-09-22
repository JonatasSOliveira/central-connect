import type { DocumentData } from "firebase-admin/firestore";
import { BaseFirebaseRepository } from "@/infra/firebase-admin/repositories/BaseFirebaseRepository";
import type { IUserRepository } from "@/modules/identity/application/ports/IUserRepository";
import type { User } from "@/modules/identity/domain/entities/User";
import {
  userFromPersistence,
  userToPersistence,
} from "@/modules/identity/infrastructure/mappers/userMapper";

export class UserFirebaseRepository
  extends BaseFirebaseRepository<User>
  implements IUserRepository
{
  constructor() {
    super("users");
  }

  protected toEntity(data: DocumentData, id: string): User {
    return userFromPersistence(data, id);
  }

  protected toFirestoreData(entity: User): DocumentData {
    return userToPersistence(entity);
  }

  async findByMemberId(memberId: string): Promise<User | null> {
    const snapshot = await this.collection
      .where("memberId", "==", memberId)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return this.toEntity(doc.data() as DocumentData, doc.id);
  }
}
