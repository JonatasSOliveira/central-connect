import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined.");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/infra/database/drizzle/schema.ts",
  out: "./migrations",
  dbCredentials: { url: databaseUrl },
  verbose: true,
  strict: true,
});
