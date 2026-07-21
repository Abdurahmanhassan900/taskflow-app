import "dotenv/config";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const SEED_EMAIL = "test@taskflow.local";
const ADMIN_EMAIL = "admin@taskflow.local";
const SEED_TASK_TITLE = "Learn Prisma";
const BCRYPT_ROUNDS = 12;

async function upsertUser(
  prisma: PrismaClient,
  email: string,
  fullName: string,
  password: string,
  role: "ADMIN" | "MEMBER"
) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  return prisma.user.upsert({
    where: { email },
    update: { passwordHash, fullName, role, deletedAt: null },
    create: { email, fullName, passwordHash, role },
  });
}

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const member = await upsertUser(
      prisma,
      SEED_EMAIL,
      "Test User",
      "local-dev-only-change-me",
      "MEMBER"
    );

    await upsertUser(
      prisma,
      ADMIN_EMAIL,
      "Admin User",
      "local-dev-only-change-me",
      "ADMIN"
    );

    const existingTask = await prisma.task.findFirst({
      where: {
        userId: member.id,
        title: SEED_TASK_TITLE,
        deletedAt: null,
      },
    });

    if (!existingTask) {
      await prisma.task.create({
        data: {
          title: SEED_TASK_TITLE,
          description: "Complete the Prisma schema and run the first migration.",
          userId: member.id,
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
