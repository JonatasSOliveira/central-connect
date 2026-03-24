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

function getCredentials() {
  const raw = process.env.FIREBASE_CREDENTIALS;
  if (!raw) throw new Error("FIREBASE_CREDENTIALS não definida");
  return JSON.parse(raw);
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
