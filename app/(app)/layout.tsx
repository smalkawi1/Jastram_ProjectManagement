import Sidebar from "@/components/layout/Sidebar";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  const sidebarUser = user
    ? {
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department ? { name: user.department.name } : null,
      }
    : null;

  return (
    <div className="flex min-h-screen">
      <Sidebar user={sidebarUser} />
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <main className="flex-1 p-6 bg-[#f0f5fb]">{children}</main>
      </div>
    </div>
  );
}
