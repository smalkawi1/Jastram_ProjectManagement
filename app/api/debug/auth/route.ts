/**
 * Debug: see what the app sees for the current session.
 * Open /api/debug/auth while signed in to check Supabase user vs DB User row.
 * Remove or restrict this route in production.
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();

    if (!supabaseUser) {
      return NextResponse.json({
        ok: false,
        message: "No Supabase session — you are not signed in or the session expired.",
        supabase: null,
        dbUser: null,
      });
    }

    const dbUser = await prisma.user.findUnique({
      where: { authId: supabaseUser.id },
      include: { department: true },
    });

    return NextResponse.json({
      ok: !!dbUser,
      message: dbUser
        ? `DB user found: ${dbUser.email}, role ${dbUser.role}. You should see full UI.`
        : `No User row in DB for this Supabase user. Seed with SEED_ADMIN_AUTH_ID = the id below.`,
      supabase: {
        id: supabaseUser.id,
        email: supabaseUser.email,
      },
      dbUser: dbUser
        ? {
            id: dbUser.id,
            email: dbUser.email,
            role: dbUser.role,
            authId: dbUser.authId,
            department: dbUser.department?.name ?? null,
          }
        : null,
      hint: !dbUser
        ? "Copy the supabase.id above into .env as SEED_ADMIN_AUTH_ID=..., set SEED_ADMIN_EMAIL to your email, then run: npx prisma db seed"
        : undefined,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: String(e), message: "Error checking auth." },
      { status: 500 }
    );
  }
}
