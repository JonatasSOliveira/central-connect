import * as fs from "node:fs";
import * as path from "node:path";
import {
  type App,
  cert,
  getApp,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import { type Firestore, getFirestore } from "firebase-admin/firestore";

const CREDENTIALS_PATH = path.join(
  process.cwd(),
  "FirebaseAdminCredentials.json",
);

function getCredentials() {
  const fileContent = fs.readFileSync(CREDENTIALS_PATH, "utf-8");
  return JSON.parse(fileContent);
}

let firebaseApp: App;
let firestoreDb: Firestore;

export function getFirebaseApp(): App {
  if (getApps().length === 0) {
    firebaseApp = initializeApp({
      credential: cert(getCredentials()),
    });
  } else {
    firebaseApp = getApp();
  }

  return firebaseApp;
}

export function getFirestoreDb(): Firestore {
  if (!firestoreDb) {
    firestoreDb = getFirestore(getFirebaseApp());
  }
  return firestoreDb;
}
