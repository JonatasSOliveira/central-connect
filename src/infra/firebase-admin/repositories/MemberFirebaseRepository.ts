import type { DocumentData } from "firebase-admin/firestore";
import type { Member } from "@/domain/entities/Member";
import type { IMemberRepository } from "@/domain/ports/IMemberRepository";
import {
  memberFromPersistence,
  memberToPersistence,
} from "../mappers/memberMapper";
import { BaseFirebaseRepository } from "./BaseFirebaseRepository";

export class MemberFirebaseRepository
  extends BaseFirebaseRepository<Member>
  implements IMemberRepository
{
  constructor() {
    super("members");
  }

  protected toEntity(data: DocumentData, id: string): Member {
    return memberFromPersistence(data, id);
  }

  protected toFirestoreData(entity: Member): DocumentData {
    return memberToPersistence(entity);
  }

  async findByEmail(email: string): Promise<Member | null> {
    if (!email) return null;
    const snapshot = await this.buildActiveQuery()
      .where("email", "==", email)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return this.toEntity(doc.data() as DocumentData, doc.id);
  }

  async findBySearch(search: string): Promise<Member[]> {
    if (!search?.trim()) {
      return this.findAll();
    }

    const searchLower = search.toLowerCase().trim();
    const searchUpper = searchLower.replace(/.$/, (c) =>
      String.fromCharCode(c.charCodeAt(0) + 1),
    );

    const snapshot = await this.buildActiveQuery()
      .orderBy("fullName")
      .startAt(searchLower)
      .endAt(searchUpper)
      .get();

    const members = snapshot.docs.map((doc) =>
      this.toEntity(doc.data() as DocumentData, doc.id),
    );

    return members.filter(
      (m) =>
        m.fullName.toLowerCase().startsWith(searchLower) ||
        m.fullName.toLowerCase().includes(searchLower),
    );
  }

  async findByIds(ids: string[]): Promise<Member[]> {
    if (ids.length === 0) return [];

    const members = await Promise.all(ids.map((id) => this.findById(id)));

    return members.filter((m): m is Member => m !== null);
  }
}
