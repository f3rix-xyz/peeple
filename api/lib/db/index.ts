import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

export const getDB = (): string =>
  process.env.DATABASE_URL ??
  ((): never => {
    throw new Error("Enter DB");
  })();

export const pool = new Pool({ connectionString: getDB() });
export const db = drizzle(pool, { schema });
