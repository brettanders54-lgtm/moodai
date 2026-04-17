import { useState, useEffect } from "react";
import { 
  Users, 
  Building2, 
  MapPin, 
  AlertTriangle, 
  TrendingDown,
  TrendingUp,
  Filter,
  Download,
  Home,
  MessageSquare,
  ClipboardCheck,
  CalendarIcon,
  LogOut,
  Sparkles,
  ChevronRight,
  BarChart3,
  Shield,
  Target,
  Lightbulb
} from "lucide-react";
import { format, subDays } from "date-fns";
import { az } from "date-fns/locale";
import { motion } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AppLogo } from "@/components/AppLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { supabase } from "@/integrations/supabase/client";
import { MobileNavMenu } from "@/components/MobileNavMenu";
import { AIAnalysisCard } from "@/components/AIAnalysisCard";
import { MoodPieChart } from "@/components/charts/MoodPieChart";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { ReasonsBarChart } from "@/components/charts/ReasonsBarChart";
import { BranchComparisonChart } from "@/components/charts/BranchComparisonChart";

interface FilterState {
  region: string;
  district: string;
}

interface BurnoutCase {
  id: string;
  employee_code: string;
  department: string;
  branch: string;
  risk_score: number;
  reason_category: string;
  detected_at: string;
  is_resolved: boolean;
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  gradient: string;
  trend?: string;
  trendUp?: boolean;
  delay?: number;
}

