import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/mydb"
});

const client = new PrismaClient({ adapter });


async function createUser(){
await client.user.create({
  data:{
    username:"john",
    password:"1876884",
    age:20,
    city:"indore"
  }
})

}

createUser();