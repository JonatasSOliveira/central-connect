import type { DocumentData } from "firebase-admin/firestore";
import type { MemberMinistryRole } from "@/domain/entities/MemberMinistryRole";
import type { IMemberMinistryRoleRepository } from "@/domain/ports/IMemberMinistryRoleRepository";
import {
  memberMinistryRoleFromPersistence,
  memberMinistryRoleToPersistence,
} from "../mappers/memberMinistryRoleMapper";
import { BaseFirebaseRepository } from "./BaseFirebaseRepository";

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