const StatCard = ({ title, value, subtitle, icon: Icon, gradient, trend, trendUp, delay = 0 }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-xl transition-all duration-500 group">
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-500",
        gradient
      )} />
      <div className={cn(
        "absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500",
        gradient.replace("from-", "bg-").split(" ")[0]
      )} />
      <CardHeader className="relative flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("p-2.5 rounded-xl bg-gradient-to-br shadow-lg", gradient)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-3xl font-bold text-foreground mb-1">{value}</div>
        {trend ? (
          <div className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
            trendUp ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
          )}>
            {trendUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {trend}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

const HRPanel = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FilterState>({
    region: "all",
    district: "all"
  });
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 90),
    to: new Date(),
  });

  // Region-District hierarchy for Azerbaijan
  const regionHierarchy = [
    { id: "all", name: "Bütün regionlar", districts: [] },
    {
      id: "baku",
      name: "Bakı",
      districts: [
        { id: "baku-center", name: "Bakı Mərkəz" },
        { id: "baku-sabunchu", name: "Sabunçu" },
        { id: "baku-nasimi", name: "Nəsimi" },
        { id: "baku-yasamal", name: "Yasamal" },
        { id: "baku-binagadi", name: "Binəqədi" },
        { id: "baku-surakhani", name: "Suraxanı" },
        { id: "baku-khazar", name: "Xəzər" },
      ]
    },
    {
      id: "absheron",
      name: "Abşeron",
      districts: [
        { id: "sumgait", name: "Sumqayıt" },
        { id: "khirdalan", name: "Xırdalan" },
        { id: "absheron-r", name: "Abşeron rayonu" },
      ]
    },
    {
      id: "aran",
      name: "Aran",
      districts: [
        { id: "agcabedi", name: "Ağcabədi" },
        { id: "beylagan", name: "Beyləqan" },
        { id: "imishli", name: "İmişli" },
        { id: "kurdamir", name: "Kürdəmir" },
        { id: "saatli", name: "Saatlı" },
        { id: "sabirabad", name: "Sabirabad" },
        { id: "shirvan", name: "Şirvan" },
        { id: "hajigabul", name: "Hacıqabul" },
        { id: "zardab", name: "Zərdab" },
        { id: "ujar", name: "Ucar" },
        { id: "bilasuvar", name: "Biləsuvar" },
        { id: "salyan", name: "Salyan" },
        { id: "neftchala", name: "Neftçala" },
      ]
    },
    {
      id: "ganja-gazakh",
      name: "Gəncə-Qazax",
      districts: [
        { id: "ganja", name: "Gəncə" },
        { id: "gazakh", name: "Qazax" },
        { id: "agstafa", name: "Ağstafa" },
        { id: "tovuz", name: "Tovuz" },
        { id: "samukh", name: "Samux" },
        { id: "goranboy", name: "Goranboy" },
        { id: "goygol", name: "Göygöl" },
        { id: "dashkasan", name: "Daşkəsən" },
      ]
    },
    {
      id: "guba-khachmaz",
      name: "Quba-Xaçmaz",
      districts: [
        { id: "quba", name: "Quba" },
        { id: "khachmaz", name: "Xaçmaz" },
        { id: "gusar", name: "Qusar" },
        { id: "shabran", name: "Şabran" },
        { id: "siyazan", name: "Siyəzən" },
      ]
    },
    {
      id: "lankaran",
      name: "Lənkəran",
      districts: [
        { id: "lankaran-city", name: "Lənkəran" },
        { id: "astara", name: "Astara" },
        { id: "lerik", name: "Lerik" },
        { id: "masalli", name: "Masallı" },
        { id: "yardimli", name: "Yardımlı" },
        { id: "jalilabad", name: "Cəlilabad" },
      ]
    },
    {
      id: "sheki-zagatala",
      name: "Şəki-Zaqatala",
      districts: [
        { id: "shaki", name: "Şəki" },
        { id: "zagatala", name: "Zaqatala" },
        { id: "balakan", name: "Balakən" },
        { id: "gakh", name: "Qax" },
        { id: "oguz", name: "Oğuz" },
        { id: "gabala", name: "Qəbələ" },
      ]
    },
    {
      id: "central",
      name: "Mərkəzi Aran",
      districts: [
        { id: "mingachevir", name: "Mingəçevir" },
        { id: "yevlakh", name: "Yevlax" },
        { id: "barda", name: "Bərdə" },
        { id: "tartar", name: "Tərtər" },
        { id: "agdam", name: "Ağdam" },
      ]
    },
    {
      id: "dagliq-shirvan",
      name: "Dağlıq Şirvan",
      districts: [
        { id: "shamakhi", name: "Şamaxı" },
        { id: "ismayilli", name: "İsmayıllı" },
        { id: "gobustan", name: "Qobustan" },
        { id: "agsu", name: "Ağsu" },
      ]
    },
    {
      id: "nakhchivan",
      name: "Naxçıvan",
      districts: [
        { id: "nakhchivan-city", name: "Naxçıvan şəhəri" },
        { id: "sharur", name: "Şərur" },
        { id: "babek", name: "Babək" },
        { id: "ordubad", name: "Ordubad" },
        { id: "julfa", name: "Culfa" },
        { id: "kangarli", name: "Kəngərli" },
        { id: "shahbuz", name: "Şahbuz" },
      ]
    },
  ];

  // Get available districts based on selected region
  const getAvailableDistricts = () => {
    if (filters.region === "all") return [];
    const selectedRegion = regionHierarchy.find(r => r.id === filters.region);
    return selectedRegion?.districts || [];
  };

  // Handle region change - reset district when region changes
  const handleRegionChange = (regionId: string) => {
    setFilters(prev => ({ ...prev, region: regionId, district: "all" }));
  };

  const handleDistrictChange = (districtId: string) => {
    setFilters(prev => ({ ...prev, district: districtId }));
  };

  const { data: burnoutCases = [] } = useQuery<BurnoutCase[]>({
    queryKey: ["hr-burnout-alerts", dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("burnout_alerts")
        .select("*")
        .eq("is_resolved", false)
        .order("risk_score", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: responses = [] } = useQuery({
    queryKey: ["hr-responses", dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_responses")
        .select("*")
        .gte("response_date", format(dateRange.from, "yyyy-MM-dd"))
        .lte("response_date", format(dateRange.to, "yyyy-MM-dd"));
      if (error) throw error;
      return data || [];
    },
  });

  const totalResponses = responses.length;
  const uniqueEmployees = [...new Set(responses.map(r => r.employee_code))].length;
  
  const moodCounts = {
    'Yaxşı': responses.filter(r => r.mood === 'Yaxşı').length,
    'Normal': responses.filter(r => r.mood === 'Normal').length,
    'Pis': responses.filter(r => r.mood === 'Pis').length,
  };

  const moodDistribution = [
    { mood: "Yaxşı", count: moodCounts['Yaxşı'], percentage: totalResponses > 0 ? Math.round((moodCounts['Yaxşı'] / totalResponses) * 100) : 0, color: "status-good" },
    { mood: "Normal", count: moodCounts['Normal'], percentage: totalResponses > 0 ? Math.round((moodCounts['Normal'] / totalResponses) * 100) : 0, color: "status-normal" },
    { mood: "Pis", count: moodCounts['Pis'], percentage: totalResponses > 0 ? Math.round((moodCounts['Pis'] / totalResponses) * 100) : 0, color: "status-bad" },
  ];

  const avgSatisfaction = totalResponses > 0 
    ? ((moodCounts['Yaxşı'] * 10 + moodCounts['Normal'] * 5 + moodCounts['Pis'] * 0) / totalResponses).toFixed(1)
    : "0";

  const stats = {
    totalEmployees: uniqueEmployees,
    responseRate: totalResponses > 0 ? ((totalResponses / Math.max(uniqueEmployees, 1)) * 100).toFixed(1) : "0",
    avgSatisfaction: parseFloat(avgSatisfaction),
    burnoutCases: burnoutCases.length,
    criticalCases: burnoutCases.filter(c => c.risk_score >= 80).length,
    trend: "+2.1"
  };

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


  const [aiAnalysis, setAiAnalysis] = useState<{
    score: number;
    summary: string;
    observations: string[];
    recommendations: string[];
    riskLevel: string;
    criticalAlerts?: string[];
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const moodDistribution = {
        'Yaxşı': totalResponses > 0 ? Math.round((moodCounts['Yaxşı'] / totalResponses) * 100) : 0,
        'Normal': totalResponses > 0 ? Math.round((moodCounts['Normal'] / totalResponses) * 100) : 0,
        'Pis': totalResponses > 0 ? Math.round((moodCounts['Pis'] / totalResponses) * 100) : 0,
      };

      const reasonCounts: Record<string, number> = {};
      responses.forEach(r => {
        if (r.reason_category) {
          reasonCounts[r.reason_category] = (reasonCounts[r.reason_category] || 0) + 1;
        }
      });
      const topReasons = Object.entries(reasonCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([reason, count]) => ({
          reason,
          percentage: totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0
        }));

      const criticalComplaints = responses
        .filter(r => r.mood === 'Pis' && r.reason)
        .map(r => ({
          reason: r.reason,
          category: r.reason_category,
          branch: r.branch,
          department: r.department,
        }));

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Autentifikasiya tələb olunur');
      
      const response = await supabase.functions.invoke('analyze-responses', {
        body: {
          moodDistribution,
          topReasons,
          riskCount: stats.burnoutCases,
          responseRate: parseFloat(stats.responseRate),
          overallIndex: stats.avgSatisfaction * 10,
          criticalComplaints,
        }
      });

      if (response.error) throw response.error;
      setAiAnalysis(response.data?.analysis || response.data);
    } catch (error) {
      console.error('AI analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const [hasAutoLoaded, setHasAutoLoaded] = useState(false);
  
  useEffect(() => {
    if (responses.length > 0 && !hasAutoLoaded && !isAnalyzing) {
      setHasAutoLoaded(true);
      runAIAnalysis();
    }
  }, [responses, hasAutoLoaded, isAnalyzing]);

  const regionNames: Record<string, string> = {
    'baku': 'Bakı', 'ganja': 'Gəncə', 'sumgait': 'Sumqayıt',
    'mingachevir': 'Mingəçevir', 'shirvan': 'Şirvan',
    'lankaran': 'Lənkəran', 'shaki': 'Şəki', 'quba': 'Quba'
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/50" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/70 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-4 min-w-0">
              <AppLogo size="md" onClick={() => navigate("/")} showText={false} />
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate flex items-center gap-2">
                  <Shield className="w-6 h-6 text-primary" />
                  İnsan Resursları Paneli
                </h1>
                <p className="text-sm text-muted-foreground truncate flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Əməkdaş məmnuniyyəti və risk idarəetməsi
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Theme & Language */}
              <div className="hidden sm:flex items-center gap-1">
                <LanguageSelector />
                <ThemeToggle />
              </div>
              {/* Desktop navigation */}
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate("/manager-assignments")} className="gap-2 rounded-xl hover:bg-primary/10">
                  <Users className="w-4 h-4" />
                  <span className="hidden md:inline">Təyinatlar</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/manager-actions")} className="gap-2 rounded-xl hover:bg-primary/10">
                  <ClipboardCheck className="w-4 h-4" />
                  <span className="hidden md:inline">Tapşırıqlar</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/employee-responses")} className="gap-2 rounded-xl hover:bg-primary/10">
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden md:inline">Cavablar</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="gap-2 rounded-xl hover:bg-primary/10">
                  <Home className="w-4 h-4" />
                  <span className="hidden md:inline">İdarəetmə</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/targets")} className="gap-2 rounded-xl hover:bg-primary/10">
                  <Target className="w-4 h-4" />
                  <span className="hidden md:inline">Hədəflər</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate("/reports")} className="gap-2 rounded-xl border-border/50 hover:bg-primary/5">
                  <Download className="w-4 h-4" />
                  <span className="hidden md:inline">Hesabat</span>
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
              {/* Desktop date picker */}
              <Popover>
                <PopoverTrigger asChild className="hidden sm:flex">
                  <Button variant="outline" size="sm" className="gap-2 min-w-[180px] justify-start text-left font-normal rounded-xl border-border/50 hover:bg-primary/5">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    {format(dateRange.from, "dd MMM", { locale: az })} - {format(dateRange.to, "dd MMM yyyy", { locale: az })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card border-border/50 shadow-xl rounded-xl" align="end">
                  <div className="p-3 border-b border-border/50 bg-muted/30">
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="ghost" size="sm" onClick={() => setDateRange({ from: subDays(new Date(), 7), to: new Date() })} className="text-xs rounded-lg hover:bg-primary/10">Son 7 gün</Button>
                      <Button variant="ghost" size="sm" onClick={() => setDateRange({ from: subDays(new Date(), 30), to: new Date() })} className="text-xs rounded-lg hover:bg-primary/10">Son 30 gün</Button>
                      <Button variant="ghost" size="sm" onClick={() => setDateRange({ from: subDays(new Date(), 90), to: new Date() })} className="text-xs rounded-lg hover:bg-primary/10">Son 90 gün</Button>
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
              <MobileNavMenu dateRange={dateRange} onDateRangeChange={setDateRange} showDatePicker={true} />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/5">
              <BarChart3 className="w-6 h-6 text-violet-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">HR Analitikası</h2>
          </div>
          <p className="text-muted-foreground">
            {format(dateRange.from, "dd MMMM", { locale: az })} - {format(dateRange.to, "dd MMMM yyyy", { locale: az })} tarixləri üçün əməkdaş statistikası
          </p>
        </motion.div>

        {/* Critical Alert */}
        {stats.criticalCases > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-6">
            <Alert className="border-destructive/50 bg-destructive/10 backdrop-blur-sm rounded-xl">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <AlertDescription className="text-destructive ml-2">
                <strong>Diqqət!</strong> {stats.criticalCases} kritik tükənmişlik halı müəyyən edilib. Dərhal müdaxilə tələb olunur.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="mb-6 border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="w-5 h-5 text-primary" />
                Filtrlər
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    Region
                  </label>
                  <select
                    value={filters.region}
                    onChange={(e) => handleRegionChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  >
                    {regionHierarchy.map(region => (
                      <option key={region.id} value={region.id}>{region.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    Rayon / Bölgə
                  </label>
                  <select
                    value={filters.district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    disabled={filters.region === "all"}
                    className={cn(
                      "w-full px-4 py-2.5 rounded-xl border border-border/50 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all",
                      filters.region === "all" && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <option value="all">Bütün rayonlar</option>
                    {getAvailableDistricts().map(district => (
                      <option key={district.id} value={district.id}>{district.name}</option>
                    ))}
                  </select>
                  {filters.region === "all" && (
                    <p className="text-xs text-muted-foreground mt-1">Əvvəlcə region seçin</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard title="Ümumi Əməkdaş" value={stats.totalEmployees.toString()} subtitle="Aktiv işçilər" icon={Users} gradient="from-blue-500 to-cyan-500" delay={0.15} />
          <StatCard title="Cavab Nisbəti" value={`${stats.responseRate}%`} subtitle="" icon={TrendingUp} gradient="from-emerald-500 to-green-500" trend={`${stats.trend}% bu həftə`} trendUp delay={0.2} />
          <StatCard title="Orta Məmnuniyyət" value={`${stats.avgSatisfaction}/10`} subtitle="Son 30 gün" icon={Sparkles} gradient="from-violet-500 to-purple-500" delay={0.25} />
          <StatCard title="Risk Halları" value={stats.burnoutCases.toString()} subtitle={`${stats.criticalCases} kritik hal`} icon={AlertTriangle} gradient="from-rose-500 to-red-500" delay={0.3} />
        </div>

        {/* Charts */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <MoodPieChart data={moodDistribution} title="Əhval Bölgüsü" description="İşçilərin əhval paylanması" />
          <TrendLineChart responses={responses} dateRange={dateRange} title="Əhval Trendi" description="Günlər üzrə məmnuniyyət göstəricisi" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ReasonsBarChart data={topReasons} title="Şikayət Səbəbləri" description="Ən çox qeyd olunan problemlər" />
          <BranchComparisonChart responses={responses} title="Bölgə Müqayisəsi" description="Bölgələr üzrə əhval bölgüsü" />
        </motion.div>

        {/* AI Analysis */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mb-6">
          <AIAnalysisCard analysis={aiAnalysis} isLoading={isAnalyzing} onRefresh={runAIAnalysis} />
        </motion.div>

        {/* Region Statistics */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Bölgələr üzrə Ümumi Statistika
              </CardTitle>
              <CardDescription>Real sorğu cavablarına əsasən bölgə göstəriciləri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(() => {
                  const regionData: Record<string, { responses: number; moodSum: number; badCount: number; goodCount: number }> = {};
                  responses.forEach(r => {
                    if (!regionData[r.branch]) {
                      regionData[r.branch] = { responses: 0, moodSum: 0, badCount: 0, goodCount: 0 };
                    }
                    regionData[r.branch].responses++;
                    regionData[r.branch].moodSum += r.mood === 'Yaxşı' ? 10 : r.mood === 'Normal' ? 5 : 0;
                    if (r.mood === 'Pis') regionData[r.branch].badCount++;
                    if (r.mood === 'Yaxşı') regionData[r.branch].goodCount++;
                  });

                  const regionStats = Object.entries(regionData).map(([name, data]) => ({
                    name,
                    responses: data.responses,
                    satisfaction: data.responses > 0 ? parseFloat((data.moodSum / data.responses).toFixed(1)) : 0,
                    badCount: data.badCount,
                    goodCount: data.goodCount,
                    goodPercent: data.responses > 0 ? Math.round((data.goodCount / data.responses) * 100) : 0
                  })).sort((a, b) => b.responses - a.responses);

                  return regionStats.length === 0 ? (
                    <p className="col-span-full text-center text-muted-foreground py-8">Məlumat yoxdur</p>
                  ) : (
                    regionStats.map((region, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.55 + index * 0.05 }}
                        className="p-5 rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all duration-300 group"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-foreground text-lg">{regionNames[region.name] || region.name}</h4>
                          <span className={cn(
                            "text-sm font-bold px-3 py-1 rounded-full",
                            region.satisfaction >= 7 ? "bg-emerald-500/20 text-emerald-600" :
                            region.satisfaction >= 4 ? "bg-amber-500/20 text-amber-600" :
                            "bg-rose-500/20 text-rose-600"
                          )}>
                            {region.satisfaction}/10
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Cavab sayı:</span>
                            <span className="font-semibold">{region.responses}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Yaxşı əhval:</span>
                            <span className="text-emerald-600 font-semibold">{region.goodPercent}%</span>
                          </div>
                          {region.badCount > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Pis əhval:</span>
                              <span className="text-rose-600 font-semibold">{region.badCount} nəfər</span>
                            </div>
                          )}
                        </div>
                        <Progress value={region.satisfaction * 10} className="h-2 mt-4" />
                      </motion.div>
                    ))
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/50 bg-card/30 backdrop-blur-sm mt-8">
        <p>© 2026 MoodAI İnsan Resursları Paneli. Bütün hüquqlar qorunur.</p>
      </footer>
    </div>
  );
};

export default HRPanel;
