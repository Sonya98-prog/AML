// Локальное хранилище прогресса (localStorage браузера).
// Статическая версия платформы: без сервера и аккаунтов.
// Прогресс живёт в том браузере, на том устройстве, где учится человек.

export type QuizRecord = {
  lessonId: string;
  correct: number;
  total: number;
  score: number;
  at: string; // ISO-дата
};

export type ProgressState = {
  name: string;
  passed: string[]; // id зачтённых занятий
  quizzes: QuizRecord[];
};

const KEY = "aml-academy-progress-v1";

const EMPTY: ProgressState = { name: "", passed: [], quizzes: [] };

export function loadState(): ProgressState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      name: typeof parsed.name === "string" ? parsed.name : "",
      passed: Array.isArray(parsed.passed) ? parsed.passed.filter((x) => typeof x === "string") : [],
      quizzes: Array.isArray(parsed.quizzes)
        ? parsed.quizzes.filter(
            (q): q is QuizRecord =>
              !!q && typeof q.lessonId === "string" && typeof q.score === "number" && typeof q.correct === "number" && typeof q.total === "number"
          )
        : [],
    };
  } catch {
    return { ...EMPTY };
  }
}

export function saveState(state: ProgressState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // приватный режим / переполнение — тихо игнорируем
  }
}

export function isPassed(lessonId: string): boolean {
  return loadState().passed.includes(lessonId);
}

export function bestScoreFor(lessonId: string): number | null {
  const scores = loadState()
    .quizzes.filter((q) => q.lessonId === lessonId)
    .map((q) => q.score);
  return scores.length > 0 ? Math.max(...scores) : null;
}

export function togglePassed(lessonId: string, done: boolean): void {
  const s = loadState();
  const has = s.passed.includes(lessonId);
  if (done && !has) s.passed.push(lessonId);
  if (!done && has) s.passed = s.passed.filter((id) => id !== lessonId);
  saveState(s);
}

export function addQuiz(rec: QuizRecord): void {
  const s = loadState();
  s.quizzes.push(rec);
  saveState(s);
}

export function setName(name: string): void {
  const s = loadState();
  s.name = name.trim().slice(0, 60);
  saveState(s);
}
