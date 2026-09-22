import type { DocumentData } from "firebase-admin/firestore";
import { BaseFirebaseRepository } from "@/infra/firebase-admin/repositories/BaseFirebaseRepository";
import type { IMemberMinistryRoleRepository } from "@/modules/members/application/ports/IMemberMinistryRoleRepository";
import type { MemberMinistryRole } from "@/modules/members/domain/entities/MemberMinistryRole";
import {
  memberMinistryRoleFromPersistence,
  memberMinistryRoleToPersistence,
} from "../../mappers/memberMinistryRoleMapper";

export class MemberMinistryRoleFirebaseRepository
  extends BaseFirebaseRepository<MemberMinistryRole>
  implements IMemberMinistryRoleRepository
{
  constructor() {
    super("memberMinistryRoles");
  }

  protected toEntity(data: DocumentData, id: string): MemberMinistryRole {
    return memberMinistryRoleFromPersistence(data, id);
  }

  protected toFirestoreData(entity: MemberMinistryRole): DocumentData {
    return memberMinistryRoleToPersistence(entity);
  }

  async findByMemberAndMinistry(
    memberId: string,
    ministryId: string,
  ): Promise<MemberMinistryRole[]> {
    const snapshot = await this.collection
      .where("memberId", "==", memberId)
      .where("ministryId", "==", ministryId)
      .get();
    return snapshot.docs.map((doc) =>
      this.toEntity(doc.data() as DocumentData, doc.id),
    );
  }

  async findByMemberId(memberId: string): Promise<MemberMinistryRole[]> {
    const snapshot = await this.collection
      .where("memberId", "==", memberId)
      .get();
    return snapshot.docs.map((doc) =>
      this.toEntity(doc.data() as DocumentData, doc.id),
    );
  }

  async findByMinistryRoleId(
    ministryRoleId: string,
  ): Promise<MemberMinistryRole[]> {
    const snapshot = await this.collection
      .where("ministryRoleId", "==", ministryRoleId)
      .get();
    return snapshot.docs.map((doc) =>
      this.toEntity(doc.data() as DocumentData, doc.id),
    );
  }

  async findByChurchMemberAndMinistry(
    churchId: string,
    memberId: string,
    ministryId: string,
  ): Promise<MemberMinistryRole[]> {
    const snapshot = await this.collection
      .where("churchId", "==", churchId)
      .where("memberId", "==", memberId)
      .where("ministryId", "==", ministryId)
      .get();
    return snapshot.docs.map((doc) =>
      this.toEntity(doc.data() as DocumentData, doc.id),
    );
  }
}
