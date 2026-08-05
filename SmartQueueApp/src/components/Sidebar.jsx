import { NavLink, Link } from "react-router-dom";
import {
  Home,
  CalendarPlus,
  Ticket,
  MonitorPlay,
  UserCog,
  BarChart3,
  ShieldCheck,
  ChevronsLeft,
  ChevronsRight,
  Trello,
  Zap,
  Clock,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const citizenItems = [
  { to: "/", label: "Overview", icon: Home, end: true },
  { to: "/book", label: "Book Appointment", icon: CalendarPlus },
  { to: "/my-tokens", label: "My Tokens", icon: Ticket },
  { to: "/live", label: "Live Queue", icon: MonitorPlay },
];

const staffItems = [
  { to: "/officer", label: "Officer Panel", icon: UserCog },
  { to: "/admin", label: "Admin Analytics", icon: BarChart3 },
  { to: "/departments", label: "Departments", icon: Building2 },
  { to: "/services", label: "Services", icon: Zap },
  { to: "/counters", label: "Counters", icon: Trello },
];

const settingsItems = [
  { to: "/time-slots", label: "Time Slots", icon: Clock },
];

function NavGroup({ label, items, collapsed }) {
  return (
    <div className="px-2">
      {!collapsed && (
        <p className="px-3 pb-1.5 pt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      )}
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60",
                  collapsed && "justify-center",
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-out",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center justify-between border-b border-sidebar-border px-3 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-hero shadow-glow">
            <ShieldCheck className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="font-display text-sm font-bold text-sidebar-foreground">
                eGov Queue
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Sri Lanka
              </span>
            </div>
          )}
        </Link>
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground md:inline-flex"
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        <NavGroup label="Citizen" items={citizenItems} collapsed={collapsed} />
        <NavGroup label="Staff" items={staffItems} collapsed={collapsed} />
        <NavGroup label="Configuration" items={settingsItems} collapsed={collapsed} />
      </nav>

      <div className="border-t border-sidebar-border p-3">
        {!collapsed ? (
          <div className="rounded-lg bg-gradient-hero p-3 text-primary-foreground shadow-glow">
            <p className="text-xs font-semibold">Demo Mode</p>
            <p className="mt-0.5 text-[11px] opacity-90">Sample data for presentation</p>
          </div>
        ) : (
          <div className="flex h-9 items-center justify-center rounded-lg bg-gradient-hero text-primary-foreground shadow-glow">
            <ShieldCheck className="h-4 w-4" />
          </div>
        )}
      </div>
    </aside>
  );
}