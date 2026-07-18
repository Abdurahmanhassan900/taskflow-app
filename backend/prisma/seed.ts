import "dotenv/config";
import { randomBytes, scryptSync } from "node:crypto";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const SEED_EMAIL = "test@taskflow.local";
const SEED_TASK_TITLE = "Learn Prisma";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const passwordHash = hashPassword("local-dev-only-change-me");

    const user = await prisma.user.upsert({
      where: { email: SEED_EMAIL },
      update: {},
      create: {
        email: SEED_EMAIL,
        fullName: "Test User",
        passwordHash,
        role: "MEMBER",
      },
    });

    const existingTask = await prisma.task.findFirst({
      where: {
        userId: user.id,
        title: SEED_TASK_TITLE,
        deletedAt: null,
      },
    });

    if (!existingTask) {
      await prisma.task.create({
        data: {
          title: SEED_TASK_TITLE,
          description: "Complete the Prisma schema and run the first migration.",
          userId: user.id,
        },
      });
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
