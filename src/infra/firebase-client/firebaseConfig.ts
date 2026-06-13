import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import { type Auth, connectAuthEmulator, getAuth } from "firebase/auth";

function resolveAuthDomain(): string | undefined {
  return process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: resolveAuthDomain(),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;
let authEmulatorConnected = false;

function shouldUseEmulators(): boolean {
  return process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATORS === "true";
}

export function getFirebaseClientApp(): FirebaseApp {
  if (!firebaseApp) {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      firebaseApp = existingApps[0];
    } else {
      firebaseApp = initializeApp(firebaseConfig);
    }
  }
  return firebaseApp;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseClientApp());
    if (shouldUseEmulators() && !authEmulatorConnected) {
      connectAuthEmulator(auth, "http://127.0.0.1:9099", {
        disableWarnings: true,
      });
      authEmulatorConnected = true;
    }
  }
  return auth;
}
