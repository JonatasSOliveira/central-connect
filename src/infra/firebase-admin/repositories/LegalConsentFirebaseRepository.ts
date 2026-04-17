import type { DocumentData } from "firebase-admin/firestore";
import type { LegalConsent } from "@/domain/entities/LegalConsent";
import type { ILegalConsentRepository } from "@/domain/ports/ILegalConsentRepository";
import {
  legalConsentFromPersistence,
  legalConsentToPersistence,
} from "../mappers/legalConsentMapper";
import { BaseFirebaseRepository } from "./BaseFirebaseRepository";

export class LegalConsentFirebaseRepository
  extends BaseFirebaseRepository<LegalConsent>
  implements ILegalConsentRepository
{
  constructor() {
    super("legal_consents");
  }

  protected toEntity(data: DocumentData, id: string): LegalConsent {
    return legalConsentFromPersistence(data, id);
  }

  protected toFirestoreData(entity: LegalConsent): DocumentData {
    return legalConsentToPersistence(entity);
  }

  async findLatestByMemberAndChurch(
    memberId: string,
    churchId: string,
  ): Promise<LegalConsent | null> {
    const snapshot = await this.buildActiveQuery()
      .where("memberId", "==", memberId)
      .where("churchId", "==", churchId)
      .orderBy("acceptedAt", "desc")
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return this.toEntity(doc.data() as DocumentData, doc.id);
  }
}
