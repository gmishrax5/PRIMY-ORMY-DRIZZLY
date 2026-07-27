import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/mydb";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const client = new PrismaClient({ adapter });

async function createUser() {
  try {
    const user = await client.user.delete({
      where: { id:1 },
      
      
    });

    console.log("User upserted/found:", user);
  } catch (error) {
    console.error("Create user failed:", error);
  } finally {
    await client.$disconnect();
    await pool.end();
  }
}

void createUser();