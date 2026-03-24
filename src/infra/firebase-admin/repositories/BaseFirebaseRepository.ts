import type {
  CollectionReference,
  DocumentData,
  Query,
} from "firebase-admin/firestore";
import type { BaseEntity } from "@/domain/entities/BaseEntity";
import { getFirestoreDb } from "../firebaseConfig";

export abstract class BaseFirebaseRepository<Entity extends BaseEntity> {
  protected readonly collection: CollectionReference<DocumentData>;

  constructor(collectionName: string) {
    this.collection = getFirestoreDb().collection(collectionName);
  }

  protected abstract toEntity(data: DocumentData, id: string): Entity;
  protected abstract toFirestoreData(entity: Entity): DocumentData;

  protected buildActiveQuery(): Query<DocumentData> {
    return this.collection.where("deletedAt", "==", null);
  }

  async findById(id: string): Promise<Entity | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data() as DocumentData;
    if (data.deletedAt) return null;
    return this.toEntity(data, doc.id);
  }

  async findAll(): Promise<Entity[]> {
    const snapshot = await this.buildActiveQuery().get();
    return snapshot.docs.map((doc) =>
      this.toEntity(doc.data() as DocumentData, doc.id),
    );
  }

  async create(entity: Entity): Promise<Entity> {
    const data = this.toFirestoreData(entity);
    const docRef = await this.collection.add(data);
    const doc = await docRef.get();
    return this.toEntity(doc.data() as DocumentData, doc.id);
  }

  async update(entity: Entity): Promise<Entity> {
    const data = this.toFirestoreData(entity);
    await this.collection.doc(entity.id).set(data, { merge: true });
    const doc = await this.collection.doc(entity.id).get();
    return this.toEntity(doc.data() as DocumentData, doc.id);
  }

  async delete(id: string): Promise<void> {
    await this.collection
      .doc(id)
      .set({ deletedAt: new Date() }, { merge: true });
  }
}
