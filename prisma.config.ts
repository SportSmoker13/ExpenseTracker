import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";
import path from "node:path";

// Load environment variables from .env.local or .env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
