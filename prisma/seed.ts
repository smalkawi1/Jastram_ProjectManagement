/**
 * Jastram PM — Database seed
 *
 * Creates:
 *   • 3 Departments: Engineering, Purchasing, Production
 *   • 1 Admin User (requires SEED_ADMIN_EMAIL + SEED_ADMIN_AUTH_ID in .env)
 *   • 1 optional Test User, non-admin (requires SEED_TEST_USER_EMAIL + SEED_TEST_USER_AUTH_ID in .env)
 *
 * Prerequisites for any user:
 *   1. Open Supabase → Authentication → Users → "Add user"
 *   2. Enter email + password, copy the UUID shown.
 *   3. Add to .env (admin):
 *        SEED_ADMIN_EMAIL="admin@jastram.com"
 *        SEED_ADMIN_AUTH_ID="paste-uuid-here"
 *   4. Optional test user (Viewer/Editor):
 *        SEED_TEST_USER_EMAIL="viewer@jastram.com"
 *        SEED_TEST_USER_AUTH_ID="paste-uuid-here"
 *        SEED_TEST_USER_ROLE="VIEWER"   (or EDITOR; default VIEWER)
 *        SEED_TEST_USER_DEPARTMENT="Purchasing"  (optional: Engineering, Purchasing, Production)
 *   5. Run:  npx prisma db seed
 *
 * Safe to re-run — all operations use upsert (idempotent).
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
  console.log("🌱 Seeding database…");

  // ── Departments ────────────────────────────────────────────────────────────
  const departmentNames = ["Engineering", "Purchasing", "Production"];

  for (const name of departmentNames) {
    const dept = await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    console.log(`  ✓ Department: ${dept.name} (${dept.id})`);
  }

  // ── Admin User ─────────────────────────────────────────────────────────────
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminAuthId = process.env.SEED_ADMIN_AUTH_ID;

  if (!adminEmail || !adminAuthId) {
    console.log("\n  ⚠  Admin user not seeded — SEED_ADMIN_EMAIL and");
    console.log("     SEED_ADMIN_AUTH_ID are not set in .env.");
    console.log("\n  To create the admin user:");
    console.log("    1. Open Supabase → Authentication → Users → Add user");
    console.log("    2. Enter email + password, copy the UUID.");
    console.log("    3. Add to .env:");
    console.log('         SEED_ADMIN_EMAIL="you@jastram.com"');
    console.log('         SEED_ADMIN_AUTH_ID="paste-uuid-here"');
    console.log("    4. Re-run: npx prisma db seed\n");
  } else {
    const engineeringDept = await prisma.department.findUnique({
      where: { name: "Engineering" },
    });

    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        authId: adminAuthId,
        role: "ADMIN",
        departmentId: engineeringDept?.id ?? null,
      },
      create: {
        authId: adminAuthId,
        email: adminEmail,
        name: "Admin",
        role: "ADMIN",
        departmentId: engineeringDept?.id ?? null,
      },
    });
    console.log(`  ✓ Admin user: ${admin.email} (authId: ${admin.authId})`);
  }

  // ── Test User (non-admin, for testing Viewer/Editor) ───────────────────────
  const testEmail = process.env.SEED_TEST_USER_EMAIL;
  const testAuthId = process.env.SEED_TEST_USER_AUTH_ID;

  if (testEmail && testAuthId) {
    const role = (process.env.SEED_TEST_USER_ROLE ?? "VIEWER").toUpperCase();
    const validRole = role === "EDITOR" || role === "VIEWER" ? role : "VIEWER";
    const deptName = process.env.SEED_TEST_USER_DEPARTMENT;
    const dept = deptName
      ? await prisma.department.findUnique({ where: { name: deptName } })
      : await prisma.department.findUnique({ where: { name: "Engineering" } });

    const testUser = await prisma.user.upsert({
      where: { email: testEmail },
      update: {
        authId: testAuthId,
        name: process.env.SEED_TEST_USER_NAME ?? null,
        role: validRole,
        departmentId: dept?.id ?? null,
      },
      create: {
        authId: testAuthId,
        email: testEmail,
        name: process.env.SEED_TEST_USER_NAME ?? "Test User",
        role: validRole,
        departmentId: dept?.id ?? null,
      },
    });
    console.log(`  ✓ Test user: ${testUser.email} (${testUser.role}, authId: ${testUser.authId})`);
  } else if (!adminEmail || !adminAuthId) {
    // only mention test user if we already mentioned admin
  } else {
    console.log("\n  ℹ  No test user seeded. To add a non-admin for testing:");
    console.log("     Add SEED_TEST_USER_EMAIL and SEED_TEST_USER_AUTH_ID (and optionally");
    console.log("     SEED_TEST_USER_ROLE=VIEWER|EDITOR, SEED_TEST_USER_DEPARTMENT) to .env");
    console.log("     then run: npx prisma db seed");
  }

  console.log("\n✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
