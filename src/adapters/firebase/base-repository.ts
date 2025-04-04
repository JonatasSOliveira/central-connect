import { BaseModel } from '@/domain/models/base.model'
import { BaseRepository } from '@/domain/ports/out/base-repository'
import { QueryOptions } from '@/domain/types/repositories/query-options'
import { FirebaseProvider } from '@/infra/firebase/provider'
import {
  addDoc,
  collection,
  CollectionReference,
  doc,
  DocumentSnapshot,
  getDoc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
  WithFieldValue,
} from 'firebase/firestore'

export abstract class FirebaseBaseRepository<Model extends BaseModel>
  implements BaseRepository<Model>
{
  protected readonly col: CollectionReference

  constructor(protected readonly collectionName: string) {
    this.col = collection(FirebaseProvider.getFirestore(), this.collectionName)
  }

  public async create(
    data: Partial<Model>,
    createdByUserId?: string,
  ): Promise<string> {
    const formatedData: WithFieldValue<Partial<Model>> = {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      deletedAt: null,
    }

    if (createdByUserId) {
      formatedData.createdByUserId = createdByUserId
    }

    const docRef = await addDoc(this.col, formatedData)
    return docRef.id
  }

  private convertDocToData(doc: DocumentSnapshot): Model {
    const data = doc.data()

    if (!data) {
      throw new Error('Document data is undefined')
    }

    const { createdAt, updatedAt, deletedAt, ...rest } = data

    return {
      ...rest,
      id: doc.id,
      createdAt: createdAt?.toDate(),
      updatedAt: updatedAt?.toDate(),
      deletedAt: deletedAt?.toDate(),
    } as Model
  }

  public async list(options?: QueryOptions<Model>): Promise<Model[]> {
    const conditions = [where('deletedAt', '==', null)]

    if (options?.where) {
      const id = options.where.id
      if (id) {
        const docRef = doc(this.col, id)
        const docData = this.convertDocToData(
          (await getDoc(docRef)) as DocumentSnapshot,
        )
        return [docData]
      }

      for (const [key, value] of Object.entries(options.where)) {
        conditions.push(where(key, '==', value))
      }
    }

    const q = query(this.col, ...conditions)
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => this.convertDocToData(doc))
  }

  public async logicalDelete(
    id: string,
    deletedByUserId?: string,
  ): Promise<void> {
    const docRef = doc(this.col, id)
    await updateDoc(docRef, {
      deletedAt: Timestamp.now(),
      deletedByUserId,
    })
  }

  public async update(
    id: string,
    data: Partial<Model>,
    updatedByUserId?: string,
  ): Promise<void> {
    const docRef = doc(this.col, id)
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
      updatedByUserId,
    })
  }
}
