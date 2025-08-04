import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Load environment variables from .env file
config();

export default defineConfig({
  schema: "./shared/src/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    // Pointing to the production Neon database.
    url: process.env.DATABASE_URL!,
  },
});
