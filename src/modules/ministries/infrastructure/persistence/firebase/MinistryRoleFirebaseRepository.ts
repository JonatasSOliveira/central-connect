import type { DocumentData } from "firebase-admin/firestore";
import { BaseFirebaseRepository } from "@/infra/firebase-admin/repositories/BaseFirebaseRepository";
import type { IMinistryRoleRepository } from "@/modules/ministries/application/ports/IMinistryRoleRepository";
import type { MinistryRole } from "@/modules/ministries/domain/entities/MinistryRole";
import {
  ministryRoleFromPersistence,
  ministryRoleToPersistence,
} from "../../mappers/ministryRoleMapper";

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
    const snapshot = await this.buildActiveQuery()
      .where("ministryId", "==", ministryId)
      .get();
    return snapshot.docs.map((doc) =>
      this.toEntity(doc.data() as DocumentData, doc.id),
    );
  }
}
