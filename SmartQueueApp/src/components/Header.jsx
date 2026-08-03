import { Bell, UserCircle2, Menu } from "lucide-react";

export function Header({ onToggleSidebar }) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>

      <div className="flex-1" />

      <button
        type="button"
        aria-label="Notifications"
        className="relative rounded-full p-2 text-foreground hover:bg-muted"
      >
        <Bell className="h-4 w-4" />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
      </button>

      <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
        <UserCircle2 className="h-4 w-4 text-primary" />
        <span className="text-xs font-medium">A. Perera</span>
      </div>
    </header>
  );
}