"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Squares2X2Icon,
  FolderOpenIcon,
  CalendarDaysIcon,
  UsersIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const NAV = [
  { label: "Dashboard",  href: "/dashboard",  icon: Squares2X2Icon },
  { label: "Projects",   href: "/projects",   icon: FolderOpenIcon },
  { label: "Calendar",   href: "/calendar",   icon: CalendarDaysIcon },
  { label: "Team",       href: "/team",       icon: UsersIcon },
  { label: "Settings",   href: "/settings",   icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-56 min-h-screen bg-[#0d1f3c] text-white shrink-0">
      {/* Logo / brand */}
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
      <nav className="flex-1 px-3 py-4 space-y-1 sidebar-scroll overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon }) => {
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

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[#1a3a6e]">
        <p className="text-[10px] text-[#6b8cba]">Project Management Tool</p>
        <p className="text-[10px] text-[#6b8cba]">v0.1.0</p>
      </div>
    </aside>
  );
}
