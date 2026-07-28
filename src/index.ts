import "dotenv/config";
import express from "express";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// ── DB Setup ────────────────────────────────────────────────
const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/mydb";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const client = new PrismaClient({ adapter });

// ── Express App ─────────────────────────────────────────────
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// GET /users — return all users
app.get("/users", async (req, res) => {
  try {
    const users = await client.user.findMany({
      include: { todos: true },
    });
    res.json(users);
  } catch (error) {
    console.error("GET /users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /todos/:id — return a todo with its user
app.get("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await client.todo.findFirst({
      where: { id: Number(id) },
      include: { user: true },
    });

    if (!todo) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }

    res.json(todo);
  } catch (error) {
    console.error("GET /todos/:id error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Seed Initial Data (runs once on startup) ────────────────
async function seed() {
  try {
    const user = await client.user.upsert({
      where: { username: "john_doe" },
      update: { firstName: "John", lastName: "Doe" },
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
      include: { todos: true },
    });
    console.log("✅ Seed complete — User:", user.username);
  } catch (error) {
    console.error("❌ Seed error:", error);
  }
}

// ── Start Server ─────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  await seed();
});

// ── Graceful Shutdown ────────────────────────────────────────
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down...");
  await client.$disconnect();
  await pool.end();
  process.exit(0);
});