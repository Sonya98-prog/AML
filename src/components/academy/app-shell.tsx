"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, GraduationCap, House, LogOut, Menu, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export type ShellUser = { name: string; email: string; role: string };

const NAV = [
  { href: "/", label: "Главная", icon: House },
  { href: "/glossary", label: "Глоссарий", icon: BookOpenText },
  { href: "/about", label: "О курсе", icon: GraduationCap },
] as const;

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-900/40">
        <svg viewBox="0 0 24 24" className="size-5.5" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 2 4 5.5v5.1c0 5 3.4 9.3 8 10.4 4.6-1.1 8-5.4 8-10.4V5.5L12 2Z" fill="rgba(255,255,255,.18)" />
          <path d="m9 11.8 2.2 2.2L15.5 9.5" />
        </svg>
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block font-head text-[15px] font-extrabold tracking-tight text-white">AML Академия</span>
          <span className="block text-[11px] text-slate-400">COMITA AML · АО «Комита»</span>
        </span>
      )}
    </div>
  );
}

function NavLinks({ user, onNavigate }: { user: ShellUser; onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = [...NAV];
  if (user.role === "mentor") items.splice(1, 0, { href: "/team", label: "Команда", icon: Users } as const);

  return (
    <nav className="flex flex-col gap-1" aria-label="Основная навигация">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
              active
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-950/50"
                : "text-slate-300 hover:bg-white/8 hover:text-white"
            )}
          >
            <Icon className="size-4.5 shrink-0" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function UserCard({ user }: { user: ShellUser }) {
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } finally {
      setBusy(false);
    }
  }

  const initials = user.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-xs font-bold text-white">
          {initials}
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[13px] font-semibold text-white">{user.name}</p>
          <p className="truncate text-[11px] text-slate-400">
            {user.role === "mentor" ? "Ментор курса" : "Участник курса"}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={logout}
          disabled={busy}
          className="size-8 shrink-0 text-slate-400 hover:bg-white/10 hover:text-white"
          aria-label="Выйти"
          title="Выйти"
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function AppShell({ user, children }: { user: ShellUser; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Сайдбар — десктоп */}
      <aside className="sidebar-gradient fixed inset-y-0 left-0 z-40 hidden w-64 flex-col justify-between p-4 lg:flex">
        <div>
          <div className="px-1.5 pb-6 pt-1">
            <Logo />
          </div>
          <NavLinks user={user} />
        </div>
        <UserCard user={user} />
      </aside>

      {/* Мобильная шапка */}
      <header className="sidebar-gradient sticky top-0 z-40 flex items-center justify-between px-4 py-3 lg:hidden">
        <Logo />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" aria-label="Открыть меню">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" aria-describedby={undefined} className="sidebar-gradient w-72 border-white/10 p-4">
            <SheetTitle className="sr-only">Меню</SheetTitle>
            <div className="flex h-full flex-col justify-between">
              <div>
                <div className="px-1.5 pb-6 pt-1">
                  <Logo />
                </div>
                <NavLinks user={user} onNavigate={() => setOpen(false)} />
              </div>
              <UserCard user={user} />
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
