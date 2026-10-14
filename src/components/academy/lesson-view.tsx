"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CircleAlert,
  CircleCheckBig,
  ClipboardCheck,
  Info,
  Lightbulb,
  Loader2,
  ListChecks,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Quiz } from "@/components/academy/quiz";
import { isLessonCompleted, setLessonCompleted, getBestScore } from "@/lib/progress-store";
import type { ConceptItem, Lesson } from "@/lib/course";

function ConceptItemView({ item }: { item: ConceptItem }) {
  if (typeof item === "string") {
    return <p className="text-[15px] leading-relaxed text-foreground/90">{item}</p>;
  }
  if ("fig" in item) {
    return (
      <figure className="fig overflow-hidden rounded-xl border border-border bg-card p-3 shadow-sm sm:p-4">
        <div dangerouslySetInnerHTML={{ __html: item.fig }} />
        <figcaption className="mt-2.5 text-center text-xs text-muted-foreground">{item.cap}</figcaption>
      </figure>
    );
  }
  if ("table" in item) {
    return (
      <div className="scroll-thin overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[560px] border-collapse text-left text-[13.5px]">
          <thead>
            <tr className="bg-secondary/70">
              {item.table.head.map((h, i) => (
                <th key={i} className="px-4 py-2.5 font-head text-xs font-bold uppercase tracking-wide text-secondary-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {item.table.rows.map((row, ri) => (
              <tr key={ri} className="border-t border-border/70 align-top">
                {row.map((cell, ci) => (
                  <td key={ci} className={cn("px-4 py-2.5 leading-relaxed", ci === 0 && "font-semibold")}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if ("list" in item) {
    return (
      <ul className="space-y-2">
        {item.list.map((li, i) => (
          <li key={i} className="flex gap-2.5 text-[14.5px] leading-relaxed text-foreground/90">
            <span className="mt-[9px] size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
            {li}
          </li>
        ))}
      </ul>
    );
  }
  // callout
  const isWarn = item.callout.kind === "warn";
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border px-4 py-3.5",
        isWarn ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50/70"
      )}
    >
      {isWarn ? (
        <CircleAlert className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden />
      ) : (
        <Info className="mt-0.5 size-5 shrink-0 text-blue-600" aria-hidden />
      )}
      <div className="text-[13.5px] leading-relaxed">
        {item.callout.title && (
          <p className={cn("mb-0.5 font-head text-[13px] font-bold", isWarn ? "text-amber-800" : "text-blue-800")}>
            {item.callout.title}
          </p>
        )}
        <p className={isWarn ? "text-amber-900" : "text-blue-900"}>{item.callout.text}</p>
      </div>
    </div>
  );
}

export function LessonView({
  lesson,
  blockIdx,
  blockTitle,
  prev,
  next,
  passScore,
}: {
  lesson: Lesson;
  blockIdx: number;
  blockTitle: string;
  prev: { id: string; title: string } | null;
  next: { id: string; title: string } | null;
  passScore: number;
}) {
  const [completed, setCompleted] = useState(false);
  const [quizPassedScore, setQuizPassedScore] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  // Прогресс читаем в браузере (localStorage)
  useEffect(() => {
    setCompleted(isLessonCompleted(lesson.id));
    setQuizPassedScore(getBestScore(lesson.id));
  }, [lesson.id]);

  const passed = (quizPassedScore ?? -1) >= passScore;

  function toggleComplete() {
    const target = !completed;
    if (lesson.isCheck && target && !passed) return;
    setBusy(true);
    try {
      setLessonCompleted(lesson.id, target);
      setCompleted(target);
      toast({
        title: target ? "Занятие зачтено" : "Отметка снята",
        description: target ? "Прогресс сохранён в этом браузере." : undefined,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="space-y-6">
      {/* Шапка урока */}
      <header className="fade-up">
        <div className="flex flex-wrap items-center gap-2 text-[12px] font-medium text-muted-foreground">
          <Link href="/" className="hover:text-primary">
            Программа
          </Link>
          <span aria-hidden>/</span>
          <span>
            Блок {blockIdx}. {blockTitle}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-head text-2xl font-extrabold tracking-tight sm:text-[28px]">
            {lesson.id}. {lesson.title}
          </h1>
          {lesson.isCheck ? (
            <Badge className="bg-gradient-to-r from-blue-600 to-blue-500 font-semibold">
              <ClipboardCheck className="size-3.5" aria-hidden />
              Мини-проверка блока
            </Badge>
          ) : (
            <Badge variant="secondary" className="font-semibold">
              Практика
            </Badge>
          )}
        </div>
      </header>

      {/* Концепция */}
      <div className="space-y-4">
        {lesson.concept.map((item, i) => (
          <ConceptItemView key={i} item={item} />
        ))}
      </div>

      {/* Кейс */}
      {lesson.case && (
        <Card className="border-blue-200/80 bg-gradient-to-br from-blue-50/80 to-white py-0 shadow-sm">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="flex items-center gap-2 font-head text-[15px] font-bold">
              <BriefcaseBusiness className="size-4.5 text-blue-600" aria-hidden />
              Разбор кейса из практики
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3.5 px-5 pb-5">
            <p className="text-[14.5px] leading-relaxed text-foreground/90">{lesson.case.intro}</p>
            <ol className="space-y-2.5">
              {lesson.case.steps.map((s, i) => (
                <li key={i} className="flex gap-3 text-[14px] leading-relaxed">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-blue-600 font-head text-[11px] font-extrabold text-white">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
            <div className="flex gap-2.5 rounded-lg bg-blue-50 px-3.5 py-3 text-[13px] leading-relaxed text-blue-900">
              <Lightbulb className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden />
              <span>{lesson.case.note}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Практика */}
      {lesson.practice.length > 0 && (
        <section aria-label="Практика">
          <div className="mb-3 flex items-center gap-2">
            <ListChecks className="size-4.5 text-primary" aria-hidden />
            <h2 className="font-head text-lg font-extrabold tracking-tight">
              {lesson.isCheck ? "Мини-проверка блока" : "Практика"}
              <span className="ml-2 align-middle text-[12px] font-semibold text-muted-foreground">
                {lesson.practice.length} вопросов · порог {passScore}%
              </span>
            </h2>
          </div>
          <Quiz
            lessonId={lesson.id}
            questions={lesson.practice}
            isCheck={!!lesson.isCheck}
            passScore={passScore}
            onPassed={(score) => setQuizPassedScore(score)}
          />
        </section>
      )}

      {/* Резюме */}
      <Card className="border-border/80 py-0 shadow-sm">
        <CardHeader className="px-5 pt-5 pb-2">
          <CardTitle className="flex items-center gap-2 font-head text-[15px] font-bold">
            <CircleCheckBig className="size-4.5 text-emerald-500" aria-hidden />
            Запомните
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <ul className="space-y-2.5">
            {lesson.summary.map((s, i) => (
              <li key={i} className="flex gap-2.5 text-[14px] leading-relaxed text-foreground/90">
                <CircleCheckBig className="mt-0.5 size-4 shrink-0 text-emerald-500" aria-hidden />
                {s}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Футер: зачёт + навигация */}
      <footer className="flex flex-col gap-4 border-t border-border/80 pt-5">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={toggleComplete}
            disabled={busy || (lesson.isCheck && !completed && !passed)}
            variant={completed ? "outline" : "default"}
            className={cn(!completed && "bg-gradient-to-r from-blue-600 to-blue-500 shadow-md shadow-blue-600/25")}
          >
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {completed ? (
              <>
                <CircleCheckBig className="size-4 text-emerald-500" aria-hidden />
                Занятие зачтено
              </>
            ) : lesson.isCheck && !passed ? (
              "Для зачёта пройдите мини-проверку"
            ) : (
              "Отметить занятие пройденным"
            )}
          </Button>
          {lesson.isCheck && !passed && (
            <p className="text-[12.5px] text-muted-foreground">
              Мини-проверка засчитывается при результате от {passScore}%.
            </p>
          )}
        </div>

        <nav className="grid gap-2.5 sm:grid-cols-2" aria-label="Навигация по занятиям">
          {prev ? (
            <Link
              href={`/lesson/${prev.id}`}
              className="group flex items-center gap-3 rounded-xl border border-border/80 bg-card px-4 py-3 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
            >
              <ArrowLeft className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5" aria-hidden />
              <span className="min-w-0">
                <span className="block text-[11px] text-muted-foreground">Предыдущее</span>
                <span className="block truncate text-[13px] font-semibold">
                  {prev.id}. {prev.title}
                </span>
              </span>
            </Link>
          ) : (
            <span aria-hidden />
          )}
          {next && (
            <Link
              href={`/lesson/${next.id}`}
              className="group flex items-center justify-end gap-3 rounded-xl border border-border/80 bg-card px-4 py-3 text-right shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
            >
              <span className="min-w-0">
                <span className="block text-[11px] text-muted-foreground">Следующее</span>
                <span className="block truncate text-[13px] font-semibold">
                  {next.id}. {next.title}
                </span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          )}
        </nav>
      </footer>
    </article>
  );
}
