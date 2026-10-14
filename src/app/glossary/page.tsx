import { AppShell } from "@/components/academy/app-shell";
import { GlossaryView } from "@/components/academy/glossary-view";
import { GLOSSARY, TOTAL_LESSONS, TOTAL_QUESTIONS } from "@/lib/course";

export default function GlossaryPage() {
  return (
    <AppShell>
      <GlossaryView terms={GLOSSARY} totals={{ lessons: TOTAL_LESSONS, questions: TOTAL_QUESTIONS }} />
    </AppShell>
  );
}
