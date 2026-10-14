import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(2, "Имя — минимум 2 символа").max(60),
  email: z.string().trim().toLowerCase().email("Некорректный email"),
  password: z.string().min(6, "Пароль — минимум 6 символов").max(100),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Проверьте поля" }, { status: 400 });
    }
    const { name, email, password } = parsed.data;

    const exists = await db.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "Пользователь с таким email уже зарегистрирован" }, { status: 409 });
    }

    const userCount = await db.user.count();
    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash: hashPassword(password),
        // Первый зарегистрированный аккаунт — ментор (ведущий курс)
        role: userCount === 0 ? "mentor" : "student",
      },
    });

    await setSessionCookie(user.id);
    return NextResponse.json({ ok: true, role: user.role });
  } catch (e) {
    console.error("register error", e);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
