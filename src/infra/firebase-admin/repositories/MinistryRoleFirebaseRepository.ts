import type { DocumentData } from "firebase-admin/firestore";
import type { MinistryRole } from "@/domain/entities/MinistryRole";
import type { IMinistryRoleRepository } from "@/domain/ports/IMinistryRoleRepository";
import {
  ministryRoleFromPersistence,
  ministryRoleToPersistence,
} from "../mappers/ministryRoleMapper";
import { BaseFirebaseRepository } from "./BaseFirebaseRepository";

export class MinistryRoleFirebaseRepository
  extends BaseFirebaseRepository<MinistryRole>
  implements IMinistryRoleRepository
{
  constructor() {
    super("ministryRoles");
  }

  protected toEntity(data: DocumentData, id: string): MinistryRole {
    return ministryRoleFromPersistence(data, id);
  }

  protected toFirestoreData(entity: MinistryRole): DocumentData {
    return ministryRoleToPersistence(entity);
  }

  async findByMinistryId(ministryId: string): Promise<MinistryRole[]> {
    const snapshot = await this.collection
      .where("ministryId", "==", ministryId)
      .get();
    return snapshot.docs.map((doc) =>
      this.toEntity(doc.data() as DocumentData, doc.id),
    );
  }

  async findByChurchId(churchId: string): Promise<MinistryRole[]> {
    const snapshot = await this.collection
      .where("churchId", "==", churchId)
      .get();
    return snapshot.docs.map((doc) =>
      this.toEntity(doc.data() as DocumentData, doc.id),
    );
  }
}
