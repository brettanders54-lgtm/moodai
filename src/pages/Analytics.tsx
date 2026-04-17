import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  Filter,
  RefreshCw,
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
import { AppLayout } from "@/components/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";

export default function AnalyticsNew() {
  const [dateRange, setDateRange] = useState("7");
  const [branchFilter, setBranchFilter] = useState("all");

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

  // Calculate analytics
  const analytics = useMemo(() => {
    const total = responses.length;
    const moodCounts = responses.reduce((acc: any, r: any) => {
      acc[r.mood] = (acc[r.mood] || 0) + 1;
      return acc;
    }, {});

    const reasonCounts = responses.reduce((acc: any, r: any) => {
      if (r.reason_category) {
        acc[r.reason_category] = (acc[r.reason_category] || 0) + 1;
      }
      return acc;
    }, {});

    const topReasons = Object.entries(reasonCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([reason, count]) => ({ reason, count }));

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
      topReasons,
      satisfactionIndex,
      responseRate: Math.min(100, Math.round((total / 100) * 100)),
    };
  }, [responses]);

  // Get unique branches
  const branches = useMemo(() => {
    return [...new Set(responses.map((r: any) => r.branch).filter(Boolean))].sort();
  }, [responses]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Analitika</h1>
            <p className="text-muted-foreground">Əhval statistikası və trendlər</p>
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
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
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
                  <Filter className="h-6 w-6 text-violet-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Filtr Seçildi</p>
                  <p className="text-2xl font-bold">{branchFilter === "all" ? "Hamısı" : branchFilter}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
                          value={(item.count / analytics.topReasons[0].count) * 100}
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