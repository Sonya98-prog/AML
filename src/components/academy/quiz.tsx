"use client";

import { useMemo, useState } from "react";
import { CircleCheck, RotateCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { addQuiz } from "@/lib/progress-store";
import type { PracticeQuestion } from "@/lib/course";

function shuffle(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function Quiz({
  lessonId,
  questions,
  isCheck,
  passScore,
  onPassed,
}: {
  lessonId: string;
  questions: PracticeQuestion[];
  isCheck: boolean;
  passScore: number;
  onPassed?: (score: number) => void;
}) {
  const [orders, setOrders] = useState<number[][]>(() => questions.map((q) => shuffle(q.opts.length)));
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [checked, setChecked] = useState<boolean[]>(() => questions.map(() => false));
  const [finished, setFinished] = useState(false);

  const allChecked = checked.every(Boolean);
  const correctCount = useMemo(
    () => questions.reduce((n, q, i) => (q.opts[orders[i][answers[i] ?? -1]]?.ok ? n + 1 : n), 0),
    [questions, orders, answers]
  );
  const score = Math.round((correctCount / questions.length) * 100);
  const passed = score >= passScore;

  function finish() {
    addQuiz({ lessonId, correct: correctCount, total: questions.length, score, at: new Date().toISOString() });
    setFinished(true);
    toast({
      title: isCheck ? "Мини-проверка сохранена" : "Результат практики сохранён",
      description: `${score}% · ${passed ? "зачтено" : `порог ${passScore}% не достигнут — можно пройти ещё раз`}`,
    });
    if (passed) onPassed?.(score);
  }

  function retake() {
    setOrders(questions.map((q) => shuffle(q.opts.length)));
    setAnswers(questions.map(() => null));
    setChecked(questions.map(() => false));
    setFinished(false);
  }

  return (
    <div className="space-y-4">
      <ol className="space-y-4">
        {questions.map((q, qi) => {
          const isChecked = checked[qi];
          const selected = answers[qi];
          const isRight = isChecked && selected !== null && q.opts[orders[qi][selected]]?.ok;
          return (
            <li
              key={qi}
              className={cn(
                "rounded-xl border bg-card p-4 shadow-sm transition-colors sm:p-5",
                isChecked ? (isRight ? "border-emerald-300" : "border-red-300") : "border-border"
              )}
            >
              <p className="flex gap-2.5 text-[14.5px] font-semibold leading-snug">
                <span className="grid size-6 shrink-0 place-items-center rounded-md bg-secondary font-head text-xs font-extrabold text-secondary-foreground">
                  {qi + 1}
                </span>
                {q.q}
              </p>

              <div className="mt-3 space-y-2" role="radiogroup" aria-label={`Вопрос ${qi + 1}`}>
                {orders[qi].map((optIdx, pos) => {
                  const opt = q.opts[optIdx];
                  const isSelected = selected === pos;
                  const revealRight = isChecked && opt.ok;
                  const revealWrong = isChecked && isSelected && !opt.ok;
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      disabled={isChecked}
                      onClick={() => setAnswers((a) => a.map((v, i) => (i === qi ? pos : v)))}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-lg border px-3.5 py-2.5 text-left text-[13.5px] leading-snug transition-all",
                        !isChecked && "hover:border-primary/50 hover:bg-secondary/50",
                        !isChecked && isSelected && "border-primary bg-secondary ring-2 ring-primary/20",
                        isChecked && "cursor-default opacity-70",
                        revealRight && "border-emerald-400 bg-emerald-50 opacity-100 text-emerald-900",
                        revealWrong && "border-red-400 bg-red-50 opacity-100 text-red-900"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-full border-2",
                          revealRight ? "border-emerald-500" : revealWrong ? "border-red-500" : isSelected ? "border-primary" : "border-input"
                        )}
                      >
                        {(isSelected || revealRight) && (
                          <span
                            className={cn(
                              "size-2 rounded-full",
                              revealRight ? "bg-emerald-500" : revealWrong ? "bg-red-500" : "bg-primary"
                            )}
                          />
                        )}
                      </span>
                      {opt.t}
                    </button>
                  );
                })}
              </div>

              {!isChecked ? (
                <Button
                  size="sm"
                  className="mt-3"
                  disabled={selected === null}
                  onClick={() => setChecked((c) => c.map((v, i) => (i === qi ? true : v)))}
                >
                  Ответить
                </Button>
              ) : (
                <div
                  className={cn(
                    "mt-3 flex gap-2.5 rounded-lg px-3.5 py-3 text-[13px] leading-relaxed",
                    isRight ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-900"
                  )}
                >
                  {isRight ? (
                    <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
                  ) : (
                    <RotateCcw className="mt-0.5 size-4 shrink-0 text-red-500" aria-hidden />
                  )}
                  <span>{q.opts[orders[qi][selected ?? -1]]?.fb}</span>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {allChecked && !finished && (
        <div className="fade-up flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-head text-base font-extrabold">
              Результат: {correctCount} из {questions.length} · {score}%
            </p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              {passed ? "Порог пройден — результат будет сохранён." : `Для зачёта нужен порог ${passScore}%.`}
            </p>
          </div>
          <Button onClick={finish}>
            Сохранить результат
          </Button>
        </div>
      )}

      {finished && (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className={cn("font-head text-base font-extrabold", passed ? "text-emerald-600" : "text-amber-600")}>
              {passed ? "Тест засчитан" : "Не зачтено — но это нормально"}
            </p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              {isCheck
                ? "Мини-проверка блока: перечитайте фидбек к вопросам и попробуйте снова."
                : "Разберите фидбек к вопросам — там главное. Варианты перемешаются при новой попытке."}
            </p>
          </div>
          <Button variant="outline" onClick={retake}>
            <RotateCcw className="size-4" aria-hidden />
            Пройти ещё раз
          </Button>
        </div>
      )}
    </div>
  );
}
