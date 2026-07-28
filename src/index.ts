import express from "express";

import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";


const app = express ();

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/mydb";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const client = new PrismaClient({ adapter });

async function main() {
  try {
    // Create or update a user with associated todos using relational queries
    const user = await client.user.upsert({
      where: { username: "john_doe" },
      update: {
        firstName: "John",
        lastName: "Doe",
      },
      create: {
        username: "john_doe",
        password: "secure123",
        firstName: "John",
        lastName: "Doe",
        todos: {
          create: {
            title: "Learn Prisma",
            description: "Understand relations",
          },
        },
      },
      include: {
        todos: true, // Return user's todos in response
      },
    });
    console.log("User with todos:", user);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.$disconnect();
    await pool.end();
  }
}

void main();