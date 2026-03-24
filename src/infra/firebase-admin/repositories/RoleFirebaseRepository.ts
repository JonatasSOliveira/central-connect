import type { DocumentData } from "firebase-admin/firestore";
import type { UserRole } from "@/domain/entities/UserRole";
import type { IRoleRepository } from "@/domain/ports/IRoleRepository";
import { roleFromPersistence, roleToPersistence } from "../mappers/roleMapper";
import { BaseFirebaseRepository } from "./BaseFirebaseRepository";

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
