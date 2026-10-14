import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { getLesson, passScoreFor } from "@/lib/course";

const schema = z.object({
  lessonId: z.string().min(1),
  correct: z.number().int().min(0),
  total: z.number().int().min(1).max(50),
});

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  const { lessonId, correct, total } = parsed.data;

  const lesson = getLesson(lessonId);
  if (!lesson) return NextResponse.json({ error: "Урок не найден" }, { status: 404 });
  if (correct > total) return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });

  const score = Math.round((correct / total) * 100);
  const attempt = await db.quizAttempt.create({
    data: { userId: user.id, lessonId, correct, total, score },
  });

  const passed = score >= passScoreFor(lesson);
  return NextResponse.json({ ok: true, score, passed, attemptId: attempt.id });
}
