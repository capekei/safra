import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./shared/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    // Pointing to the production Neon database.
    url: process.env.DATABASE_URL!,
  },
});
