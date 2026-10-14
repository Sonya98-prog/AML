import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { getLesson } from "@/lib/course";

const schema = z.object({
  lessonId: z.string().min(1),
  done: z.boolean(),
});

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  const { lessonId, done } = parsed.data;

  if (!getLesson(lessonId)) return NextResponse.json({ error: "Урок не найден" }, { status: 404 });

  if (done) {
    await db.lessonProgress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId } },
      update: {},
      create: { userId: user.id, lessonId },
    });
  } else {
    await db.lessonProgress.deleteMany({ where: { userId: user.id, lessonId } });
  }

  const completed = await db.lessonProgress.count({ where: { userId: user.id } });
  return NextResponse.json({ ok: true, completed });
}
