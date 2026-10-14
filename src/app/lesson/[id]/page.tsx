import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { AppShell } from "@/components/academy/app-shell";
import { LessonView } from "@/components/academy/lesson-view";
import { getLesson, getBlockOf, neighborLessons, blockNumber, passScoreFor } from "@/lib/course";

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/");

  const { id } = await params;
  const lesson = getLesson(id);
  if (!lesson) notFound();

  const block = getBlockOf(id);
  const blockIdx = blockNumber(id);
  const { prev, next } = neighborLessons(id);

  const [progress, attempts] = await Promise.all([
    db.lessonProgress.findUnique({
      where: { userId_lessonId: { userId: user.id, lessonId: id } },
    }),
    db.quizAttempt.findMany({
      where: { userId: user.id, lessonId: id },
      orderBy: { score: "desc" },
      take: 1,
    }),
  ]);

  return (
    <AppShell user={{ name: user.name, email: user.email, role: user.role }}>
      <LessonView
        lesson={lesson}
        blockIdx={blockIdx}
        blockTitle={block?.title ?? ""}
        prev={prev ? { id: prev.id, title: prev.title } : null}
        next={next ? { id: next.id, title: next.title } : null}
        initialCompleted={!!progress}
        bestScore={attempts[0]?.score ?? null}
        passScore={passScoreFor(lesson)}
      />
    </AppShell>
  );
}
