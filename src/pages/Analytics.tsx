import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Loader2,
  Lightbulb,
  FileText,
  MessageSquare,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { az } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { AppLayout } from "@/components/AppLayout";

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

export default function AnalyticsNew() {
  const [dateRange, setDateRange] = useState("7");
  const [branchFilter, setBranchFilter] = useState("all");
  const [showAIPanel, setShowAIPanel] = useState(false);

  const { data: responses = [], isLoading, refetch } = useQuery({
    queryKey: ["analytics-responses", dateRange, branchFilter],
    queryFn: async () => {
      const days = parseInt(dateRange);
      const fromDate = format(subDays(new Date(), days), "yyyy-MM-dd");

      let query = supabase
        .from("employee_responses")
        .select("*")
        .gte("response_date", fromDate);

      if (branchFilter !== "all") {
        query = query.eq("branch", branchFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // AI Analysis mutation
  const analyzeMutation = useMutation({
    mutationFn: async () => {
      // Fetch burnout alerts inside mutation to ensure we have the data
      const { data: burnoutData } = await supabase
        .from("burnout_alerts")
        .select("*")
        .eq("is_resolved", false);

      // Get mood distribution
      const moodDistribution = analytics.moodCountsArray;
      const topReasons = analytics.topReasons;

      // Get critical complaints (free text from bad moods)
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
          moodDistribution,
          topReasons,
          riskCount: burnoutData?.length || 0,
          responseRate: analytics.responseRate,
          overallIndex: analytics.satisfactionIndex,
          criticalComplaints,
        }),
      });

      if (!response.ok) {
        throw new Error("AI analiz xətası");
      }

      const result = await response.json();
      return result;
    },
    onSuccess: (data) => {
      setShowAIPanel(true);
    },
  });

  // Fetch burnout alerts
  const { data: burnoutAlerts = [] } = useQuery({
    queryKey: ["burnout-alerts"],
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

    return {
      total,
      moodCounts,
      moodCountsArray,
      topReasons,
      satisfactionIndex,
      responseRate: Math.min(100, Math.round((total / (parseInt(dateRange) * 10)) * 100)),
    };
  }, [responses, dateRange]);

  // Get unique branches
  const branches = useMemo(() => {
    return [...new Set(responses.map((r: any) => r.branch).filter(Boolean))].sort();
  }, [responses]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case "aşağı": return "bg-emerald-500";
      case "orta": return "bg-amber-500";
      case "yüksək": return "bg-orange-500";
      case "kritik": return "bg-rose-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Analitika</h1>
            <p className="text-muted-foreground">Əhval statistikası və AI analiz</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Son 7 gün</SelectItem>
                <SelectItem value="14">Son 14 gün</SelectItem>
                <SelectItem value="30">Son 30 gün</SelectItem>
                <SelectItem value="90">Son 3 ay</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
            <Button
              variant="default"
              size="sm"
              className="gradient-primary gap-2"
              onClick={() => analyzeMutation.mutate()}
              disabled={analyzeMutation.isPending || responses.length === 0}
            >
              {analyzeMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              AI Analiz
            </Button>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <BarChart3 className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ümumi Cavablar</p>
                  <p className="text-2xl font-bold">{analytics.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/10">
                  <TrendingUp className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Məmnuniyyət İndeksi</p>
                  <p className="text-2xl font-bold">{analytics.satisfactionIndex}%</p>
                </div>
              </div>
              <Progress value={analytics.satisfactionIndex} className="h-2 mt-3" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-500/10">
                  <Calendar className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ortalama Cavab</p>
                  <p className="text-2xl font-bold">{Math.round(analytics.total / parseInt(dateRange))}/gün</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-violet-500/10">
                  <AlertTriangle className="h-6 w-6 text-violet-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Risk Halları</p>
                  <p className="text-2xl font-bold">{burnoutAlerts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Analysis Panel */}
        <AnimatePresence>
          {showAIPanel && analyzeMutation.data && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      AI Analiz Nəticəsi
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setShowAIPanel(false)}>
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {analyzeMutation.data.analysis ? (
                    <AIAnalysisResult analysis={analyzeMutation.data.analysis} />
                  ) : (
                    <AIAnalysisResult analysis={analyzeMutation.data} />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Mood Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Əhval Bölgüsü</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {["Əla", "Yaxşı", "Normal", "Pis", "Çox pis"].map((mood) => {
                const count = analytics.moodCounts[mood] || 0;
                const percent = analytics.total > 0 ? Math.round((count / analytics.total) * 100) : 0;
                const colorClass =
                  mood === "Əla" || mood === "Yaxşı"
                    ? "bg-emerald-500"
                    : mood === "Normal"
                    ? "bg-amber-500"
                    : "bg-rose-500";

                return (
                  <div key={mood} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{mood}</span>
                      <span className="text-muted-foreground">
                        {count} cavab ({percent}%)
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        className={cn("h-full rounded-full", colorClass)}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Top Reasons */}
          <Card>
            <CardHeader>
              <CardTitle>Əsas Şikayət Səbəbləri</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.topReasons.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Hələ məlumat yoxdur</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analytics.topReasons.map((item: any, index: number) => (
                    <motion.div
                      key={item.reason}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{item.reason}</span>
                          <span className="text-sm text-muted-foreground">{item.count}</span>
                        </div>
                        <Progress
                          value={(item.count / (analytics.topReasons[0]?.count || 1)) * 100}
                          className="h-2"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Branch Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Filial Müqayisəsi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {branches.map((branch) => {
                const branchResponses = responses.filter((r: any) => r.branch === branch);
                const branchTotal = branchResponses.length;
                const goodCount =
                  branchResponses.filter((r: any) => r.mood === "Əla" || r.mood === "Yaxşı").length;
                const satisfaction =
                  branchTotal > 0 ? Math.round((goodCount / branchTotal) * 100) : 0;

                return (
                  <div
                    key={branch}
                    className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{branch}</h3>
                      <Badge
                        variant="outline"
                        className={cn(
                          satisfaction >= 70
                            ? "border-emerald-500 text-emerald-500"
                            : satisfaction >= 50
                            ? "border-amber-500 text-amber-500"
                            : "border-rose-500 text-rose-500"
                        )}
                      >
                        {satisfaction}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {branchTotal} cavab • {goodCount} müsbət
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

// AI Analysis Result Component
function AIAnalysisResult({ analysis }: { analysis: AIAnalysis }) {
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
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-card border">
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
      </div>

      {/* Observations */}
      {analysis.observations && analysis.observations.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Müşahidələr
          </h4>
          <div className="grid gap-2">
            {analysis.observations.map((obs, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
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
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Tövsiyyələr
          </h4>
          <div className="grid gap-2">
            {analysis.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <Target className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
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
            <MessageSquare className="h-4 w-4 text-primary" />
            Tapşırıqlar
          </h4>
          <div className="space-y-2">
            {analysis.tasks.map((task) => (
              <div
                key={task.id}
                className="p-3 rounded-lg border bg-card hover:shadow-md transition-shadow"
              >
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
  );
}