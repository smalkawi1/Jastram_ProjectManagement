import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import ManualPrintingView from "./ManualPrintingView";

export const dynamic = "force-dynamic";

export default async function ManualPrintingPage() {
  const user = await getCurrentUser();
  const canEdit = user ? can.editDeliverable(user.role) : false;

  return (
    <div className="max-w-5xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-[#0d1f3c]">Manual Printing</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Monthly snapshot of projects shipping this month — for reminder emails to the print team.
          Edits here sync with the main project trackers.
        </p>
      </div>
      <ManualPrintingView canEdit={canEdit} />
    </div>
  );
}
