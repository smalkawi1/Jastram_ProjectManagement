import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import type { Department, User, UserRole } from "@/app/generated/prisma";

export type CurrentUser = User & { department: Department | null };

const VALID_ROLES: UserRole[] = ["VIEWER", "EDITOR", "ADMIN"];

/**
 * Resolves the current Supabase Auth session to the matching User row in our DB.
 * If the user is signed in but no User row exists, creates one (so you're not stuck without permissions).
 * Default role for new users: NEW_USER_DEFAULT_ROLE in .env (EDITOR | VIEWER | ADMIN), or EDITOR.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) return null;

    let dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
      include: { department: true },
    });

    if (!dbUser) {
      // Maybe a User row exists with this email but different authId (e.g. from seed). Link it.
      const existingByEmail = await prisma.user.findUnique({
        where: { email: user.email },
        include: { department: true },
      });
      if (existingByEmail) {
        dbUser = await prisma.user.update({
          where: { id: existingByEmail.id },
          data: { authId: user.id },
          include: { department: true },
        });
      } else {
        const defaultRole = process.env.NEW_USER_DEFAULT_ROLE?.toUpperCase();
        const role: UserRole = defaultRole && VALID_ROLES.includes(defaultRole as UserRole)
          ? (defaultRole as UserRole)
          : "EDITOR";
        dbUser = await prisma.user.create({
          data: {
            authId: user.id,
            email: user.email ?? "",
            name: (user.user_metadata?.name as string) ?? (user.user_metadata?.full_name as string) ?? null,
            role,
          },
          include: { department: true },
        });
      }
    }

    return dbUser;
  } catch {
    return null;
  }
}

/**
 * Returns 401 / 403 response objects for use in API route handlers.
 * Import { unauthorized, forbidden } from "@/lib/auth" to keep guards concise.
 */
export function unauthorized() {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

export function forbidden() {
  return new Response(JSON.stringify({ error: "Forbidden" }), {
    status: 403,
    headers: { "Content-Type": "application/json" },
  });
}

/** Role precedence for atLeast() checks */
const RANK: Record<UserRole, number> = { VIEWER: 0, EDITOR: 1, ADMIN: 2 };

export function atLeast(role: UserRole, min: UserRole): boolean {
  return RANK[role] >= RANK[min];
}
