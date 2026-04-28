import type { DocumentData } from "firebase-admin/firestore";
import type { MemberPushToken } from "@/domain/entities/MemberPushToken";
import type { IMemberPushTokenRepository } from "@/domain/ports/IMemberPushTokenRepository";
import {
  memberPushTokenFromPersistence,
  memberPushTokenToPersistence,
} from "../mappers/memberPushTokenMapper";
import { BaseFirebaseRepository } from "./BaseFirebaseRepository";

export class MemberPushTokenFirebaseRepository
  extends BaseFirebaseRepository<MemberPushToken>
  implements IMemberPushTokenRepository
{
  private static readonly IN_QUERY_LIMIT = 10;

  constructor() {
    super("member_push_tokens");
  }

  protected toEntity(data: DocumentData, id: string): MemberPushToken {
    return memberPushTokenFromPersistence(data, id);
  }

  protected toFirestoreData(entity: MemberPushToken): DocumentData {
    return memberPushTokenToPersistence(entity);
  }

  async findByMemberAndToken(
    churchId: string,
    memberId: string,
    token: string,
  ): Promise<MemberPushToken | null> {
    const snapshot = await this.buildActiveQuery()
      .where("churchId", "==", churchId)
      .where("memberId", "==", memberId)
      .where("token", "==", token)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return this.toEntity(doc.data() as DocumentData, doc.id);
  }

  async findActiveByChurchAndMemberIds(
    churchId: string,
    memberIds: string[],
  ): Promise<MemberPushToken[]> {
    if (memberIds.length === 0) {
      return [];
    }

    const uniqueMemberIds = Array.from(new Set(memberIds));
    const chunks: string[][] = [];

    for (
      let i = 0;
      i < uniqueMemberIds.length;
      i += MemberPushTokenFirebaseRepository.IN_QUERY_LIMIT
    ) {
      chunks.push(
        uniqueMemberIds.slice(
          i,
          i + MemberPushTokenFirebaseRepository.IN_QUERY_LIMIT,
        ),
      );
    }

    const snapshots = await Promise.all(
      chunks.map((chunk) =>
        this.buildActiveQuery()
          .where("churchId", "==", churchId)
          .where("memberId", "in", chunk)
          .where("isActive", "==", true)
          .get(),
      ),
    );

    return snapshots.flatMap((snapshot) =>
      snapshot.docs.map((doc) => this.toEntity(doc.data() as DocumentData, doc.id)),
    );
  }

  async deactivateByToken(token: string): Promise<void> {
    const snapshot = await this.buildActiveQuery()
      .where("token", "==", token)
      .where("isActive", "==", true)
      .get();

    if (snapshot.empty) {
      return;
    }

    const batch = this.collection.firestore.batch();

    for (const doc of snapshot.docs) {
      batch.set(
        doc.ref,
        {
          isActive: false,
          updatedAt: new Date(),
          lastFailureAt: new Date(),
        },
        { merge: true },
      );
    }

    await batch.commit();
  }

  async deactivateByTokenForMember(
    churchId: string,
    memberId: string,
    token: string,
  ): Promise<void> {
    const snapshot = await this.buildActiveQuery()
      .where("churchId", "==", churchId)
      .where("memberId", "==", memberId)
      .where("token", "==", token)
      .where("isActive", "==", true)
      .get();

    if (snapshot.empty) {
      return;
    }

    const batch = this.collection.firestore.batch();

    for (const doc of snapshot.docs) {
      batch.set(
        doc.ref,
        {
          isActive: false,
          updatedAt: new Date(),
          lastFailureAt: new Date(),
        },
        { merge: true },
      );
    }

    await batch.commit();
  }

  async incrementFailureByToken(token: string): Promise<void> {
    const snapshot = await this.buildActiveQuery().where("token", "==", token).get();

    if (snapshot.empty) {
      return;
    }

    const batch = this.collection.firestore.batch();

    for (const doc of snapshot.docs) {
      const data = doc.data() as DocumentData;
      const nextCount = Number(data.failureCount ?? 0) + 1;

      batch.set(
        doc.ref,
        {
          failureCount: nextCount,
          updatedAt: new Date(),
          lastFailureAt: new Date(),
        },
        { merge: true },
      );
    }

    await batch.commit();
  }
}
