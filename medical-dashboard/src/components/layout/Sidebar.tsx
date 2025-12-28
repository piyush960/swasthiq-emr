import { NavLink, useLocation } from "react-router-dom";
import {
  Search,
  LayoutDashboard,
  DollarSign,
  Users,
  FileText,
  Pill,
  Settings,
  Calendar,
  Stethoscope,
  Plus,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Hospital,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, path: "/", label: "Dashboard" },
  { icon: Calendar, path: "/calendar", label: "Calendar" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo Area */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-3">
          {!collapsed && 
          <><div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary">
          <Hospital className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold text-foreground">MedCare</span></>
          }
        </div>
        <button 
          onClick={onToggle}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            collapsed && "border border-border bg-card shadow-sm absolute right-6"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className={cn("flex flex-1 flex-col gap-1 py-4", collapsed ? "items-center px-2" : "px-3")}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl transition-all duration-200",
                collapsed ? "h-12 w-12 justify-center" : "h-11 px-3",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <span className="absolute left-full ml-3 hidden rounded-lg bg-foreground px-2 py-1 text-xs font-medium text-background group-hover:block">
                  {item.label}
                </span>
              )}
              {/* Active indicator */}
              {isActive && !collapsed && (
                <span className="absolute -left-[2px] top-1/2 h-6 w-1 -translate-y-1/2 bg-primary" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Settings at bottom */}
      <div className={cn("flex flex-col gap-2 border-t border-border py-4", collapsed ? "items-center px-2" : "px-3")}>
        <NavLink
          to="/settings"
          className={cn(
            "flex items-center gap-3 rounded-xl transition-colors",
            collapsed ? "h-12 w-12 justify-center" : "h-11 px-3",
            location.pathname === "/settings"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Settings</span>}
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
