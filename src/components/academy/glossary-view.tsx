"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { GlossaryTerm } from "@/lib/course";

export function GlossaryView({ terms, totals }: { terms: GlossaryTerm[]; totals: { lessons: number; questions: number } }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return terms;
    return terms.filter((t) => t.t.toLowerCase().includes(q) || t.d.toLowerCase().includes(q));
  }, [terms, query]);

  return (
    <div className="space-y-5">
      <header className="fade-up">
        <h1 className="font-head text-2xl font-extrabold tracking-tight">Глоссарий</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {terms.length} терминов курса. Каждый термин сверён с материалами АО «Комита»: лэндинг продукта, документация, НПА.
        </p>
      </header>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по терминам и определениям…"
          className="h-11 pl-10"
          aria-label="Поиск по глоссарию"
        />
      </div>

      <p className="text-[12.5px] text-muted-foreground" role="status">
        Найдено: {filtered.length} из {terms.length}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-5 py-8 text-center text-sm text-muted-foreground">
          Ничего не нашлось. Попробуйте другой запрос — например, «мигратор» или «7081-У».
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {filtered.map((term, i) => (
            <li
              key={term.t}
              className={cn(
                "fade-up rounded-xl border border-border/80 bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
              )}
              style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-head text-[14.5px] font-bold leading-snug">{term.t}</h2>
                {term.s === "ok" && (
                  <span title="Подтверждено материалами" className="shrink-0">
                    <BadgeCheck className="size-4.5 text-emerald-500" aria-label="Подтверждено материалами" />
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{term.d}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
