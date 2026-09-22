import type { DocumentData } from "firebase-admin/firestore";
import { BaseFirebaseRepository } from "@/infra/firebase-admin/repositories/BaseFirebaseRepository";
import type { IRoleRepository } from "@/modules/roles/application/ports/IRoleRepository";
import type { UserRole } from "@/modules/roles/domain/entities/UserRole";
import {
  roleFromPersistence,
  roleToPersistence,
} from "@/modules/roles/infrastructure/mappers/roleMapper";

export class RoleFirebaseRepository
  extends BaseFirebaseRepository<UserRole>
  implements IRoleRepository
{
  constructor() {
    super("roles");
  }

  protected toEntity(data: DocumentData, id: string): UserRole {
    return roleFromPersistence(data, id);
  }

  protected toFirestoreData(entity: UserRole): DocumentData {
    return roleToPersistence(entity);
  }

  async findByName(name: string): Promise<UserRole | null> {
    const snapshot = await this.buildActiveQuery()
      .where("name", "==", name)
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return this.toEntity(doc.data() as DocumentData, doc.id);
  }
}
