import { cn } from "@/lib/utils";

export function Progress({ value = 0, className }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted", className)}
    >
      <div
        className="h-full rounded-full bg-gradient-hero transition-all"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}