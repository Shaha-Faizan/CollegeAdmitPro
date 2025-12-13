import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq } from 'drizzle-orm';
import ws from "ws";
import * as schema from "@shared/schema";
import bcrypt from "bcrypt";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

export async function seedDatabase() {
  try {
    const existingAdmins = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, "admin@example.com"));

    if (existingAdmins.length === 0) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await db.insert(schema.users).values({
        email: "admin@example.com",
        password: hashedPassword,
        fullName: "Admin User",
        role: "admin",
      });
      console.log("✓ Admin user created: admin@example.com / admin123");
    } else {
      console.log("✓ Admin user already exists");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
