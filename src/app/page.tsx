"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CircleCheckBig, CircleDashed, ArrowRight, Trophy, Sparkles, Flame } from "lucide-react";
import { AppShell } from "@/components/academy/app-shell";
import { ProgressRing } from "@/components/academy/progress-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { loadState, setName } from "@/lib/progress-store";
import {
  COURSE,
  GLOSSARY,
  RELEASED_LESSONS,
  TOTAL_LESSONS,
  nextLessonId,
} from "@/lib/course";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
}

const LAST_RESULTS = 5;

export default function Home() {
  const [hydrated, setHydrated] = useState(false);
  const [userName, setUserName] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [passedIds, setPassedIds] = useState<string[]>([]);
  const [quizzes, setQuizzes] = useState<{ lessonId: string; correct: number; total: number; score: number; at: string; key: string }[]>([]);

  useEffect(() => {
    const s = loadState();
    setUserName(s.name);
    setNameDraft(s.name);
    setPassedIds(s.passed);
    setQuizzes(
      [...s.quizzes]
        .sort((a, b) => (a.at < b.at ? 1 : -1))
        .slice(0, LAST_RESULTS)
        .map((q, i) => ({ ...q, key: `${q.lessonId}-${q.at}-${i}` }))
    );
    setHydrated(true);
  }, []);

  const completedIds = useMemo(() => new Set(passedIds), [passedIds]);
  const completed = RELEASED_LESSONS.filter((l) => completedIds.has(l.id)).length;
  const percent = Math.round((completed / TOTAL_LESSONS) * 100);
  const nextId = nextLessonId(completedIds);
  const avgScore =
    quizzes.length > 0 ? Math.round(quizzes.reduce((s, a) => s + a.score, 0) / quizzes.length) : null;

  function saveName() {
    setName(nameDraft);
    setUserName(nameDraft.trim().slice(0, 60));
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Hero */}
        <section className="hero-gradient fade-up relative overflow-hidden rounded-2xl p-6 text-white sm:p-8">
          <p className="text-[13px] font-medium text-slate-400">Личный кабинет · {userName || "коллега"}</p>

          {hydrated && !userName && (
            <div className="mt-2 flex max-w-md flex-col gap-2 sm:flex-row">
              <Input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                placeholder="Как вас зовут?"
                aria-label="Ваше имя"
                className="h-10 border-white/20 bg-white/10 text-white placeholder:text-slate-400 focus-visible:ring-white/40"
              />
              <Button
                onClick={saveName}
                className="h-10 shrink-0 bg-white/15 text-white hover:bg-white/25"
              >
                Сохранить
              </Button>
            </div>
          )}

          <h1 className="mt-2 max-w-xl font-head text-2xl font-extrabold tracking-tight sm:text-3xl">
            {completed === 0
              ? "Начните путь в домен ПОД/ФТ"
              : completed === TOTAL_LESSONS
                ? "Программа пройдена полностью. Отличная работа!"
                : "Продолжайте погружение в COMITA AML"}
          </h1>

          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="rounded-2xl bg-white/8 p-4 backdrop-blur">
              <ProgressRing percent={percent} size={104} stroke={9} label="курс" />
            </div>
            <div className="grid flex-1 grid-cols-2 gap-3 sm:max-w-md">
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                <p className="font-head text-xl font-extrabold">
                  {completed}
                  <span className="text-sm font-semibold text-slate-400"> / {TOTAL_LESSONS}</span>
                </p>
                <p className="text-[11px] text-slate-400">зачтено занятий</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                <p className="font-head text-xl font-extrabold">
                  {avgScore !== null ? `${avgScore}%` : "—"}
                </p>
                <p className="text-[11px] text-slate-400">средний результат тестов</p>
              </div>
              {nextId ? (
                <Button asChild className="col-span-2 mt-1 bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-950/40 hover:from-blue-500 hover:to-blue-400 sm:col-span-2">
                  <Link href={`/lesson/${nextId}`}>
                    <Sparkles className="size-4" aria-hidden />
                    Продолжить обучение
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
              ) : (
                <div className="col-span-2 mt-1 flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-sm font-semibold text-emerald-300">
                  <Trophy className="size-4" aria-hidden />
                  Все занятия зачтены — можно повторять тесты
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Программа */}
        <section className="space-y-4" aria-label="Программа курса">
          <h2 className="font-head text-lg font-extrabold tracking-tight">Программа курса</h2>
          {COURSE.map((block, bi) => {
            const done = block.lessons.filter((l) => l.released && completedIds.has(l.id)).length;
            const total = block.lessons.filter((l) => l.released).length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <Card key={block.id ?? bi} className="fade-up overflow-hidden border-border/70 py-0 shadow-sm transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 bg-gradient-to-r from-secondary/60 to-transparent px-5 py-4">
                  <div>
                    <CardTitle className="font-head text-[15px] font-bold tracking-tight">
                      Блок {bi + 1}. {block.title}
                    </CardTitle>
                    {"subtitle" in block && block.subtitle && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{block.subtitle}</p>
                    )}
                  </div>
                  <Badge variant={pct === 100 && total > 0 ? "default" : "secondary"} className="shrink-0 font-semibold">
                    {done} / {total}
                  </Badge>
                </CardHeader>
                <CardContent className="px-5 py-3">
                  <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-muted" role="presentation">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-400 transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <ul className="divide-y divide-border/70">
                    {block.lessons.map((l) => {
                      const isDone = completedIds.has(l.id);
                      return (
                        <li key={l.id}>
                          <Link
                            href={`/lesson/${l.id}`}
                            className={cn(
                              "group flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-secondary/60",
                              !l.released && "opacity-55"
                            )}
                          >
                            {isDone ? (
                              <CircleCheckBig className="size-4.5 shrink-0 text-emerald-500" aria-label="Зачтено" />
                            ) : (
                              <CircleDashed className="size-4.5 shrink-0 text-muted-foreground" aria-hidden />
                            )}
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium group-hover:text-primary">
                                {l.id}. {l.title}
                              </span>
                              {!l.released && <span className="text-[11px] text-muted-foreground">раздел в наполнении</span>}
                            </span>
                            {l.isCheck && (
                              <Badge variant="outline" className="shrink-0 text-[10px] font-semibold text-secondary-foreground">
                                зачёт
                              </Badge>
                            )}
                            <ArrowRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </section>

        {/* Последние результаты */}
        <section aria-label="Последние результаты тестов">
          <h2 className="mb-3 flex items-center gap-2 font-head text-lg font-extrabold tracking-tight">
            <Flame className="size-4.5 text-orange-500" aria-hidden />
            Последние результаты тестов
          </h2>
          {quizzes.length === 0 ? (
            <Card className="border-dashed border-border/80 shadow-none">
              <CardContent className="px-5 py-6 text-sm text-muted-foreground">
                Пока нет попыток. Пройдите практику в любом занятии — результат появится здесь.
              </CardContent>
            </Card>
          ) : (
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {quizzes.map((a) => {
                const passed = a.score >= 70;
                return (
                  <li key={a.key} className="flex items-center gap-3 rounded-xl border border-border/70 bg-card px-4 py-3 shadow-sm">
                    <span
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-full font-head text-[13px] font-extrabold",
                        passed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      )}
                    >
                      {a.score}%
                    </span>
                    <div className="min-w-0 flex-1 leading-tight">
                      <Link href={`/lesson/${a.lessonId}`} className="block truncate text-[13px] font-semibold hover:text-primary">
                        {a.lessonId}. {COURSE.flatMap((b) => b.lessons).find((l) => l.id === a.lessonId)?.title ?? a.lessonId}
                      </Link>
                      <p className="text-[11px] text-muted-foreground">
                        {a.correct} из {a.total} · {formatDate(a.at)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
