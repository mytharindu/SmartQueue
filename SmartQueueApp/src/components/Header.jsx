import { Link, useNavigate } from "react-router-dom";
import { Bell, UserCircle2, Menu, LogOut } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function Header({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

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

      {user ? (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
            <UserCircle2 className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium">{user.username}</span>
            <Badge variant="secondary" className="text-[10px] capitalize">
              {user.role.replace("-", " ")}
            </Badge>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sign out"
            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <Link to="/login">
          <Button size="sm" variant="outline">
            Staff sign in
          </Button>
        </Link>
      )}
    </header>
  );
}
