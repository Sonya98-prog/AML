"use client";

// Прогресс обучения хранится в браузере (localStorage) — без сервера и аккаунтов.
// Работает на любом статическом хостинге (GitHub Pages и т.п.).
// Важно: прогресс привязан к браузеру на конкретном устройстве.

export type StoredAttempt = {
  lessonId: string;
  correct: number;
  total: number;
  score: number; // процент 0–100
  createdAt: string; // ISO-дата
};

type Store = {
  completed: Record<string, string>; // lessonId -> дата зачёта (ISO)
  attempts: StoredAttempt[];
};

const KEY = "amlAcademyProgressV2";
const MAX_ATTEMPTS = 60;

function emptyStore(): Store {
  return { completed: {}, attempts: [] };
}

function readStore(): Store {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      completed: parsed.completed && typeof parsed.completed === "object" ? parsed.completed : {},
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
    };
  } catch {
    return emptyStore();
  }
}

function writeStore(store: Store) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // хранилище недоступно (например, режим инкогнито с запретом) — просто игнорируем
  }
}

export function getCompletedIds(): string[] {
  return Object.keys(readStore().completed);
}

export function isLessonCompleted(lessonId: string): boolean {
  return lessonId in readStore().completed;
}

export function setLessonCompleted(lessonId: string, done: boolean) {
  const store = readStore();
  if (done) {
    store.completed[lessonId] = new Date().toISOString();
  } else {
    delete store.completed[lessonId];
  }
  writeStore(store);
}

export function getBestScore(lessonId: string): number | null {
  const attempts = readStore().attempts.filter((a) => a.lessonId === lessonId);
  if (attempts.length === 0) return null;
  return attempts.reduce((best, a) => Math.max(best, a.score), 0);
}

export function saveAttempt(lessonId: string, correct: number, total: number): StoredAttempt {
  const attempt: StoredAttempt = {
    lessonId,
    correct,
    total,
    score: total > 0 ? Math.round((correct / total) * 100) : 0,
    createdAt: new Date().toISOString(),
  };
  const store = readStore();
  store.attempts.push(attempt);
  if (store.attempts.length > MAX_ATTEMPTS) {
    store.attempts = store.attempts.slice(-MAX_ATTEMPTS);
  }
  writeStore(store);
  return attempt;
}

export function getRecentAttempts(limit = 5): StoredAttempt[] {
  return readStore()
    .attempts.slice()
    .reverse()
    .slice(0, limit);
}

/** Полный сброс прогресса в этом браузере (для кнопки «Сбросить прогресс»). */
export function resetAllProgress() {
  writeStore(emptyStore());
}
