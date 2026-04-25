import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";

// Edge-safe environment loading (Prisma CLI only handles this in Node.js)
if (typeof process !== "undefined" && process.env) {
  dotenv.config({ path: ".env.local" });
  dotenv.config({ path: ".env" });
}

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrate: {
    url: process.env.DIRECT_URL,
  },
});
