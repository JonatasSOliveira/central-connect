import * as fs from "node:fs";
import * as path from "node:path";
import { type App, cert, initializeApp } from "firebase-admin/app";
import { type Firestore, getFirestore } from "firebase-admin/firestore";

const CREDENTIALS_PATH = path.join(
  process.cwd(),
  "FirebaseAdminCredentials.json",
);

function getCredentials() {
  const fileContent = fs.readFileSync(CREDENTIALS_PATH, "utf-8");
  return JSON.parse(fileContent);
}

let firebaseApp: App | null = null;
let firestoreDb: Firestore | null = null;

export function getFirestoreDb(): Firestore {
  if (!firestoreDb) {
    if (!firebaseApp) {
      firebaseApp = initializeApp({
        credential: cert(getCredentials()),
      });
    }
    firestoreDb = getFirestore(firebaseApp);
  }
  return firestoreDb;
}
