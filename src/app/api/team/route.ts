import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { COURSE, RELEASED_LESSONS, TOTAL_LESSONS, getLesson } from "@/lib/course";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  completed: number;
  total: number;
  percent: number;
  blockPercents: number[];
  attempts: number;
  avgScore: number;
  lastActivity: string | null;
  lastLessonTitle: string | null;
};

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  if (user.role !== "mentor") {
    return NextResponse.json({ error: "Доступно только ментору" }, { status: 403 });
  }

  const users = await db.user.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      progress: true,
      attempts: { orderBy: { createdAt: "desc" } },
    },
  });

  const members: TeamMember[] = users.map((u) => {
    const completedIds = new Set(u.progress.map((p) => p.lessonId));
    const completed = RELEASED_LESSONS.filter((l) => completedIds.has(l.id)).length;

    const blockPercents = COURSE.map((b) => {
      const released = b.lessons.filter((l) => l.released);
      if (released.length === 0) return 0;
      const done = released.filter((l) => completedIds.has(l.id)).length;
      return Math.round((done / released.length) * 100);
    });

    const avgScore =
      u.attempts.length > 0
        ? Math.round(u.attempts.reduce((s, a) => s + a.score, 0) / u.attempts.length)
        : 0;

    const times = [
      u.createdAt.getTime(),
      ...u.progress.map((p) => p.completedAt.getTime()),
      ...u.attempts.map((a) => a.createdAt.getTime()),
    ];
    const lastTime = Math.max(...times);

    const lastLessonId =
      [...u.attempts.map((a) => a.lessonId), ...u.progress.map((p) => p.lessonId)].pop() ?? null;

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
      completed,
      total: TOTAL_LESSONS,
      percent: Math.round((completed / TOTAL_LESSONS) * 100),
      blockPercents,
      attempts: u.attempts.length,
      avgScore,
      lastActivity: times.length ? new Date(lastTime).toISOString() : null,
      lastLessonTitle: lastLessonId ? (getLesson(lastLessonId)?.title ?? null) : null,
    };
  });

  return NextResponse.json({ members });
}
