import config from "@/lib/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

let _db: NeonHttpDatabase | null = null;

export const getDb = () => {
  if (!_db) {
    const databaseUrl = config.env.databaseUrl;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    const sql = neon(databaseUrl);
    _db = drizzle({ client: sql, casing: "snake_case" });
  }
  return _db;
};

// For backwards compatibility
export const db = new Proxy({} as NeonHttpDatabase, {
  get(_target, prop) {
    return getDb()[prop as keyof NeonHttpDatabase];
  }
});