import * as fs from "fs";
import * as readline from "readline";
import { getFirestoreDb } from "./_firebase-admin.ts";

interface VolunteerRow {
  fullName: string;
  phone: string | null;
  ministries: string[];
}

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

function normalizeMinistryName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatPhone(phone: string): string | null {
  if (!phone || phone.trim() === "") return null;

  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length === 10 || cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }

  return phone.trim();
}

async function findMinistryByName(
  db: FirebaseFirestore.Firestore,
  churchId: string,
  ministryName: string,
): Promise<string | null> {
  const normalizedName = normalizeMinistryName(ministryName);

  const snapshot = await db
    .collection("ministries")
    .where("churchId", "==", churchId)
    .where("deletedAt", "==", null)
    .get();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const dbName = normalizeMinistryName(data.name || "");
    if (dbName === normalizedName) {
      return doc.id;
    }
  }

  return null;
}

async function findMemberByName(
  db: FirebaseFirestore.Firestore,
  fullName: string,
): Promise<string | null> {
  const normalizedName = normalizeMinistryName(fullName);

  const snapshot = await db
    .collection("members")
    .where("deletedAt", "==", null)
    .get();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const dbName = normalizeMinistryName(data.fullName || "");
    if (dbName === normalizedName) {
      return doc.id;
    }
  }

  return null;
}

async function createMember(
  db: FirebaseFirestore.Firestore,
  fullName: string,
  phone: string | null,
  createdByUserId: string,
): Promise<string> {
  const now = new Date();
  const memberId = crypto.randomUUID();

  await db.collection("members").doc(memberId).set({
    fullName: fullName.trim(),
    email: null,
    phone: phone,
    status: "Active",
    maxServicesPerMonth: 4,
    avatarUrl: null,
    birthDate: null,
    notes: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    createdByUserId,
    updatedByUserId: null,
    deletedByUserId: null,
  });

  return memberId;
}

async function createMemberChurch(
  db: FirebaseFirestore.Firestore,
  memberId: string,
  churchId: string,
  roleId: string,
  createdByUserId: string,
): Promise<void> {
  const now = new Date();
  const memberChurchId = crypto.randomUUID();

  await db.collection("memberChurches").doc(memberChurchId).set({
    memberId,
    churchId,
    roleId,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    createdByUserId,
    updatedByUserId: null,
    deletedByUserId: null,
  });
}

async function createMemberMinistry(
  db: FirebaseFirestore.Firestore,
  memberId: string,
  churchId: string,
  ministryId: string,
  createdByUserId: string,
): Promise<void> {
  const now = new Date();
  const memberMinistryId = crypto.randomUUID();

  await db.collection("memberMinistries").doc(memberMinistryId).set({
    memberId,
    churchId,
    ministryId,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    createdByUserId,
    updatedByUserId: null,
    deletedByUserId: null,
  });
}

async function getMinistriesFromChurch(
  db: FirebaseFirestore.Firestore,
  churchId: string,
): Promise<Map<string, string>> {
  const ministriesMap = new Map<string, string>();

  const snapshot = await db
    .collection("ministries")
    .where("churchId", "==", churchId)
    .where("deletedAt", "==", null)
    .get();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const normalizedName = normalizeMinistryName(data.name || "");
    ministriesMap.set(normalizedName, doc.id);
  }

  return ministriesMap;
}

