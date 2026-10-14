"use client";

import { useEffect, useState } from "react";
import { Download, Loader2, RefreshCcw, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/academy/progress-ring";
import { cn } from "@/lib/utils";
import type { TeamMember } from "@/app/api/team/route";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function exportCsv(members: TeamMember[]) {
  const head = ["Имя", "Email", "Роль", "Зачтено уроков", "Прогресс %", "Попыток тестов", "Средний балл %", "Последняя активность", "Последнее занятие"];
  const rows = members.map((m) => [
    m.name,
    m.email,
    m.role === "mentor" ? "ментор" : "участник",
    `${m.completed}/${m.total}`,
    String(m.percent),
    String(m.attempts),
    String(m.avgScore),
    m.lastActivity ? new Date(m.lastActivity).toLocaleString("ru-RU") : "",
    m.lastLessonTitle ?? "",
  ]);
  const csv = "\uFEFF" + [head, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(";")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "aml-academy-progress.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function TeamView() {
  const [members, setMembers] = useState<TeamMember[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setBusy(true);
    try {
      const res = await fetch("/api/team");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Не удалось загрузить данные");
        return;
      }
      setMembers(data.members);
      setError(null);
    } catch {
      setError("Сервер недоступен");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="fade-up">
          <h1 className="font-head text-2xl font-extrabold tracking-tight">Прогресс команды</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Индивидуальная статистика каждого участника: зачтённые занятия, результаты тестов и активность.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <RefreshCcw className="size-4" aria-hidden />}
            Обновить
          </Button>
          <Button variant="outline" size="sm" onClick={() => members && exportCsv(members)} disabled={!members?.length}>
            <Download className="size-4" aria-hidden />
            CSV
          </Button>
        </div>
      </header>

      {error && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      {!members && !error && (
        <div className="grid place-items-center rounded-xl border border-border/80 bg-card py-16 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" aria-hidden />
        </div>
      )}

      {members && members.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card px-5 py-8 text-center text-sm text-muted-foreground">
          Пока никто не зарегистрировался.
        </div>
      )}

      <ul className="space-y-3">
        {members?.map((m) => (
          <li key={m.id} className="rounded-xl border border-border/80 bg-card p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3.5">
                <span
                  className={cn(
                    "grid size-11 shrink-0 place-items-center rounded-full font-head text-sm font-extrabold text-white",
                    m.role === "mentor"
                      ? "bg-gradient-to-br from-blue-600 to-blue-500 shadow-md shadow-blue-600/30"
                      : "bg-gradient-to-br from-slate-400 to-slate-500"
                  )}
                >
                  {m.role === "mentor" ? <ShieldCheck className="size-5" aria-hidden /> : <UserRound className="size-5" aria-hidden />}
                </span>
                <div className="min-w-0 leading-tight">
                  <p className="truncate font-head text-[15px] font-bold">
                    {m.name}
                    {m.role === "mentor" && (
                      <span className="ml-2 rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-secondary-foreground">
                        ментор
                      </span>
                    )}
                  </p>
                  <p className="truncate text-[12px] text-muted-foreground">{m.email}</p>
                  <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                    Активность: {formatDate(m.lastActivity)}
                    {m.lastLessonTitle && <> · {m.lastLessonTitle}</>}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <ProgressRing percent={m.percent} size={64} stroke={7} />
                <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-center sm:text-left">
                  <div>
                    <p className="font-head text-[15px] font-extrabold">
                      {m.completed}
                      <span className="text-[11px] font-semibold text-muted-foreground">/{m.total}</span>
                    </p>
                    <p className="text-[10.5px] text-muted-foreground">занятий</p>
                  </div>
                  <div>
                    <p className="font-head text-[15px] font-extrabold">{m.attempts}</p>
                    <p className="text-[10.5px] text-muted-foreground">попыток</p>
                  </div>
                  <div>
                    <p className={cn("font-head text-[15px] font-extrabold", m.avgScore >= 70 ? "text-emerald-600" : m.avgScore > 0 ? "text-amber-600" : "")}>
                      {m.avgScore ? `${m.avgScore}%` : "—"}
                    </p>
                    <p className="text-[10.5px] text-muted-foreground">средний</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Полоски по блокам */}
            <div className="mt-4 grid grid-cols-7 gap-1.5" aria-label="Прогресс по блокам">
              {m.blockPercents.map((p, i) => (
                <div key={i} title={`Блок ${i + 1}: ${p}%`}>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full", p === 100 ? "bg-emerald-500" : "bg-gradient-to-r from-blue-600 to-sky-400")}
                      style={{ width: `${p}%` }}
                    />
                  </div>
                  <p className="mt-1 text-center text-[9.5px] font-medium text-muted-foreground">{i + 1}</p>
                </div>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
