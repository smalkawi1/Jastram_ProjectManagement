import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import NewProjectForm from "./NewProjectForm";

export default async function NewProjectPage() {
  const user = await getCurrentUser();
  if (!user || !can.createProject(user.role)) {
    redirect("/projects");
  }
  return <NewProjectForm />;
}
