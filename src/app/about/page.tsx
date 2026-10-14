import { redirect } from "next/navigation";
import { BookMarked, GraduationCap, MessagesSquare, ShieldCheck, Target } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { AppShell } from "@/components/academy/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DOCS, GLOSSARY, TOTAL_LESSONS, TOTAL_QUESTIONS } from "@/lib/course";

const RULES = [
  {
    icon: ShieldCheck,
    title: "Истина — в материалах",
    text: "Факты о продукте берём только из документации и лэндинга АО «Комита». Всё, что не подтверждено, помечается как «требует проверки» — такие формулировки нельзя озвучивать заказчикам.",
  },
  {
    icon: MessagesSquare,
    title: "Разговор на языке разработчика",
    text: "Мы — АО «Комита»: сами разрабатываем, продаём и сопровождаем COMITA AML. Поэтому внутренние пробелы — это вопросы коллегам, а не «выясним у вендора».",
  },
  {
    icon: Target,
    title: "Практика важнее теории",
    text: "В каждом занятии — разбор кейса из практики и тест с фидбеком. Мини-проверка блока засчитывается при результате от 70%.",
  },
];

export default async function AboutPage() {
  const user = await getSessionUser();
  if (!user) redirect("/");

  return (
    <AppShell user={{ name: user.name, email: user.email, role: user.role }}>
      <div className="space-y-5">
        <header className="fade-up">
          <h1 className="font-head text-2xl font-extrabold tracking-tight">О курсе</h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Программа рассчитана на продуктовых аналитиков и руководителей продукта COMITA AML: от нормативной базы
            ПОД/ФТ до сопровождения внедрений и разговоров с заказчиками. Формат — размеренный: {TOTAL_LESSONS} занятий,
            каждое по 20–30 минут.
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            [TOTAL_LESSONS, "занятий в 7 блоках"],
            [TOTAL_QUESTIONS, "вопросов с разбором"],
            [GLOSSARY.length, "терминов в глоссарии"],
          ].map(([v, l]) => (
            <Card key={l as string} className="py-0 shadow-sm">
              <CardContent className="px-5 py-4">
                <p className="font-head text-2xl font-extrabold">{v as number}</p>
                <p className="text-[12px] text-muted-foreground">{l as string}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <section aria-label="Как устроено обучение">
          <h2 className="mb-3 flex items-center gap-2 font-head text-lg font-extrabold tracking-tight">
            <GraduationCap className="size-4.5 text-primary" aria-hidden />
            Как устроено обучение
          </h2>
          <div className="grid gap-3 md:grid-cols-3">
            {RULES.map(({ icon: Icon, title, text }) => (
              <Card key={title} className="py-0 shadow-sm">
                <CardHeader className="px-5 pt-5 pb-2">
                  <CardTitle className="flex items-center gap-2 font-head text-[14px] font-bold">
                    <Icon className="size-4.5 text-primary" aria-hidden />
                    {title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 text-[13px] leading-relaxed text-muted-foreground">{text}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section aria-label="Источники">
          <h2 className="mb-3 flex items-center gap-2 font-head text-lg font-extrabold tracking-tight">
            <BookMarked className="size-4.5 text-primary" aria-hidden />
            Источники ({DOCS.length})
          </h2>
          <Card className="py-0 shadow-sm">
            <CardContent className="px-5 py-4">
              <ul className="divide-y divide-border/70">
                {DOCS.map((d, i) => (
                  <li key={i} className="py-2.5 first:pt-0 last:pb-0">
                    <p className="text-[13.5px] font-semibold">{d.t}</p>
                    {"d" in d && d.d && <p className="text-[12px] text-muted-foreground">{d.d}</p>}
                  </li>
                ))}
              </ul>
              <p className="mt-3 rounded-lg bg-secondary/70 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-secondary-foreground">
                Материалы доступны у команды разработки. Если какого-то документа у вас нет — запросите у коллег,
                отвечающих за продукт.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
