"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Squares2X2Icon,
  FolderOpenIcon,
  CalendarDaysIcon,
  UsersIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon,
  PrinterIcon,
} from "@heroicons/react/24/outline";
import { createClient } from "@/lib/supabase/client";

type SidebarUser = {
  name: string | null;
  email: string;
  role: "VIEWER" | "EDITOR" | "ADMIN";
  department: { name: string } | null;
};

const ROLE_LABEL: Record<SidebarUser["role"], string> = {
  VIEWER: "Viewer",
  EDITOR: "Editor",
  ADMIN:  "Admin",
};

const ROLE_COLORS: Record<SidebarUser["role"], string> = {
  VIEWER: "bg-gray-600 text-gray-200",
  EDITOR: "bg-[#2453a0] text-blue-100",
  ADMIN:  "bg-amber-600 text-amber-100",
};

const NAV = [
  { label: "Dashboard",       href: "/dashboard",       icon: Squares2X2Icon,   adminOnly: false },
  { label: "Projects",       href: "/projects",        icon: FolderOpenIcon,   adminOnly: false },
  { label: "Manual Printing", href: "/manual-printing", icon: PrinterIcon,      adminOnly: false },
  { label: "Calendar",       href: "/calendar",        icon: CalendarDaysIcon, adminOnly: false },
  { label: "Team",           href: "/team",             icon: UsersIcon,        adminOnly: false },
  { label: "Account",        href: "/account",         icon: UserCircleIcon,   adminOnly: false },
  { label: "Settings",       href: "/settings",        icon: Cog6ToothIcon,    adminOnly: true  },
];

/** When server has no User row, still show sign-out if Supabase session exists */
function SidebarSignOutFallback({ onSignOut }: { onSignOut: () => void }) {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setEmail(session?.user?.email ?? null);
    });
  }, []);

  if (email) {
    return (
      <div className="px-4 py-4 border-t border-[#1a3a6e] space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#1a3a6e] flex items-center justify-center text-xs font-semibold text-[#bfd0e8] shrink-0">
            {email.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-white truncate leading-tight">{email}</p>
            <p className="text-[10px] text-[#94afd4] leading-tight">Signed in</p>
          </div>
        </div>
        <Link
          href="/account"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#94afd4] hover:bg-[#1a3a6e] hover:text-white transition-colors"
        >
          <UserCircleIcon className="w-4 h-4 shrink-0" />
          Account
        </Link>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#94afd4] hover:bg-[#1a3a6e] hover:text-white transition-colors"
        >
          <ArrowRightStartOnRectangleIcon className="w-4 h-4 shrink-0" />
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="px-5 py-4 border-t border-[#1a3a6e]">
      <p className="text-[10px] text-[#6b8cba]">Project Management Tool</p>
      <p className="text-[10px] text-[#6b8cba]">v0.1.0</p>
    </div>
  );
}

export default function Sidebar({ user }: { user: SidebarUser | null }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const visibleNav = NAV.filter(
    (item) => !item.adminOnly || user?.role === "ADMIN"
  );

  return (
    <aside className="flex flex-col w-56 min-h-screen bg-[#0d1f3c] text-white shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-[#1a3a6e]">
        <div className="w-8 h-8 rounded bg-[#2453a0] flex items-center justify-center text-xs font-bold tracking-wide">
          JE
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">Jastram</p>
          <p className="text-[10px] text-[#94afd4] leading-tight">Engineering Ltd.</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleNav.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-[#2453a0] text-white"
                  : "text-[#bfd0e8] hover:bg-[#1a3a6e] hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User info + sign-out */}
      {user && (
        <div className="px-4 py-4 border-t border-[#1a3a6e] space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1a3a6e] flex items-center justify-center text-xs font-semibold text-[#bfd0e8] shrink-0">
              {(user.name ?? user.email).charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate leading-tight">
                {user.name ?? user.email.split("@")[0]}
              </p>
              {user.department && (
                <p className="text-[10px] text-[#94afd4] truncate leading-tight">
                  {user.department.name}
                </p>
              )}
            </div>
            <span
              className={`ml-auto shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded ${ROLE_COLORS[user.role]}`}
            >
              {ROLE_LABEL[user.role]}
            </span>
          </div>

          <Link
            href="/account"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#94afd4] hover:bg-[#1a3a6e] hover:text-white transition-colors"
          >
            <UserCircleIcon className="w-4 h-4 shrink-0" />
            Account
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#94afd4] hover:bg-[#1a3a6e] hover:text-white transition-colors"
          >
            <ArrowRightStartOnRectangleIcon className="w-4 h-4 shrink-0" />
            Sign out
          </button>
        </div>
      )}

      {/* When server didn't pass user, show sign-out from session (e.g. no User row in DB yet) */}
      {!user && <SidebarSignOutFallback onSignOut={handleSignOut} />}
    </aside>
  );
}
