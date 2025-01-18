import { initializeApp, FirebaseApp } from 'firebase/app'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getAuth, Auth } from 'firebase/auth'
import { firebaseConfig } from './config'

export class FirebaseProvider {
  private static firebaseApp: FirebaseApp = initializeApp(firebaseConfig)
  private static firestore: Firestore = getFirestore(
    FirebaseProvider.firebaseApp,
  )

  private static auth: Auth = getAuth(FirebaseProvider.firebaseApp)

  public static getFirestore(): Firestore {
    return this.firestore
  }

  public static getAuth(): Auth {
    return this.auth
  }
}
