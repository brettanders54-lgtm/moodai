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
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb as LightbulbIcon,
  Target as TargetIcon,
  FileText as FileTextIcon,
  MessageSquare as MessageSquareIcon,
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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format, subDays } from "date-fns";
import { useMemo } from "react";

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  external?: boolean;
  onClick?: () => void;
}

interface AppLayoutProps {
  children: React.ReactNode;
  user?: any;
}

interface AIAnalysis {
  score: number;
  summary: string;
  observations: string[];
  recommendations: string[];
  riskLevel: "aşağı" | "orta" | "yüksək" | "kritik";
  criticalAlerts: string[];
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    priority: "kritik" | "yüksək" | "orta";
    targetEmployee?: string;
    department?: string;
    category: string;
  }>;
}

const mainNavItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Şəxsi Heyət", icon: Users, href: "/employee-responses" },
  { label: "Analitika", icon: BarChart3, href: "/analytics" },
  { label: "AI Analiz", icon: Sparkles, href: "/analytics", badge: "Yeni", onClick: () => {} },
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
  const [aiModalOpen, setAiModalOpen] = useState(false);
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
    const isAIAnaliz = item.label === "AI Analiz";

    const handleClick = () => {
      if (isAIAnaliz) {
        setAiModalOpen(true);
      }
      setMobileOpen(false);
    };

    return (
      <button
        onClick={handleClick}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full",
          isActive && !isAIAnaliz
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && !isAIAnaliz ? "" : "opacity-60")} />
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
      </button>
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
          <NavLinkComponent key={item.label} item={item} collapsed={collapsed} />
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

      {/* AI Modal */}
      <AIModal open={aiModalOpen} onOpenChange={setAiModalOpen} />

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
              {/* Breadcrumb */}
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

