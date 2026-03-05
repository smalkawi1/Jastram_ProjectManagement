/**
 * One-off: set a user's role to ADMIN by email.
 * Use when the admin can sign in but has no permissions (no User row or wrong role).
 *
 * Run: SEED_ADMIN_EMAIL=smalkawi@jastram.com npx tsx prisma/fix-admin.ts
 * Or:  npm run fix-admin  (uses SEED_ADMIN_EMAIL from .env)
 */

import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma";

const pool = new Pool({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim();
  if (!email) {
    console.error("Set SEED_ADMIN_EMAIL (e.g. smalkawi@jastram.com) and run again.");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { department: true },
  });

  if (!user) {
    console.error(`No User row found for email: ${email}`);
    console.error("Add this user via seed: set SEED_ADMIN_EMAIL and SEED_ADMIN_AUTH_ID in .env");
    console.error("(Get the auth ID from Supabase → Authentication → Users → that user → User UID)");
    console.error("Then run: npx prisma db seed");
    process.exit(1);
  }

  if (user.role === "ADMIN") {
    console.log(`User ${email} is already ADMIN. Nothing to do.`);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: "ADMIN" },
  });
  console.log(`✓ Updated ${email} to role ADMIN. Sign in again if needed.`);
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
