import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  ChevronLeft,
  ChevronRight,
  Eye,
  UserCog,
  Target,
  FileText,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
}

interface AppLayoutProps {
  children: React.ReactNode;
  user?: any;
}

const mainNavItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Şəxsi Heyət", icon: Users, href: "/employee-responses" },
  { label: "Analitika", icon: BarChart3, href: "/analytics" },
  { label: "AI Analiz", icon: Sparkles, href: "/ai-analysis" },
];

const managementNavItems: NavItem[] = [
  { label: "HR Paneli", icon: UserCog, href: "/hr-panel", badge: "Admin" },
  { label: "Hesabatlar", icon: FileText, href: "/reports" },
  { label: "Məqsədlər", icon: Target, href: "/targets" },
  { label: "Təkliflər", icon: Lightbulb, href: "/suggestions" },
];

export function AppLayout({ children, user }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = location.pathname === item.href;
    return (
      <Link
        to={item.href}
        className={cn(
          "nav-item group",
          isActive && "active"
        )}
      >
        <item.icon className={cn("h-5 w-5", isActive ? "" : "opacity-60")} />
        {sidebarOpen && (
          <>
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="px-1.5 py-0.5 text-xs rounded-md bg-primary/10 text-primary">
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-card border-r border-border transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-border">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-md">
                <span className="text-lg font-bold text-white">O</span>
              </div>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-semibold text-lg tracking-tight"
                >
                  OBA Mood
                </motion.span>
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex h-8 w-8"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
            <div className="mb-4">
              {sidebarOpen && (
                <p className="px-4 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  �sas
                </p>
              )}
              <div className="space-y-1">
                {mainNavItems.map((item) => (
                  <NavLink key={item.href} item={item} />
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-border">
              {sidebarOpen && (
                <p className="px-4 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  İdarəetmə
                </p>
              )}
              <div className="space-y-1">
                {managementNavItems.map((item) => (
                  <NavLink key={item.href} item={item} />
                ))}
              </div>
            </div>
          </nav>

          {/* User section */}
          <div className="p-3 border-t border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl p-2 transition-fast hover:bg-accent",
                    !sidebarOpen && "justify-center"
                  )}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="gradient-primary text-white text-sm">
                      {user?.email?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {sidebarOpen && (
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium truncate">
                        {user?.user_metadata?.name || user?.email?.split("@")[0] || "İstifadəçi"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.email || "Admin"}
                      </p>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Hesab</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Tənzimləmələr
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Çıxış
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-30 h-12 w-12 rounded-full shadow-lg lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Main content */}
      <main
        className={cn(
          "min-h-screen transition-all duration-300",
          sidebarOpen ? "lg:pl-64" : "lg:pl-20"
        )}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className="flex h-full items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold">
                {mainNavItems.find((i) => i.href === location.pathname)?.label ||
                  managementNavItems.find((i) => i.href === location.pathname)?.label ||
                  "OBA Mood AI"}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center">
                  3
                </span>
              </Button>

              {/* View toggle */}
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <Eye className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}