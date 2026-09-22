import type { DocumentData } from "firebase-admin/firestore";
import { BaseFirebaseRepository } from "@/infra/firebase-admin/repositories/BaseFirebaseRepository";
import type { ILegalConsentRepository } from "@/modules/identity/application/ports/ILegalConsentRepository";
import type { LegalConsent } from "@/modules/identity/domain/entities/LegalConsent";
import {
  legalConsentFromPersistence,
  legalConsentToPersistence,
} from "@/modules/identity/infrastructure/mappers/legalConsentMapper";

export class LegalConsentFirebaseRepository
  extends BaseFirebaseRepository<LegalConsent>
  implements ILegalConsentRepository
{
  constructor() {
    super("legalConsents");
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