function parseVolunteerRow(
  row: string[],
  colMap: Record<string, number>,
): VolunteerRow | null {
  const fullName = row[colMap.fullName]?.trim() || "";

  if (!fullName) {
    return null;
  }

  const phone = row[colMap.phone]?.trim() || null;

  const ministries: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const colKey = `ministry${i}` as keyof typeof colMap;
    const ministryName = row[colMap[colKey]]?.trim();
    if (ministryName) {
      ministries.push(ministryName);
    }
  }

  return {
    fullName,
    phone: formatPhone(phone),
    ministries,
  };
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.log(
      "Uso: npx tsx scripts/import-volunteers.ts <churchId> <roleId> <caminho-do-csv> [createdByUserId]",
    );
    console.log("");
    console.log(
      "Exemplo: npx tsx scripts/import-volunteers.ts abc123 xyz789 voluntarios.csv admin123",
    );
    console.log("");
    console.log("Parâmetros:");
    console.log("  churchId          - ID da igreja para associar os membros");
    console.log(
      "  roleId            - ID da função/role para todos os membros",
    );
    console.log("  caminho-do-csv    - Caminho para o arquivo CSV");
    console.log(
      "  createdByUserId    - (opcional) ID do usuário que criou (padrão: 'system')",
    );
    process.exit(1);
  }

  const churchId = args[0];
  const roleId = args[1];
  const csvPath = args[2];
  const createdByUserId = args[3] || "system";

  if (!fs.existsSync(csvPath)) {
    console.error(`Arquivo não encontrado: ${csvPath}`);
    process.exit(1);
  }

  const db = getFirestoreDb();

  console.log(
    "═══════════════════════════════════════════════════════════════",
  );
  console.log("              IMPORTAÇÃO DE VOLUNTÁRIOS                      ");
  console.log(
    "═══════════════════════════════════════════════════════════════",
  );
  console.log("");
  console.log("Parâmetros:");
  console.log(`  Igreja ID: ${churchId}`);
  console.log(`  Role ID:   ${roleId}`);
  console.log(`  CSV:       ${csvPath}`);
  console.log("");

  const ministriesMap = await getMinistriesFromChurch(db, churchId);
  console.log(`Ministérios encontrados na igreja: ${ministriesMap.size}`);
  if (ministriesMap.size > 0) {
    console.log("  Ministério          | ID");
    console.log(
      "  --------------------|----------------------------------------",
    );
    for (const [name, id] of ministriesMap) {
      console.log(`  ${name.padEnd(18)} | ${id}`);
    }
  }
  console.log("");

  const fileContent = fs.readFileSync(csvPath, "utf-8");
  const allRows = parseCSV(fileContent);

  if (allRows.length < 2) {
    console.error(
      "CSV precisa ter pelo menos um cabeçalho e uma linha de dados",
    );
    process.exit(1);
  }

  const header = allRows[0].map((h) => h.toUpperCase().trim());

  const colMap: Record<string, number> = {
    fullName: header.findIndex((h) => h.includes("NOME")),
    phone: header.findIndex((h) => h.includes("TELEFONE")),
    ministry1: header.findIndex(
      (h) => h.includes("MINISTÉRIO 1") || h.includes("MINISTERIO 1"),
    ),
    ministry2: header.findIndex(
      (h) => h.includes("MINISTÉRIO 2") || h.includes("MINISTERIO 2"),
    ),
    ministry3: header.findIndex(
      (h) => h.includes("MINISTÉRIO 3") || h.includes("MINISTERIO 3"),
    ),
    ministry4: header.findIndex(
      (h) => h.includes("MINISTÉRIO 4") || h.includes("MINISTERIO 4"),
    ),
    ministry5: header.findIndex(
      (h) => h.includes("MINISTÉRIO 5") || h.includes("MINISTERIO 5"),
    ),
  };

  console.log("Colunas detectadas:");
  console.log(`  - Nome completo:  ${colMap.fullName >= 0 ? "✓" : "✗"}`);
  console.log(
    `  - Telefone:       ${colMap.phone >= 0 ? "✓" : "✗"} (opcional)`,
  );
  console.log(`  - Ministério 1:    ${colMap.ministry1 >= 0 ? "✓" : "✗"}`);
  console.log(
    `  - Ministério 2-5:  ${colMap.ministry2 >= 0 ? "✓" : "✗"} (opcional)`,
  );
  console.log("");

  if (colMap.fullName < 0) {
    console.error("Coluna NOME COMPLETO não encontrada!");
    process.exit(1);
  }

  const dataRows = allRows.slice(1);
  const validRows: VolunteerRow[] = [];

  for (const row of dataRows) {
    const volunteer = parseVolunteerRow(row, colMap);
    if (volunteer) {
      validRows.push(volunteer);
    }
  }

  console.log(`Linhas válidas encontradas: ${validRows.length}`);
  console.log("");

  const rlConfirm = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const confirm = await new Promise<string>((resolve) => {
    rlConfirm.question("Deseja continuar com a importação? (s/n): ", resolve);
  });
  rlConfirm.close();

  if (confirm.toLowerCase() !== "s") {
    console.log("Operação cancelada.");
    process.exit(0);
  }

  console.log("\nIniciando importação...\n");

  let created = 0;
  let skipped = 0;
  let memberChurchCreated = 0;
  let ministryLinksCreated = 0;
  const ministriesNotFound: Map<string, number> = new Map();
  const skippedMembers: string[] = [];

  for (let i = 0; i < validRows.length; i++) {
    const volunteer = validRows[i];
    const lineNumber = i + 2;

    process.stdout.write(
      `[${i + 1}/${validRows.length}] ${volunteer.fullName}... `,
    );

    const existingMemberId = await findMemberByName(db, volunteer.fullName);

    if (existingMemberId) {
      console.log("PULADO (já existe)");
      skipped++;
      skippedMembers.push(volunteer.fullName);
      continue;
    }

    try {
      const memberId = await createMember(
        db,
        volunteer.fullName,
        volunteer.phone,
        createdByUserId,
      );

      await createMemberChurch(db, memberId, churchId, roleId, createdByUserId);
      memberChurchCreated++;

      let ministryLinksForMember = 0;
      const uniqueMinistries = [...new Set(volunteer.ministries)];

      for (const ministryName of uniqueMinistries) {
        const normalizedName = normalizeMinistryName(ministryName);
        const ministryId = ministriesMap.get(normalizedName);

        if (ministryId) {
          await createMemberMinistry(
            db,
            memberId,
            churchId,
            ministryId,
            createdByUserId,
          );
          ministryLinksForMember++;
          ministryLinksCreated++;
        } else {
          const count = ministriesNotFound.get(ministryName) || 0;
          ministriesNotFound.set(ministryName, count + 1);
        }
      }

      created++;
      console.log(
        `OK (membro + igreja + ${ministryLinksForMember} ministério(s))`,
      );
    } catch (error) {
      console.log(`ERRO: ${error}`);
    }
  }

  console.log(
    "\n═══════════════════════════════════════════════════════════════",
  );
  console.log("                         RESUMO                               ");
  console.log(
    "═══════════════════════════════════════════════════════════════",
  );
  console.log(`  Membros criados:            ${created}`);
  console.log(`  Membros pulados (existem):  ${skipped}`);
  console.log(`  Associações igreja:         ${memberChurchCreated}`);
  console.log(`  Associações ministério:      ${ministryLinksCreated}`);

  if (ministriesNotFound.size > 0) {
    console.log("");
    console.log("  Ministérios não encontrados no banco:");
    for (const [name, count] of ministriesNotFound) {
      console.log(`    - "${name}" (${count} vez(es))`);
    }
  }

  if (skippedMembers.length > 0) {
    console.log("");
    console.log("  Membros pulados (já existem no banco):");
    for (const name of skippedMembers.slice(0, 10)) {
      console.log(`    - ${name}`);
    }
    if (skippedMembers.length > 10) {
      console.log(`    ... e mais ${skippedMembers.length - 10}`);
    }
  }

  console.log(
    "═══════════════════════════════════════════════════════════════\n",
  );
}

main().catch(console.error);
