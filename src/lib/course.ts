import data from "@/content/course-data.json";

// --- Типы контента (структура из платформы COMITA AML) ---
export type TableBlock = { table: { head: string[]; rows: string[][] } };
export type ListBlock = { list: string[] };
export type CalloutBlock = { callout: { kind: "info" | "warn"; title?: string; text: string } };
export type FigBlock = { fig: string; cap: string };
export type ConceptItem = string | TableBlock | ListBlock | CalloutBlock | FigBlock;

export type PracticeOption = { t: string; ok?: boolean; fb: string };
export type PracticeQuestion = { q: string; opts: PracticeOption[] };

export type Lesson = {
  id: string;
  title: string;
  released: boolean;
  concept: ConceptItem[];
  case?: { intro: string; steps: string[]; note: string };
  practice: PracticeQuestion[];
  summary: string[];
  isCheck?: boolean;
};

export type Block = { id: string; title: string; subtitle?: string; released: boolean; lessons: Lesson[] };

export type GlossaryTerm = { t: string; d: string; s?: string };
export type DocItem = string | { t: string; d?: string };

export const COURSE = data.course as unknown as Block[];
export const GLOSSARY = data.glossary as unknown as GlossaryTerm[];
export const DOCS = data.docs as unknown as DocItem[];

export const ALL_LESSONS: Lesson[] = COURSE.flatMap((b) => b.lessons);
export const RELEASED_LESSONS = ALL_LESSONS.filter((l) => l.released);
export const TOTAL_LESSONS = RELEASED_LESSONS.length;
export const TOTAL_QUESTIONS = RELEASED_LESSONS.reduce((n, l) => n + l.practice.length, 0);

export function getLesson(id: string): Lesson | undefined {
  return ALL_LESSONS.find((l) => l.id === id);
}

export function getBlockOf(lessonId: string): Block | undefined {
  return COURSE.find((b) => b.lessons.some((l) => l.id === lessonId));
}

export function lessonIndex(id: string): number {
  return ALL_LESSONS.findIndex((l) => l.id === id);
}

export function neighborLessons(id: string): { prev: Lesson | null; next: Lesson | null } {
  const i = lessonIndex(id);
  return {
    prev: i > 0 ? ALL_LESSONS[i - 1] : null,
    next: i >= 0 && i < ALL_LESSONS.length - 1 ? ALL_LESSONS[i + 1] : null,
  };
}

export function lessonTitle(id: string): string {
  return getLesson(id)?.title ?? id;
}

export function blockNumber(lessonId: string): number {
  return COURSE.findIndex((b) => b.lessons.some((l) => l.id === lessonId)) + 1;
}

export const PASS_SCORE = 70; // порог зачёта мини-проверки блока, %

// Порог зачёта: для мини-проверки блока — 70%, для обычной практики — 60%
export function passScoreFor(lesson: Lesson): number {
  return lesson.isCheck ? PASS_SCORE : 60;
}

// Рекомендуемый следующий урок: первый незачтённый из выпущенных
export function nextLessonId(completedIds: Set<string>): string | null {
  return RELEASED_LESSONS.find((l) => !completedIds.has(l.id))?.id ?? null;
}
