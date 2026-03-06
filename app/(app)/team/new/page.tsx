import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import NewTeamMemberForm from "./NewTeamMemberForm";

export default async function NewTeamMemberPage() {
  const user = await getCurrentUser();
  if (!user || !can.createTeamMember(user.role)) {
    redirect("/team");
  }
  return <NewTeamMemberForm />;
}
