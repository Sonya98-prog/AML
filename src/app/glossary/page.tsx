import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/academy/app-shell";
import { GlossaryView } from "@/components/academy/glossary-view";
import { GLOSSARY, TOTAL_LESSONS, TOTAL_QUESTIONS } from "@/lib/course";

export default async function GlossaryPage() {
  const user = await getSessionUser();
  if (!user) redirect("/");

  return (
    <AppShell user={{ name: user.name, email: user.email, role: user.role }}>
      <GlossaryView terms={GLOSSARY} totals={{ lessons: TOTAL_LESSONS, questions: TOTAL_QUESTIONS }} />
    </AppShell>
  );
}
