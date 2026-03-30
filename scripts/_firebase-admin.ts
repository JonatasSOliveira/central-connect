import * as fs from "node:fs";
import * as path from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function loadEnvFile(envPath: string): void {
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, "utf-8");
  const lines = content.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;

    const key = trimmed.substring(0, eqIndex).trim();
    let value = trimmed.substring(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(process.cwd(), ".env.local"));
loadEnvFile(path.join(process.cwd(), ".env"));

let db: FirebaseFirestore.Firestore | null = null;

export function getFirestoreDb(): FirebaseFirestore.Firestore {
  if (db) return db;

  if (getApps().length === 0) {
    const credentialsJson = process.env.FIREBASE_CREDENTIALS;

    if (credentialsJson) {
      initializeApp({
        credential: cert(JSON.parse(credentialsJson)),
      });
    } else {
      const credentialsPath = path.join(process.cwd(), "credentials.json");

      if (fs.existsSync(credentialsPath)) {
        const serviceAccount = JSON.parse(
          fs.readFileSync(credentialsPath, "utf-8"),
        );
        initializeApp({
          credential: cert(serviceAccount),
        });
      } else {
        throw new Error(
          "Nenhuma credencial encontrada. Configure FIREBASE_CREDENTIALS ou tenha credentials.json na raiz.",
        );
      }
    }
  }

  db = getFirestore();
  return db;
}
