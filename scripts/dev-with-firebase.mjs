import { spawn } from "node:child_process";

const isWindows = process.platform === "win32";
const pnpmCommand = "pnpm";

const localFirebaseEnv = {
  FIREBASE_USE_EMULATORS: "true",
  FIRESTORE_EMULATOR_HOST: "127.0.0.1:8080",
  FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099",
  NEXT_PUBLIC_FIREBASE_USE_EMULATORS: "true",
  NEXT_PUBLIC_FIREBASE_API_KEY: "demo-key",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "localhost",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "central-connect-local",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "central-connect-local.appspot.com",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "000000000000",
  NEXT_PUBLIC_FIREBASE_APP_ID: "demo-app-id",
};

const childEnv = { ...process.env };
for (const [key, value] of Object.entries(localFirebaseEnv)) {
  childEnv[key] ??= value;
}

function spawnManaged(args) {
  return spawn(pnpmCommand, args, {
    env: childEnv,
    shell: isWindows,
    stdio: "inherit",
  });
}

const processes = [
  spawnManaged([
    "exec",
    "firebase",
    "emulators:start",
    "--only",
    "auth,firestore",
    "--project",
    "central-connect-local",
  ]),
  spawnManaged(["exec", "next", "dev"]),
];

function stopAll(signal = "SIGTERM") {
  for (const childProcess of processes) {
    if (!childProcess.killed) {
      childProcess.kill(signal);
    }
  }
}

for (const childProcess of processes) {
  childProcess.on("exit", (code) => {
    if (code && code !== 0) {
      stopAll();
      process.exit(code);
    }
  });
}

process.on("SIGINT", () => {
  stopAll("SIGINT");
  process.exit(0);
});

process.on("SIGTERM", () => {
  stopAll("SIGTERM");
  process.exit(0);
});
