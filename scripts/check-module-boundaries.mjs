import fs from "node:fs";
import path from "node:path";

const sourceRoot = path.resolve("src");
const forbiddenFrontend = /@\/modules\/[^/]+\/(application|domain|infrastructure)\//;
const forbiddenAppImport = /@\/app\//;
const importPattern = /(?:from\s*["']|import\s*["'])([^"']+)["']/g;

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(entryPath);
    return /\.(ts|tsx)$/.test(entry.name) ? [entryPath] : [];
  });
}

const violations = [];
for (const file of walk(sourceRoot)) {
  const relative = path.relative(process.cwd(), file).replaceAll("\\", "/");
  const source = fs.readFileSync(file, "utf8");
  for (const match of source.matchAll(importPattern)) {
    const imported = match[1];
    const isFrontend = /^(src\/features|src\/stores|src\/components)/.test(
      relative,
    );
    if (isFrontend && forbiddenFrontend.test(imported)) {
      violations.push(`${relative} -> ${imported}`);
    }
    if (/^src\/modules\//.test(relative) && forbiddenAppImport.test(imported)) {
      violations.push(`${relative} -> ${imported}`);
    }
  }
}

if (violations.length > 0) {
  console.error("Module boundary violations:");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exitCode = 1;
} else {
  console.log("Module boundaries are valid.");
}
