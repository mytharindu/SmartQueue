import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const variants = {
  default:
    "bg-primary text-primary-foreground hover:bg-primary/90 shadow-card",
  outline:
    "border border-input bg-background hover:bg-accent/10 hover:text-accent-foreground",
  ghost: "hover:bg-muted text-foreground",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
};

const sizes = {
  default: "h-10 px-4 py-2 text-sm",
  sm: "h-8 px-3 text-xs",
  lg: "h-11 px-6 text-base",
  icon: "h-9 w-9",
};

export const Button = forwardRef(function Button(
  { className, variant = "default", size = "default", type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
});