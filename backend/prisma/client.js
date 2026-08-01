import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
const { Pool } = pkg;

const mode = process.env.MODE;

const connection =
  mode === "test" ? process.env.TESTINGURL : process.env.DATABASEURL;

const pool = new Pool({
  connectionString: connection,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
