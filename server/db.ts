import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Use your Render PostgreSQL database
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://attendance_db_zldc_user:rJnkc8LMrwyhenpBo9RB9eIC7OaurJr4@dpg-d2agk91r0fns73cjr3h0-a.singapore-postgres.render.com/attendance_db_zldc?sslmode=require";

export const pool = new Pool({ 
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export const db = drizzle(pool, { schema });
