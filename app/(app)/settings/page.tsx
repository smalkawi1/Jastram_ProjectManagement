import { redirect } from "next/navigation";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user || !can.viewSettings(user.role)) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-[#0d1f3c]">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Units, notification preferences, and app defaults
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <Cog6ToothIcon className="w-12 h-12 text-[#bfd0e8] mx-auto mb-3" />
        <p className="text-sm text-gray-500">
          Settings (units default, notification email, etc.) will be available here in a future update.
        </p>
      </div>
    </div>
  );
}
