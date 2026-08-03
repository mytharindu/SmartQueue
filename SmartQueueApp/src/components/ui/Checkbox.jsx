import { forwardRef } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const Checkbox = forwardRef(function Checkbox(
  { className, checked, onCheckedChange, ...props },
  ref,
) {
  return (
    <span className={cn("relative inline-flex h-4 w-4 shrink-0", className)}>
      <input
        ref={ref}
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-input bg-card transition-colors checked:border-primary checked:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        {...props}
      />
      {checked && (
        <Check className="pointer-events-none absolute inset-0 m-auto h-3 w-3 text-primary-foreground" />
      )}
    </span>
  );
});