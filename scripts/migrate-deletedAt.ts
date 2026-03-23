import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const collections = ["members", "churches", "roles"];

async function migrateDeletedAtField() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }

  const db = getFirestore();

  console.log(
    "🚀 Starting migration: adding deletedAt field to all collections\n",
  );

  for (const collectionName of collections) {
    console.log(`📦 Processing collection: ${collectionName}`);
    const collection = db.collection(collectionName);

    let processed = 0;
    let updated = 0;

    const snapshot = await collection.get();

    for (const doc of snapshot.docs) {
      processed++;
      const data = doc.data();

      if (data.deletedAt === undefined) {
        await doc.ref.update({ deletedAt: null });
        updated++;
        console.log(`   ✅ Updated: ${doc.id}`);
      }
    }

    console.log(
      `   📊 ${collectionName}: processed ${processed} docs, updated ${updated} docs\n`,
    );
  }

  console.log("✅ Migration completed!");
}

migrateDeletedAtField().catch(console.error);
