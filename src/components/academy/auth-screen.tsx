"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookMarked, CircleCheckBig, Loader2, Map, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Stats = { blocks: number; lessons: number; questions: number; terms: number };

const FEATURES = [
  {
    icon: Map,
    title: "Структурированная программа",
    text: "От основ 115-ФЗ до ЭДО с регуляторами и сопровождения — 7 блоков с практикой и мини-проверками.",
  },
  {
    icon: CircleCheckBig,
    title: "Индивидуальный прогресс",
    text: "Каждый ответ и зачтённый урок сохраняются в вашем аккаунте — прогресс не теряется при смене устройства.",
  },
  {
    icon: BookMarked,
    title: "Только подтверждённые факты",
    text: "Контент опирается на материалы АО «Комита»: лэндинг продукта и документацию. Неподтверждённое помечается.",
  },
];

export function AuthScreen({ stats }: { stats: Stats }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"login" | "register" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [login, setLogin] = useState({ email: "", password: "" });
  const [reg, setReg] = useState({ name: "", email: "", password: "" });

  async function submit(mode: "login" | "register") {
    setLoading(mode);
    setError(null);
    const url = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload = mode === "login" ? login : reg;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Что-то пошло не так");
        return;
      }
      router.refresh();
    } catch {
      setError("Сервер недоступен. Попробуйте ещё раз.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Бренд-панель */}
      <div className="hero-gradient relative hidden flex-col justify-between overflow-hidden p-10 text-white lg:flex xl:p-14">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-900/40">
              <ShieldCheck className="size-6" aria-hidden />
            </span>
            <div className="leading-tight">
              <p className="font-head text-lg font-extrabold tracking-tight">AML Академия</p>
              <p className="text-xs text-slate-400">Корпоративное обучение · COMITA AML</p>
            </div>
          </div>

          <h1 className="mt-14 max-w-xl font-head text-4xl font-extrabold leading-[1.15] tracking-tight xl:text-[44px]">
            Продуктовый эксперт <span className="bg-gradient-to-r from-blue-400 to-sky-300 bg-clip-text text-transparent">COMITA AML</span>
          </h1>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-slate-300">
            Платформа для системного входа в домен ПОД/ФТ и продукт: нормативная база, 11 функциональных компонентов,
            ЭДО с регуляторами и разговоры с заказчиками на языке разработчика системы.
          </p>

          <ul className="mt-10 space-y-5">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-white/10">
                  <Icon className="size-4.5 text-sky-300" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-1 max-w-md text-[13px] leading-relaxed text-slate-400">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <dl className="mt-10 grid grid-cols-4 gap-3">
          {[
            [stats.blocks, "блоков"],
            [stats.lessons, "занятий"],
            [stats.questions, "вопросов"],
            [stats.terms, "терминов"],
          ].map(([v, l]) => (
            <div key={l as string} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur">
              <dt className="sr-only">{l as string}</dt>
              <dd className="font-head text-2xl font-extrabold">{v as number}</dd>
              <dd className="text-[11px] text-slate-400">{l as string}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Форма */}
      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="fade-up w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700">
                <ShieldCheck className="size-5 text-white" aria-hidden />
              </span>
              <div className="leading-tight">
                <p className="font-head text-base font-extrabold">AML Академия</p>
                <p className="text-[11px] text-muted-foreground">Корпоративное обучение · COMITA AML</p>
              </div>
            </div>
          </div>

          <h2 className="font-head text-2xl font-extrabold tracking-tight">Вход в платформу</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Прогресс, результаты тестов и зачёты хранятся в вашем личном аккаунте.
          </p>

          <Tabs defaultValue="login" className="mt-7">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6 space-y-4">
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  submit("login");
                }}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@company.ru"
                    value={login.email}
                    onChange={(e) => setLogin({ ...login, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="login-password">Пароль</Label>
                  <Input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={login.password}
                    onChange={(e) => setLogin({ ...login, password: e.target.value })}
                  />
                </div>
                {error && (
                  <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-[13px] font-medium text-destructive">
                    {error}
                  </p>
                )}
                <Button type="submit" className="w-full" disabled={loading !== null}>
                  {loading === "login" && <Loader2 className="size-4 animate-spin" aria-hidden />}
                  Войти
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="mt-6 space-y-4">
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  submit("register");
                }}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="reg-name">Имя и фамилия</Label>
                  <Input
                    id="reg-name"
                    required
                    minLength={2}
                    autoComplete="name"
                    placeholder="Анна Смирнова"
                    value={reg.name}
                    onChange={(e) => setReg({ ...reg, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-email">Рабочий email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@company.ru"
                    value={reg.email}
                    onChange={(e) => setReg({ ...reg, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-password">Пароль (от 6 символов)</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={reg.password}
                    onChange={(e) => setReg({ ...reg, password: e.target.value })}
                  />
                </div>
                <p className="rounded-lg bg-secondary px-3 py-2 text-[12px] leading-relaxed text-secondary-foreground">
                  Первый зарегистрированный аккаунт получает роль ментора: доступ к прогрессу всех участников.
                </p>
                {error && (
                  <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-[13px] font-medium text-destructive">
                    {error}
                  </p>
                )}
                <Button type="submit" className="w-full" disabled={loading !== null}>
                  {loading === "register" && <Loader2 className="size-4 animate-spin" aria-hidden />}
                  Создать аккаунт
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
