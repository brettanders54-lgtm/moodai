import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
  Calendar,
  RefreshCw,
  ArrowRight,
  Smile,
  Meh,
  Frown,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { az } from "date-fns/locale";
import { AppLayout } from "@/components/AppLayout";

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ElementType;
  gradient: string;
  delay?: number;
}

function StatCard({ title, value, change, icon: Icon, gradient, delay = 0 }: StatCardProps) {
  const isPositive = change >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="stat-card card-lift">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground font-medium">{title}</p>
              <p className="text-3xl font-bold tracking-tight">{value}</p>
              <div className="flex items-center gap-1.5">
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-rose-500" />
                )}
                <span className={cn("text-sm font-medium", isPositive ? "text-emerald-500" : "text-rose-500")}>
                  {Math.abs(change)}%
                </span>
                <span className="text-xs text-muted-foreground">keçən həftəyə</span>
              </div>
            </div>
            <div className={cn("p-4 rounded-2xl", gradient)}>
              <Icon className="h-7 w-7 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MoodCard({ mood, count, percentage, icon: Icon, gradient }: {
  mood: string;
  count: number;
  percentage: number;
  icon: React.ElementType;
  gradient: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-2xl"
    >
      <div className={cn("absolute inset-0 opacity-10", gradient)} />
      <Card className="relative border-0 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className={cn("p-3 rounded-xl", gradient)}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">{mood}</p>
              <p className="text-2xl font-bold">{count}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{percentage}%</p>
              <Progress value={percentage} className="h-2 w-20 mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function RiskAlert({ level, message }: { level: "high" | "medium" | "low"; message: string }) {
  const config = {
    high: { color: "bg-rose-500", text: "text-rose-600 dark:text-rose-400", label: "Yüksək Risk" },
    medium: { color: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", label: "Orta Risk" },
    low: { color: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", label: "Aşağı Risk" },
  };
  const { color, text, label } = config[level];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border"
    >
      <div className={cn("p-2 rounded-lg", level === "high" ? "bg-rose-500/10" : level === "medium" ? "bg-amber-500/10" : "bg-emerald-500/10")}>
        <AlertTriangle className={cn("h-5 w-5", text)} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("border-0", text, "bg-current/10")}>
            {label}
          </Badge>
          <span className="text-sm text-muted-foreground">{message}</span>
        </div>
      </div>
      <Button variant="ghost" size="sm" className="gap-1">
        Bax <ArrowRight className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}

export default function DashboardNew() {
  const [dateRange] = useState({
    from: subDays(new Date(), 7),
    to: new Date(),
  });

  // Fetch data
  const { data: responses = [], isLoading, refetch } = useQuery({
    queryKey: ["employee-responses-dashboard"],
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

  // Calculate stats
  const totalResponses = responses.length;
  const moodCounts = {
    good: responses.filter((r: any) => r.mood === "Yaxşı").length,
    normal: responses.filter((r: any) => r.mood === "Normal").length,
    bad: responses.filter((r: any) => r.mood === "Pis").length,
  };
  const satisfactionIndex = totalResponses > 0
    ? Math.round((moodCounts.good * 100 + moodCounts.normal * 50 + moodCounts.bad * 0) / totalResponses)
    : 0;

  const riskLevel = satisfactionIndex >= 70 ? "low" : satisfactionIndex >= 50 ? "medium" : "high";

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Xoş gəldiniz!</h1>
            <p className="text-muted-foreground">
              {format(new Date(), "d MMMM yyyy,EEEE", { locale: az })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
              Yenilə
            </Button>
            <Button size="sm" className="gradient-primary">
              <Activity className="h-4 w-4 mr-2" />
              AI Analiz
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Ümumi Cavablar"
            value={totalResponses}
            change={12}
            icon={Users}
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
            delay={0}
          />
          <StatCard
            title="Məmnuniyyət İndeksi"
            value={`${satisfactionIndex}%`}
            change={satisfactionIndex >= 70 ? 8 : -5}
            icon={Smile}
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
            delay={0.1}
          />
          <StatCard
            title="Risk Səviyyəsi"
            value={riskLevel === "low" ? "Aşağı" : riskLevel === "medium" ? "Orta" : "Yüksək"}
            change={-3}
            icon={AlertTriangle}
            gradient={riskLevel === "low" ? "bg-gradient-to-br from-emerald-500 to-emerald-600" :
                     riskLevel === "medium" ? "bg-gradient-to-br from-amber-500 to-amber-600" :
                     "bg-gradient-to-br from-rose-500 to-rose-600"}
            delay={0.2}
          />
          <StatCard
            title="Filiallar"
            value="9"
            change={0}
            icon={Activity}
            gradient="bg-gradient-to-br from-violet-500 to-violet-600"
            delay={0.3}
          />
        </div>

        {/* Mood Distribution */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Əhval Bölgüsü
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                <MoodCard
                  mood="Yaxşı"
                  count={moodCounts.good}
                  percentage={totalResponses > 0 ? Math.round((moodCounts.good / totalResponses) * 100) : 0}
                  icon={Smile}
                  gradient="gradient-mood-good"
                />
                <MoodCard
                  mood="Normal"
                  count={moodCounts.normal}
                  percentage={totalResponses > 0 ? Math.round((moodCounts.normal / totalResponses) * 100) : 0}
                  icon={Meh}
                  gradient="gradient-mood-normal"
                />
                <MoodCard
                  mood="Pis"
                  count={moodCounts.bad}
                  percentage={totalResponses > 0 ? Math.round((moodCounts.bad / totalResponses) * 100) : 0}
                  icon={Frown}
                  gradient="gradient-mood-bad"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Diqqət Tələb Edən
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <RiskAlert level={riskLevel} message="Filial üzrə stress səviyyəsi" />
              {moodCounts.bad > 2 && (
                <RiskAlert level="medium" message="Pis əhval sayı artıb" />
              )}
              {totalResponses < 10 && (
                <RiskAlert level="low" message="Cavab dərəcəsi aşağıdır" />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Chart Placeholder */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Son Cavablar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {responses.slice(0, 5).map((r: any, i: number) => (
                  <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-fast">
                    <div className={cn(
                      "p-2 rounded-lg",
                      r.mood === "Yaxşı" ? "bg-emerald-500/10 text-emerald-600" :
                      r.mood === "Normal" ? "bg-amber-500/10 text-amber-600" :
                      "bg-rose-500/10 text-rose-600"
                    )}>
                      {r.mood === "Yaxşı" ? <Smile className="h-4 w-4" /> :
                       r.mood === "Normal" ? <Meh className="h-4 w-4" /> :
                       <Frown className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{r.department || "Departament"}</p>
                      <p className="text-xs text-muted-foreground">{r.branch}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString("az-AZ")}
                    </span>
                  </div>
                ))}
                {responses.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>Hələ cavab yoxdur</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Həftəlik Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                <div className="text-center">
                  <Activity className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>Qrafik tezliklə əlavə olunacaq</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}