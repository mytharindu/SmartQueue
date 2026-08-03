import { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";

const TabsContext = createContext(null);

export function Tabs({ defaultValue, value, onValueChange, className, children }) {
  const [internal, setInternal] = useState(defaultValue);
  const active = value ?? internal;
  const setActive = (v) => {
    if (value === undefined) setInternal(v);
    onValueChange?.(v);
  };
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children }) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, className, children }) {
  const ctx = useContext(TabsContext);
  const isActive = ctx.active === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => ctx.setActive(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive
          ? "bg-card text-foreground shadow-card"
          : "hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className, children }) {
  const ctx = useContext(TabsContext);
  if (ctx.active !== value) return null;
  return (
    <div role="tabpanel" className={cn("mt-2 focus-visible:outline-none", className)}>
      {children}
    </div>
  );
}