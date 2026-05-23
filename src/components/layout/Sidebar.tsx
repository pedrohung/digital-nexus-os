import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Search, Star, Megaphone, PenSquare, Mail,
  BarChart3, Bot, Settings, LogOut, ChevronLeft, ChevronRight, Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const nav = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/seo", icon: Search, label: "SEO" },
  { to: "/reputation", icon: Star, label: "Reputación" },
  { to: "/ads", icon: Megaphone, label: "Publicidad" },
  { to: "/content", icon: PenSquare, label: "Contenido" },
  { to: "/email", icon: Mail, label: "Email" },
  { to: "/analytics", icon: BarChart3, label: "ROI" },
  { to: "/copilot", icon: Bot, label: "AI Co-Pilot" },
  { to: "/settings", icon: Settings, label: "Ajustes" },
] as const;

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  userEmail: string;
  userId: string;
}

export function Sidebar({ collapsed, onToggle, userEmail }: Props) {
  const { location } = useRouterState();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Sesión cerrada");
  };

  return (
    <aside
      className={`${collapsed ? "w-16" : "w-60"} shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col h-screen sticky top-0 transition-all duration-200`}
    >
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2 font-bold text-sidebar-foreground">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-brand">NEXUS360</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1 rounded hover:bg-accent/10 text-muted-foreground"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {nav.map((item) => {
          const active = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                active
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-2">
        {!collapsed && (
          <div className="px-2 text-xs text-muted-foreground truncate" title={userEmail}>
            {userEmail}
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
          title={collapsed ? "Salir" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
        {!collapsed && <div className="text-[10px] text-muted-foreground/60 px-2">v1.0 • Lovable Cloud</div>}
      </div>
    </aside>
  );
}
