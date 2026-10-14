import { notFound } from "next/navigation";
import { AppShell } from "@/components/academy/app-shell";
import { LessonView } from "@/components/academy/lesson-view";
import { ALL_LESSONS, getLesson, getBlockOf, neighborLessons, blockNumber, passScoreFor } from "@/lib/course";

// Статический экспорт: заранее собираем страницу для каждого занятия
export function generateStaticParams() {
  return ALL_LESSONS.map((l) => ({ id: l.id }));
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = getLesson(id);
  if (!lesson) notFound();

  const block = getBlockOf(id);
  const blockIdx = blockNumber(id);
  const { prev, next } = neighborLessons(id);

  return (
    <AppShell>
      <LessonView
        lesson={lesson}
        blockIdx={blockIdx}
        blockTitle={block?.title ?? ""}
        prev={prev ? { id: prev.id, title: prev.title } : null}
        next={next ? { id: next.id, title: next.title } : null}
        passScore={passScoreFor(lesson)}
      />
    </AppShell>
  );
}
