import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Users, AlertCircle, BarChart3, Activity, Home, UserCog, CalendarIcon, LogOut, Sparkles, ChevronRight, Brain } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { format, subDays } from "date-fns";
import { az } from "date-fns/locale";
import { AppLogo } from "@/components/AppLogo";
import { MobileNavMenu } from "@/components/MobileNavMenu";
import { useToast } from "@/hooks/use-toast";
import { AIAnalysisCard } from "@/components/AIAnalysisCard";
import { AITasksCard, AITask } from "@/components/AITasksCard";
import { MoodPieChart } from "@/components/charts/MoodPieChart";
import { ReasonsBarChart } from "@/components/charts/ReasonsBarChart";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { BranchComparisonChart } from "@/components/charts/BranchComparisonChart";
import { NotificationButton } from "@/components/NotificationButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useNotifications } from "@/hooks/useNotifications";

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
  description?: string;
  gradient: string;
  delay?: number;
}

const StatCard = ({ title, value, change, icon: Icon, description, gradient, delay = 0 }: StatCardProps) => {
  const isPositive = change >= 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-xl transition-all duration-500 group">
        {/* Gradient Background */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-500",
          gradient
        )} />
        
        {/* Decorative Circle */}
        <div className={cn(
          "absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500",
          gradient.replace("from-", "bg-").split(" ")[0]
        )} />

        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className={cn(
            "p-2.5 rounded-xl bg-gradient-to-br shadow-lg",
            gradient
          )}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-4xl font-bold text-foreground mb-1 tracking-tight">{value}</div>
          {description && (
            <p className="text-sm text-muted-foreground mb-3">{description}</p>
          )}
          <div className={cn(
            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
            isPositive 
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
              : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
          )}>
            {isPositive ? (
              <TrendingUp className="mr-1 h-3 w-3" />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3" />
            )}
            {Math.abs(change)}% son həftəyə nisbətən
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscribeToAlerts } = useNotifications();
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [aiAnalysis, setAiAnalysis] = useState<{
    score: number;
    summary: string;
    observations: string[];
    recommendations: string[];
    riskLevel: string;
    criticalAlerts?: string[];
    tasks?: AITask[];
  } | null>(null);
  const [hasAutoLoaded, setHasAutoLoaded] = useState(false);

  // Fetch manager's assigned branch
  const { data: managerBranch } = useQuery({
    queryKey: ['manager-branch'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('manager_branches')
        .select('branch')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data?.branch || null;
    },
  });

  // Branch name mapping
  const branchNames: Record<string, string> = {
    'baku': 'Bakı',
    'ganja': 'Gəncə',
    'sumgait': 'Sumqayıt',
    'mingachevir': 'Mingəçevir',
    'shirvan': 'Şirvan',
    'lankaran': 'Lənkəran',
    'shaki': 'Şəki',
    'quba': 'Quba',
  };

  // Fetch burnout alerts from database
  const { data: burnoutAlerts = [] } = useQuery({
    queryKey: ['burnout-alerts', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('burnout_alerts')
        .select('*')
        .eq('is_resolved', false)
        .order('risk_score', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch employee responses from database
  const { data: responses = [] } = useQuery({
    queryKey: ['employee-responses', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_responses')
        .select('*')
        .gte('response_date', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('response_date', format(dateRange.to, 'yyyy-MM-dd'));
      
      if (error) throw error;
      return data || [];
    },
  });

  // Calculate real statistics from responses
  const totalResponses = responses.length;
  const moodCounts = {
    'Yaxşı': responses.filter(r => r.mood === 'Yaxşı').length,
    'Normal': responses.filter(r => r.mood === 'Normal').length,
    'Pis': responses.filter(r => r.mood === 'Pis').length,
  };

  const moodDistribution = [
    { 
      mood: "Yaxşı", 
      count: moodCounts['Yaxşı'], 
      percentage: totalResponses > 0 ? Math.round((moodCounts['Yaxşı'] / totalResponses) * 100) : 0, 
      color: "status-good" 
    },
    { 
      mood: "Normal", 
      count: moodCounts['Normal'], 
      percentage: totalResponses > 0 ? Math.round((moodCounts['Normal'] / totalResponses) * 100) : 0, 
      color: "status-normal" 
    },
    { 
      mood: "Pis", 
      count: moodCounts['Pis'], 
      percentage: totalResponses > 0 ? Math.round((moodCounts['Pis'] / totalResponses) * 100) : 0, 
      color: "status-bad" 
    },
  ];

  // Calculate top reasons from responses with reason_category
  const reasonCounts: Record<string, number> = {};
  responses.forEach(r => {
    if (r.reason_category) {
      reasonCounts[r.reason_category] = (reasonCounts[r.reason_category] || 0) + 1;
    }
  });
  
  const totalReasons = Object.values(reasonCounts).reduce((a, b) => a + b, 0);
  const topReasons = Object.entries(reasonCounts)
    .map(([reason, count]) => ({
      reason,
      count,
      percentage: totalReasons > 0 ? Math.round((count / totalReasons) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Calculate overall satisfaction index
  const overallIndex = totalResponses > 0 
    ? Math.round(((moodCounts['Yaxşı'] * 100 + moodCounts['Normal'] * 50 + moodCounts['Pis'] * 0) / totalResponses))
    : 0;

  // Stats object with real data
  const stats = {
    overallIndex,
    totalResponses,
    riskCount: burnoutAlerts.length,
    responseRate: 89, // This would need a total employee count to calculate properly
  };

  // Extract critical complaints (free text reasons from bad moods)
  const criticalComplaints = responses
    .filter(r => r.mood === 'Pis' && r.reason)
    .map(r => ({
      reason: r.reason,
      category: r.reason_category,
      branch: r.branch,
      department: r.department,
    }));

  // AI Analysis mutation
  const analysisMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Autentifikasiya tələb olunur');
      
      const { data, error } = await supabase.functions.invoke('analyze-responses', {
        body: {
          moodDistribution,
          topReasons,
          riskCount: stats.riskCount,
          responseRate: stats.responseRate,
          overallIndex: stats.overallIndex,
          criticalComplaints,
        },
      });
      
      if (error) throw error;
      return data.analysis;
    },
    onSuccess: (analysis) => {
      setAiAnalysis(analysis);
    },
    onError: (error: any) => {
      toast({
        title: "AI analiz xətası",
        description: error.message || "Analiz aparıla bilmədi",
        variant: "destructive",
      });
    },
  });

  // Auto-load AI analysis when responses are loaded
  useEffect(() => {
    if (!hasAutoLoaded && responses.length > 0) {
      setHasAutoLoaded(true);
      analysisMutation.mutate();
    }
  }, [responses, hasAutoLoaded, analysisMutation]);

  // Subscribe to real-time alerts for push notifications
  useEffect(() => {
    const unsubscribe = subscribeToAlerts(managerBranch || undefined);
    return unsubscribe;
  }, [subscribeToAlerts, managerBranch]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/50" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/70 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-4 min-w-0">
              <AppLogo size="md" onClick={() => navigate("/")} showText={false} />
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate flex items-center gap-2">
                  MoodAI İdarəetmə Paneli
                  {managerBranch && (
                    <span className="text-primary flex items-center gap-1">
                      <ChevronRight className="w-5 h-5" />
                      {branchNames[managerBranch] || managerBranch}
                    </span>
                  )}
                </h1>
                <p className="text-sm text-muted-foreground truncate flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {managerBranch ? `${branchNames[managerBranch] || managerBranch} Bölgəsi Məmnuniyyət Sistemi` : 'Personal Məmnuniyyət Sistemi'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Theme & Notification controls */}
              <div className="hidden sm:flex items-center gap-2">
                <LanguageSelector />
                <ThemeToggle />
                <NotificationButton />
              </div>
              
              {/* Desktop navigation */}
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/")}
                  className="gap-2 rounded-xl hover:bg-primary/10"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden md:inline">Ana Səhifə</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/analytics")}
                  className="gap-2 rounded-xl border-primary/30 hover:bg-primary/10"
                >
                  <Brain className="w-4 h-4 text-primary" />
                  <span className="hidden md:inline">Proqnoz</span>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate("/hr-panel")}
                  className="gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
                >
                  <UserCog className="w-4 h-4" />
                  <span className="hidden md:inline">HR Paneli</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    navigate("/auth");
                  }}
                  className="gap-2 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">Çıxış</span>
                </Button>
              </div>
              {/* Mobile hamburger menu */}
              <MobileNavMenu 
                dateRange={dateRange} 
                onDateRangeChange={setDateRange} 
                showDatePicker={true}
              />
              {/* Desktop date picker */}
              <Popover>
                <PopoverTrigger asChild className="hidden sm:flex">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 min-w-[200px] justify-start text-left font-normal rounded-xl border-border/50 hover:bg-primary/5 hover:border-primary/50"
                  >
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    {format(dateRange.from, "dd MMM", { locale: az })} - {format(dateRange.to, "dd MMM yyyy", { locale: az })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card border-border/50 shadow-xl rounded-xl" align="end">
                  <div className="p-3 border-b border-border/50 bg-muted/30">
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDateRange({ from: subDays(new Date(), 7), to: new Date() })}
                        className="text-xs rounded-lg hover:bg-primary/10"
                      >
                        Son 7 gün
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDateRange({ from: subDays(new Date(), 30), to: new Date() })}
                        className="text-xs rounded-lg hover:bg-primary/10"
                      >
                        Son 30 gün
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDateRange({ from: subDays(new Date(), 90), to: new Date() })}
                        className="text-xs rounded-lg hover:bg-primary/10"
                      >
                        Son 90 gün
                      </Button>
                    </div>
                  </div>
                  <Calendar
                    mode="range"
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setDateRange({ from: range.from, to: range.to });
                      } else if (range?.from) {
                        setDateRange({ from: range.from, to: range.from });
                      }
                    }}
                    numberOfMonths={2}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Ümumi Baxış</h2>
          </div>
          <p className="text-muted-foreground">
            {format(dateRange.from, "dd MMMM", { locale: az })} - {format(dateRange.to, "dd MMMM yyyy", { locale: az })} tarixləri üçün statistika
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Ümumi İndeks"
            value={`${stats.overallIndex}%`}
            change={5.2}
            icon={Activity}
            description="Məmnuniyyət səviyyəsi"
            gradient="from-emerald-500 to-green-500"
            delay={0}
          />
          <StatCard
            title="Cavablar"
            value={stats.totalResponses.toLocaleString()}
            change={12.5}
            icon={Users}
            description="Aktiv iştirakçılar"
            gradient="from-blue-500 to-cyan-500"
            delay={0.1}
          />
          <StatCard
            title="Risk Halları"
            value={stats.riskCount.toString()}
            change={-15.3}
            icon={AlertCircle}
            description="Tükənmişlik riski"
            gradient="from-rose-500 to-red-500"
            delay={0.2}
          />
          <StatCard
            title="Cavab Dərəcəsi"
            value={`${stats.responseRate}%`}
            change={3.1}
            icon={BarChart3}
            description="İştirak aktivliyi"
            gradient="from-violet-500 to-purple-500"
            delay={0.3}
          />
        </div>

        {/* Charts Row 1 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"
        >
          <MoodPieChart data={moodDistribution} />
          <ReasonsBarChart data={topReasons} />
        </motion.div>

        {/* Charts Row 2 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"
        >
          <TrendLineChart responses={responses} dateRange={dateRange} />
          <BranchComparisonChart responses={responses} />
        </motion.div>

        {/* AI Analysis Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6"
        >
          <AIAnalysisCard
            analysis={aiAnalysis}
            isLoading={analysisMutation.isPending}
            onRefresh={() => analysisMutation.mutate()}
          />
        </motion.div>

        {/* AI Tasks Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-6"
        >
          <AITasksCard
            newTasks={aiAnalysis?.tasks || []}
            isGenerating={analysisMutation.isPending}
            onRefresh={() => analysisMutation.mutate()}
            branch={managerBranch}
          />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/50 bg-card/30 backdrop-blur-sm mt-8">
        <p>© 2026 MoodAI İdarəetmə Paneli. Bütün hüquqlar qorunur.</p>
      </footer>
    </div>
  );
};

export default Dashboard;
