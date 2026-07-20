import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing in .env file");
}

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({adapter, log: ['query', 'error']});
// const prisma = new PrismaClient({adapter});

export default prisma;