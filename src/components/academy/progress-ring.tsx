import { cn } from "@/lib/utils";

export function ProgressRing({
  percent,
  size = 120,
  stroke = 10,
  label,
  className,
}: {
  percent: number;
  size?: number;
  stroke?: number;
  label?: string;
  className?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = c - (clamped / 100) * c;
  const gid = `ring-${size}-${Math.round(clamped)}`;

  return (
    <div className={cn("relative inline-grid place-items-center", className)} role="img" aria-label={`Прогресс ${clamped}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(37,99,235,.14)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset .8s cubic-bezier(.22,1,.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center leading-none">
        <div>
          <div className={cn("font-head font-extrabold", size >= 100 ? "text-2xl" : "text-lg")}>{clamped}%</div>
          {label && <div className="mt-1 text-[11px] font-medium text-muted-foreground">{label}</div>}
        </div>
      </div>
    </div>
  );
}