// AI Modal Component
function AIModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [dateRange] = useState("7");
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch responses data
  const { data: responses = [] } = useQuery({
    queryKey: ["ai-modal-responses"],
    queryFn: async () => {
      const fromDate = format(subDays(new Date(), 7), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("employee_responses")
        .select("*")
        .gte("response_date", fromDate);
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch burnout alerts
  const { data: burnoutAlerts = [] } = useQuery({
    queryKey: ["ai-modal-burnout"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("burnout_alerts")
        .select("*")
        .eq("is_resolved", false);
      if (error) throw error;
      return data || [];
    },
  });

  // Calculate analytics
  const analytics = useMemo(() => {
    const total = responses.length;
    const moodCounts: Record<string, number> = {};
    responses.forEach((r: any) => {
      moodCounts[r.mood] = (moodCounts[r.mood] || 0) + 1;
    });

    const moodCountsArray = [
      { mood: "Əla", count: moodCounts["Əla"] || 0 },
      { mood: "Yaxşı", count: moodCounts["Yaxşı"] || 0 },
      { mood: "Normal", count: moodCounts["Normal"] || 0 },
      { mood: "Pis", count: moodCounts["Pis"] || 0 },
      { mood: "Çox pis", count: moodCounts["Çox pis"] || 0 },
    ];

    const reasonCounts: Record<string, number> = {};
    responses.forEach((r: any) => {
      if (r.reason_category) {
        reasonCounts[r.reason_category] = (reasonCounts[r.reason_category] || 0) + 1;
      }
    });

    const topReasons = Object.entries(reasonCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([reason, count]) => ({
        reason,
        count: count as number,
        percentage: total > 0 ? Math.round(((count as number) / total) * 100) : 0,
      }));

    const satisfactionIndex = total > 0
      ? Math.round(
          ((moodCounts["Əla"] || 0) * 100 +
            (moodCounts["Yaxşı"] || 0) * 75 +
            (moodCounts["Normal"] || 0) * 50 +
            (moodCounts["Pis"] || 0) * 25 +
            (moodCounts["Çox pis"] || 0) * 0) /
            total
        )
      : 0;

    return { total, moodCounts, moodCountsArray, topReasons, satisfactionIndex };
  }, [responses]);

  const runAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      // Get critical complaints
      const badResponses = responses.filter((r: any) =>
        r.mood === "Pis" || r.mood === "Çox pis"
      );
      const criticalComplaints = badResponses
        .filter((r: any) => r.reason)
        .map((r: any) => ({
          reason: r.reason,
          category: r.reason_category,
          branch: r.branch,
          department: r.department,
        }));

      const { data: session } = await supabase.auth.getSession();

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          moodDistribution: analytics.moodCountsArray,
          topReasons: analytics.topReasons,
          riskCount: burnoutAlerts.length,
          responseRate: Math.min(100, Math.round((analytics.total / 70) * 100)),
          overallIndex: analytics.satisfactionIndex,
          criticalComplaints,
        }),
      });

      if (!response.ok) {
        throw new Error("AI analiz xətası");
      }

      const result = await response.json();
      setAnalysis(result.analysis || result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xəta baş verdi");
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "aşağı": return "bg-emerald-500";
      case "orta": return "bg-amber-500";
      case "yüksək": return "bg-orange-500";
      case "kritik": return "bg-rose-500";
      default: return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "kritik": return "bg-rose-500";
      case "yüksək": return "bg-orange-500";
      case "orta": return "bg-amber-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl gradient-primary">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">AI Analiz</h2>
                <p className="text-sm text-muted-foreground">Son 7 günlük məlumatlar əsasında</p>
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-muted/50">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold">{analytics.total}</p>
                <p className="text-xs text-muted-foreground">Cavab</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold">{analytics.satisfactionIndex}%</p>
                <p className="text-xs text-muted-foreground">Məmnuniyyət</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold">{burnoutAlerts.length}</p>
                <p className="text-xs text-muted-foreground">Risk</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold">{analytics.topReasons.length}</p>
                <p className="text-xs text-muted-foreground">Səbəb</p>
              </CardContent>
            </Card>
          </div>

          {/* Run Analysis Button */}
          {!analysis && !error && (
            <Button
              onClick={runAnalysis}
              disabled={isLoading || responses.length === 0}
              className="w-full gradient-primary"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analiz edilir...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Analizə Başla
                </>
              )}
            </Button>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="border-rose-500/20 bg-rose-500/5">
              <CardContent className="p-4 text-center">
                <AlertTriangle className="h-8 w-8 text-rose-500 mx-auto mb-2" />
                <p className="text-rose-500">{error}</p>
                <Button onClick={runAnalysis} variant="outline" className="mt-3">
                  Yenidən cəhd et
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Analysis Results */}
          {analysis && !isLoading && (
            <div className="space-y-6">
              {/* Summary Card */}
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
                      <span className="text-3xl font-bold text-primary">{analysis.score}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn("h-3 w-3 rounded-full", getRiskColor(analysis.riskLevel))} />
                        <span className="font-medium capitalize">{analysis.riskLevel} Risk</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{analysis.summary}</p>
                    </div>
                    <Button onClick={runAnalysis} variant="outline" size="sm">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Yenilə
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Observations */}
              {analysis.observations && analysis.observations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <FileTextIcon className="h-4 w-4 text-primary" />
                    Müşahidələr
                  </h4>
                  <div className="space-y-2">
                    {analysis.observations.map((obs, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-muted/50">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{obs}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Critical Alerts */}
              {analysis.criticalAlerts && analysis.criticalAlerts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2 text-rose-500">
                    <AlertTriangle className="h-4 w-4" />
                    Kritik Xəbərdarlıqlar
                  </h4>
                  <div className="space-y-2">
                    {analysis.criticalAlerts.map((alert, i) => (
                      <div key={i} className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-sm">
                        {alert}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {analysis.recommendations && analysis.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <LightbulbIcon className="h-4 w-4 text-amber-500" />
                    Tövsiyyələr
                  </h4>
                  <div className="space-y-2">
                    {analysis.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-muted/50">
                        <TargetIcon className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks */}
              {analysis.tasks && analysis.tasks.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <MessageSquareIcon className="h-4 w-4 text-primary" />
                    Tapşırıqlar
                  </h4>
                  <div className="space-y-2">
                    {analysis.tasks.map((task) => (
                      <div key={task.id} className="p-3 rounded-lg border bg-card">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={cn("h-2 w-2 rounded-full", getPriorityColor(task.priority))} />
                              <span className="font-medium text-sm">{task.title}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{task.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {task.category}
                              </Badge>
                              {task.department && (
                                <Badge variant="outline" className="text-xs">
                                  {task.department}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No Data State */}
          {!analysis && !error && !isLoading && responses.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Analiz üçün kifayət qədər məlumat yoxdur</p>
                <p className="text-sm text-muted-foreground mt-1">Ən azı bir neçə cavab olduqdan sonra analiz edilə bilər</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}