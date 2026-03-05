import { getCurrentUser } from "@/lib/auth";
import AccountClient from "./AccountClient";
import AccountProfile from "./AccountProfile";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-[#0d1f3c] mb-1">Account</h1>
      <p className="text-sm text-gray-500 mb-6">Manage your profile and password.</p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <AccountProfile user={user} />
        <AccountClient />
      </div>
    </div>
  );
}
