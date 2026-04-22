import type { DocumentData } from "firebase-admin/firestore";
import type { ScaleGenerationJob } from "@/domain/entities/ScaleGenerationJob";
import type { IScaleGenerationJobRepository } from "@/domain/ports/IScaleGenerationJobRepository";
import {
  scaleGenerationJobFromPersistence,
  scaleGenerationJobToPersistence,
} from "../mappers/scaleGenerationJobMapper";
import { BaseFirebaseRepository } from "./BaseFirebaseRepository";

const LEASE_TTL_MS = 5 * 60 * 1000;

export class ScaleGenerationJobFirebaseRepository
  extends BaseFirebaseRepository<ScaleGenerationJob>
  implements IScaleGenerationJobRepository
{
  constructor() {
    super("scaleGenerationJobs");
  }

  protected toEntity(data: DocumentData, id: string): ScaleGenerationJob {
    return scaleGenerationJobFromPersistence(data, id);
  }

  protected toFirestoreData(entity: ScaleGenerationJob): DocumentData {
    return scaleGenerationJobToPersistence(entity);
  }

  async findByChurchId(churchId: string): Promise<ScaleGenerationJob[]> {
    const snapshot = await this.collection
      .where("churchId", "==", churchId)
      .where("deletedAt", "==", null)
      .get();

    return snapshot.docs.map((doc) => this.toEntity(doc.data(), doc.id));
  }

  async findPendingDue(churchId: string, before: Date): Promise<ScaleGenerationJob[]> {
    const snapshot = await this.collection
      .where("churchId", "==", churchId)
      .where("deletedAt", "==", null)
      .where("status", "in", ["pending"])
      .where("scheduledFor", "<=", before)
      .get();

    return snapshot.docs.map((doc) => this.toEntity(doc.data(), doc.id));
  }

  async findByServiceId(serviceId: string): Promise<ScaleGenerationJob | null> {
    const snapshot = await this.collection
      .where("serviceId", "==", serviceId)
      .where("deletedAt", "==", null)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return this.toEntity(doc.data(), doc.id);
  }

  async acquireLease(jobId: string, ttlMinutes: number = 5): Promise<boolean> {
    const leaseExpiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
    const docRef = this.collection.doc(jobId);

    const doc = await docRef.get();
    if (!doc.exists) return false;

    const data = doc.data() as DocumentData;
    const currentLeaseExpiresAt = data.leaseExpiresAt;

    if (currentLeaseExpiresAt && new Date(currentLeaseExpiresAt) > new Date()) {
      return false;
    }

    await docRef.set(
      {
        leaseExpiresAt: leaseExpiresAt,
      },
      { merge: true },
    );

    return true;
  }

  async releaseLease(jobId: string): Promise<void> {
    await this.collection.doc(jobId).set(
      {
        leaseExpiresAt: null,
      },
      { merge: true },
    );
  }
}