import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AppShell } from "@/components/academy/app-shell";
import { TeamView } from "@/components/academy/team-view";

export default async function TeamPage() {
  const user = await getSessionUser();
  if (!user) redirect("/");
  if (user.role !== "mentor") redirect("/");

  return (
    <AppShell user={{ name: user.name, email: user.email, role: user.role }}>
      <TeamView />
    </AppShell>
  );
}
