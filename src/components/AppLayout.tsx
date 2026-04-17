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
  Bell,
  ChevronLeft,
  ChevronRight,
  Eye,
  UserCog,
  Target,
  FileText,
  Lightbulb,
  Sparkles,
  MessageSquare,
  Download,
  UserPlus,
  Building2,
  AlertCircle,
  ChevronRight as ChevronRightIcon,
  Home,
  PieChart,
  TrendingUp,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  external?: boolean;
}

interface AppLayoutProps {
  children: React.ReactNode;
  user?: any;
}

const mainNavItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Şəxsi Heyət", icon: Users, href: "/employee-responses" },
  { label: "Analitika", icon: BarChart3, href: "/analytics" },
  { label: "AI Analiz", icon: Sparkles, href: "/analytics", badge: "Yeni" },
];

const managementNavItems: NavItem[] = [
  { label: "HR Paneli", icon: UserCog, href: "/hr-panel" },
  { label: "Menecer Fəaliyyətləri", icon: AlertCircle, href: "/manager-actions" },
  { label: "Menecer Təyinatları", icon: UserPlus, href: "/manager-assignments" },
  { label: "Məqsədlər", icon: Target, href: "/targets" },
  { label: "Hesabatlar", icon: FileText, href: "/reports" },
];

const contentNavItems: NavItem[] = [
  { label: "Təklif Qutusu", icon: Lightbulb, href: "/suggestion-box" },
  { label: "Təkliflərin İdarə Edilməsi", icon: MessageSquare, href: "/suggestions-management" },
];

const systemNavItems: NavItem[] = [
  { label: "Admin CMS", icon: Shield, href: "/admin", badge: "Admin" },
];

export function AppLayout({ children, user }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const NavLinkComponent = ({ item, collapsed }: { item: NavItem; collapsed: boolean }) => {
    const isActive = location.pathname === item.href;
    return (
      <Link
        to={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
        onClick={() => setMobileOpen(false)}
      >
        <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "" : "opacity-60")} />
        {!collapsed && (
          <>
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <Badge variant="secondary" className="text-xs">
                {item.badge}
              </Badge>
            )}
          </>
        )}
      </Link>
    );
  };

  const NavSection = ({
    title,
    items,
    sectionKey,
    collapsed,
  }: {
    title: string;
    items: NavItem[];
    sectionKey: string;
    collapsed: boolean;
  }) => {
    const isCollapsed = collapsedSections.includes(sectionKey);

    return (
      <div className="space-y-1">
        {!collapsed && (
          <button
            onClick={() => toggleSection(sectionKey)}
            className="flex items-center justify-between w-full px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
          >
            <span>{title}</span>
            <ChevronRightIcon
              className={cn(
                "h-4 w-4 transition-transform",
                !isCollapsed && "rotate-90"
              )}
            />
          </button>
        )}
        {!isCollapsed && items.map((item) => (
          <NavLinkComponent key={item.href} item={item} collapsed={collapsed} />
        ))}
      </div>
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
          "fixed top-0 left-0 z-50 h-full bg-card border-r border-border transition-all duration-300 flex flex-col",
          sidebarOpen ? "w-64" : "w-20",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border flex-shrink-0">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-md">
              <span className="text-xl font-bold text-white">O</span>
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
        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          <NavSection title="Əsas" items={mainNavItems} sectionKey="main" collapsed={!sidebarOpen} />

          <div className="pt-3 border-t border-border">
            <NavSection title="İdarəetmə" items={managementNavItems} sectionKey="management" collapsed={!sidebarOpen} />
          </div>

          <div className="pt-3 border-t border-border">
            <NavSection title="Məzmun" items={contentNavItems} sectionKey="content" collapsed={!sidebarOpen} />
          </div>

          <div className="pt-3 border-t border-border">
            <NavSection title="Sistem" items={systemNavItems} sectionKey="system" collapsed={!sidebarOpen} />
          </div>
        </nav>

        {/* Quick Actions */}
        {sidebarOpen && (
          <div className="p-3 border-t border-border">
            <Link
              to="/survey"
              className="flex items-center justify-center gap-2 w-full p-3 rounded-xl gradient-primary text-white font-medium shadow-md hover:shadow-lg transition-shadow"
            >
              <FileText className="h-5 w-5" />
              <span>Yeni Sorğu</span>
            </Link>
          </div>
        )}

        {/* User section */}
        <div className="p-3 border-t border-border flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl p-2 transition-all hover:bg-accent",
                  !sidebarOpen && "justify-center"
                )}
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="gradient-primary text-white text-sm">
                    {user?.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                {sidebarOpen && (
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user?.user_metadata?.name || user?.email?.split("@")[0] || "İstifadəçi"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      Admin
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
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center gap-2">
                  <UserCog className="h-4 w-4" />
                  Profil
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
      </aside>

      {/* Mobile menu button */}
      <Button
        variant="default"
        size="icon"
        className="fixed bottom-4 right-4 z-30 h-14 w-14 rounded-full shadow-xl lg:hidden gradient-primary"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Main content */}
      <main
        className={cn(
          "min-h-screen transition-all duration-300",
          sidebarOpen ? "lg:pl-64" : "lg:pl-20"
        )}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-16 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className="flex h-full items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-4">
              {/* Breadcrumb placeholder */}
              <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link to="/dashboard" className="hover:text-foreground">
                  <Home className="h-4 w-4" />
                </Link>
                <span>/</span>
                <span className="text-foreground font-medium">
                  {location.pathname === "/dashboard" ? "Dashboard" :
                   location.pathname === "/employee-responses" ? "İşçi Cavabları" :
                   location.pathname === "/analytics" ? "Analitika" :
                   location.pathname === "/hr-panel" ? "HR Panel" :
                   location.pathname === "/manager-actions" ? "Menecer Fəaliyyətləri" :
                   location.pathname === "/targets" ? "Məqsədlər" :
                   location.pathname === "/reports" ? "Hesabatlar" :
                   location.pathname === "/suggestions-management" ? "Təkliflər" :
                   location.pathname === "/suggestion-box" ? "Təklif Qutusu" :
                   location.pathname === "/ai-analysis" ? "AI Analiz" :
                   location.pathname}
                </span>
              </nav>
            </div>

            <div className="flex items-center gap-2">
              {/* Quick survey link */}
              <Button variant="outline" size="sm" asChild>
                <Link to="/survey">
                  <FileText className="h-4 w-4 mr-2" />
                  Sorğu
                </Link>
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center">
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