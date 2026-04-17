import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, TrendingUp, TrendingDown, AlertTriangle, Brain, CheckCircle2, XCircle, BarChart3, Zap, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, BarChart, Bar, Legend, AreaChart, Area, Line } from "recharts";

const moodScores: Record<string, number> = {
  "Əla": 100,
  "Yaxşı": 75,
  "Normal": 50,
  "Pis": 25,
  "Çox pis": 0
};

interface BranchResult {
  branch: string;
  avgMood: number;
  avgSales: number;
  avgComplaints: number;
  stressLevel: number;
  responseCount: number;
  salesTrend: number;
  moodTrend: number;
  status: "success" | "warning" | "danger";
}

interface DailyData {
  date: string;
  sales: number;
  complaints: number;
  stressIndex: number;
  moodScore: number;
}

export const PredictiveAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<BranchResult[]>([]);
  const [dailyData, setDailyData] = useState<Map<string, DailyData[]>>(new Map());

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [metricsRes, responsesRes, prevResponsesRes] = await Promise.all([
        supabase.from('external_metrics').select('*').gte('metric_date', sevenDaysAgo).order('metric_date', { ascending: true }),
        supabase.from('employee_responses').select('*').gte('response_date', sevenDaysAgo),
        supabase.from('employee_responses').select('*').gte('response_date', fourteenDaysAgo).lt('response_date', sevenDaysAgo),
      ]);

      const metrics = metricsRes.data || [];
      const responses = responsesRes.data || [];
      const prevResponses = prevResponsesRes.data || [];

      // Group by branch
      const branchMap = new Map<string, {
        sales: number[], complaints: number[], moods: number[],
        prevMoods: number[], dailyMap: Map<string, { sales: number, complaints: number, moods: number[] }>
      }>();

      const initBranch = () => ({
        sales: [] as number[], complaints: [] as number[], moods: [] as number[],
        prevMoods: [] as number[], dailyMap: new Map<string, { sales: number, complaints: number, moods: number[] }>()
      });

      metrics.forEach(m => {
        if (!branchMap.has(m.branch)) branchMap.set(m.branch, initBranch());
        const b = branchMap.get(m.branch)!;
        b.sales.push(Number(m.daily_sales) || 0);
        b.complaints.push(m.customer_complaints || 0);

        if (!b.dailyMap.has(m.metric_date)) b.dailyMap.set(m.metric_date, { sales: 0, complaints: 0, moods: [] });
        const day = b.dailyMap.get(m.metric_date)!;
        day.sales += Number(m.daily_sales) || 0;
        day.complaints += m.customer_complaints || 0;
      });

      responses.forEach(r => {
        if (!branchMap.has(r.branch)) branchMap.set(r.branch, initBranch());
        const b = branchMap.get(r.branch)!;
        const score = moodScores[r.mood] ?? 50;
        b.moods.push(score);

        if (!b.dailyMap.has(r.response_date)) b.dailyMap.set(r.response_date, { sales: 0, complaints: 0, moods: [] });
        b.dailyMap.get(r.response_date)!.moods.push(score);
      });

      prevResponses.forEach(r => {
        if (!branchMap.has(r.branch)) branchMap.set(r.branch, initBranch());
        branchMap.get(r.branch)!.prevMoods.push(moodScores[r.mood] ?? 50);
      });

      // Calculate results
      const results: BranchResult[] = [];
      const allDaily = new Map<string, DailyData[]>();

      branchMap.forEach((data, branch) => {
        if (data.sales.length === 0 && data.moods.length === 0) return;

        const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
        const avgMood = avg(data.moods);
        const avgSales = avg(data.sales);
        const avgComplaints = avg(data.complaints);
        const stressLevel = 100 - avgMood;
        const prevAvgMood = avg(data.prevMoods);
        const moodTrend = data.prevMoods.length > 0 ? avgMood - prevAvgMood : 0;

        // Sales trend: first half vs second half
        const mid = Math.floor(data.sales.length / 2);
        const firstSales = avg(data.sales.slice(0, mid || 1));
        const secondSales = avg(data.sales.slice(mid));
        const salesTrend = firstSales > 0 ? ((secondSales - firstSales) / firstSales) * 100 : 0;

        // Status
        let status: "success" | "warning" | "danger" = "success";
        if (avgMood < 40 || avgComplaints > 6) status = "danger";
        else if (avgMood < 60 || avgComplaints > 3) status = "warning";

        results.push({ branch, avgMood, avgSales, avgComplaints, stressLevel, responseCount: data.moods.length, salesTrend, moodTrend, status });

        // Daily data
        const daily: DailyData[] = [];
        data.dailyMap.forEach((d, date) => {
          daily.push({
            date: new Date(date).toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' }),
            sales: Math.round(d.sales / 1000),
            complaints: d.complaints,
            stressIndex: d.moods.length > 0 ? Math.round(100 - avg(d.moods)) : 0,
            moodScore: d.moods.length > 0 ? Math.round(avg(d.moods)) : 0,
          });
        });
        allDaily.set(branch, daily);
      });

      results.sort((a, b) => a.avgMood - b.avgMood); // worst first
      setBranches(results);
      setDailyData(allDaily);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const successBranches = branches.filter(b => b.status === "success");
  const warningBranches = branches.filter(b => b.status === "warning");
  const dangerBranches = branches.filter(b => b.status === "danger");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Məlumatlar hesablanır...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <div className="text-3xl font-bold text-red-500">{dangerBranches.length}</div>
                <p className="text-sm text-muted-foreground">Kritik vəziyyət</p>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              {dangerBranches.map(b => (
                <div key={b.branch} className="text-sm text-red-600 font-medium">• {b.branch}</div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div>
                <div className="text-3xl font-bold text-yellow-600">{warningBranches.length}</div>
                <p className="text-sm text-muted-foreground">Diqqət tələb edən</p>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              {warningBranches.map(b => (
                <div key={b.branch} className="text-sm text-yellow-600 font-medium">• {b.branch}</div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-3xl font-bold text-green-500">{successBranches.length}</div>
                <p className="text-sm text-muted-foreground">Uğurlu</p>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              {successBranches.map(b => (
                <div key={b.branch} className="text-sm text-green-600 font-medium">• {b.branch}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branch Details Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Filiallar üzrə detallı göstəricilər</CardTitle>
          </div>
          <CardDescription>Son 7 gün ərzində əhval, satış və şikayət statistikası</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium">Filial</th>
                  <th className="text-center py-3 px-2 font-medium">Status</th>
                  <th className="text-center py-3 px-2 font-medium">Əhval</th>
                  <th className="text-center py-3 px-2 font-medium hidden sm:table-cell">Stress</th>
                  <th className="text-center py-3 px-2 font-medium">Satış/gün</th>
                  <th className="text-center py-3 px-2 font-medium">Şikayət/gün</th>
                  <th className="text-center py-3 px-2 font-medium hidden sm:table-cell">Satış Trend</th>
                  <th className="text-center py-3 px-2 font-medium hidden md:table-cell">Əhval Trend</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((b, i) => (
                  <motion.tr
                    key={b.branch}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border/50 hover:bg-muted/30"
                  >
                    <td className="py-3 px-2 font-medium">{b.branch}</td>
                    <td className="py-3 px-2 text-center">
                      <Badge variant={b.status === "danger" ? "destructive" : b.status === "warning" ? "secondary" : "outline"}
                        className={b.status === "success" ? "border-green-500 text-green-600" : b.status === "warning" ? "bg-yellow-100 text-yellow-700 border-yellow-300" : ""}>
                        {b.status === "danger" ? "Kritik" : b.status === "warning" ? "Diqqət" : "Yaxşı"}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Progress value={b.avgMood} className="w-16 h-2" />
                        <span className="font-mono text-xs">{b.avgMood.toFixed(0)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center hidden sm:table-cell">
                      <span className={`font-mono ${b.stressLevel > 60 ? 'text-red-500' : b.stressLevel > 40 ? 'text-yellow-500' : 'text-green-500'}`}>
                        {b.stressLevel.toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center font-mono">₼{(b.avgSales / 1000).toFixed(1)}k</td>
                    <td className="py-3 px-2 text-center">
                      <span className={`font-mono ${b.avgComplaints > 5 ? 'text-red-500 font-bold' : ''}`}>
                        {b.avgComplaints.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center hidden sm:table-cell">
                      <span className={`flex items-center justify-center gap-1 ${b.salesTrend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {b.salesTrend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {b.salesTrend > 0 ? '+' : ''}{b.salesTrend.toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center hidden md:table-cell">
                      <span className={`flex items-center justify-center gap-1 ${b.moodTrend > 0 ? 'text-green-500' : b.moodTrend < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {b.moodTrend > 0 ? <TrendingUp className="h-3 w-3" /> : b.moodTrend < 0 ? <TrendingDown className="h-3 w-3" /> : null}
                        {b.moodTrend > 0 ? '+' : ''}{b.moodTrend.toFixed(0)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Scatter Chart: Stress vs Complaints */}
      {branches.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-lg">Stress-Şikayət Korrelyasiyası</CardTitle>
            </div>
            <CardDescription>Hər nöqtə bir filialdır. Sağ üst = yüksək risk</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                  <XAxis type="number" dataKey="stressLevel" name="Stress" domain={[0, 100]}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    label={{ value: 'Stress Səviyyəsi (%)', position: 'bottom', offset: 40, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis type="number" dataKey="avgComplaints" name="Şikayətlər"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    label={{ value: 'Ort. Şikayət/gün', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }} />
                  <ZAxis type="number" dataKey="avgSales" range={[100, 500]} name="Satış" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }}
                    formatter={(value: number, name: string) => {
                      if (name === "Satış") return [`₼${(value / 1000).toFixed(0)}k`, name];
                      if (name === "Stress") return [`${value.toFixed(0)}%`, name];
                      return [value.toFixed(1), name];
                    }}
                    labelFormatter={(_: string, payload: any) => payload?.[0]?.payload?.branch || ''} />
                  <Scatter name="Filiallar" data={branches} fill="hsl(var(--primary))" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bar Chart: Branch Comparison */}
      {branches.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Filiallar müqayisəsi</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branches} margin={{ top: 10, right: 10, bottom: 40, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                  <XAxis dataKey="branch" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
                  <Legend />
                  <Bar dataKey="avgMood" name="Əhval Balı" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="stressLevel" name="Stress %" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avgComplaints" name="Ort. Şikayət" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
