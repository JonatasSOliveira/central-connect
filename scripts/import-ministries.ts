import * as fs from "fs";
import * as readline from "readline";
import { getFirestoreDb } from "./_firebase-admin.ts";

function parseCSV(content: string): string[][] {
  const lines = content.split("\n");
  const result: string[][] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    const row: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        row.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    row.push(current.trim());
    result.push(row);
  }

  return result;
}

async function getMemberIdByName(
  db: FirebaseFirestore.Firestore,
  fullName: string,
): Promise<string | null> {
  if (!fullName || fullName.trim() === "") return null;

  const cleanName = fullName.trim().toLowerCase();

  const snapshot = await db
    .collection("members")
    .where("deletedAt", "==", null)
    .get();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.fullName?.toLowerCase().includes(cleanName)) {
      return doc.id;
    }
  }

  return null;
}

async function createMinistry(
  db: FirebaseFirestore.Firestore,
  churchId: string,
  name: string,
  liderId: string | null,
  minMembers: number,
  idealMembers: number,
  notes: string,
): Promise<string> {
  const now = new Date();
  const ministryId = crypto.randomUUID();

  await db
    .collection("ministries")
    .doc(ministryId)
    .set({
      churchId,
      name,
      liderId,
      minMembersPerService: minMembers,
      idealMembersPerService: idealMembers,
      notes: notes || null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });

  return ministryId;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(
      "Uso: npx tsx scripts/import-ministries.ts <churchId> <caminho-do-csv>",
    );
    console.log("");
    console.log(
      "Exemplo: npx tsx scripts/import-ministries.ts abc123 ministries.csv",
    );
    process.exit(1);
  }

  const churchId = args[0];
  const csvPath = args[1];

  if (!fs.existsSync(csvPath)) {
    console.error(`Arquivo não encontrado: ${csvPath}`);
    process.exit(1);
  }

  const db = getFirestoreDb();

  const rl = readline.createInterface({
    input: fs.createReadStream(csvPath),
    crlfDelay: Infinity,
  });

  const content: string[] = [];
  for await (const line of rl) {
    content.push(line);
  }

  const allRows = parseCSV(content.join("\n"));

  if (allRows.length < 2) {
    console.error(
      "CSV precisa ter pelo menos um cabeçalho e uma linha de dados",
    );
    process.exit(1);
  }

  const header = allRows[0].map((h) => h.toUpperCase().trim());

  const colMap = {
    name: header.findIndex(
      (h) => h.includes("MINISTÉRIO") || h.includes("MINISTERIO"),
    ),
    lider: header.findIndex((h) => h.includes("LÍDER") || h.includes("LIDER")),
    minMembers: header.findIndex((h) => h.includes("MÍN") || h.includes("MIN")),
    idealMembers: header.findIndex((h) => h.includes("IDEAL")),
    notes: header.findIndex((h) => h.includes("OBS") || h.includes("OBSERVA")),
  };

  console.log("Colunas detectadas:");
  console.log(`  - Nome: ${colMap.name >= 0 ? "✓" : "✗"}`);
  console.log(`  - Líder: ${colMap.lider >= 0 ? "✓" : "✗"} (opcional)`);
  console.log(`  - Mín.: ${colMap.minMembers >= 0 ? "✓" : "✗"}`);
  console.log(`  - Ideal: ${colMap.idealMembers >= 0 ? "✓" : "✗"}`);
  console.log(`  - Obs: ${colMap.notes >= 0 ? "✓" : "✗"} (opcional)`);
  console.log("");

  if (colMap.name < 0) {
    console.error("Coluna MINISTÉRIO não encontrada!");
    process.exit(1);
  }

  const dataRows = allRows.slice(1);

  console.log(`Igreja ID: ${churchId}`);
  console.log(
    `Ministérios encontrados: ${dataRows.filter((r) => r[colMap.name]?.trim()).length}`,
  );
  console.log("");

  const rlConfirm = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const confirm = await new Promise<string>((resolve) => {
    rlConfirm.question("Deseja continuar? (s/n): ", resolve);
  });
  rlConfirm.close();

  if (confirm.toLowerCase() !== "s") {
    console.log("Operação cancelada.");
    process.exit(0);
  }

  console.log("\nIniciando importação...\n");

  let imported = 0;
  let skipped = 0;
  const leadersNotFound: string[] = [];

  for (const row of dataRows) {
    const name = row[colMap.name]?.trim();

    if (!name) {
      skipped++;
      continue;
    }

    const liderName = colMap.lider >= 0 ? row[colMap.lider]?.trim() : "";
    const minMembers =
      colMap.minMembers >= 0 ? parseInt(row[colMap.minMembers]) || 1 : 1;
    const idealMembers =
      colMap.idealMembers >= 0 ? parseInt(row[colMap.idealMembers]) || 2 : 2;
    const notes = colMap.notes >= 0 ? row[colMap.notes]?.trim() : "";

    let liderId: string | null = null;

    if (liderName) {
      liderId = await getMemberIdByName(db, liderName);
      if (!liderId) {
        leadersNotFound.push(liderName);
      }
    }

    const ministryId = await createMinistry(
      db,
      churchId,
      name,
      liderId,
      minMembers,
      idealMembers,
      notes,
    );

    console.log(`  ✓ Ministério "${name}" criado (ID: ${ministryId})`);
    imported++;
  }

  console.log("\n═══════════════════════════════════════");
  console.log("             RESUMO                  ");
  console.log("═══════════════════════════════════════");
  console.log(`  Importados: ${imported}`);
  console.log(`  Ignorados (sem nome): ${skipped}`);

  if (leadersNotFound.length > 0) {
    console.log("\n  Líderes não encontrados:");
    for (const leader of [...new Set(leadersNotFound)]) {
      console.log(`    - ${leader}`);
    }
  }
  console.log("═══════════════════════════════════════\n");
}

main().catch(console.error);
