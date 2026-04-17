import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, Calendar } from "lucide-react";
import { format, parseISO, eachDayOfInterval } from "date-fns";
import { az } from "date-fns/locale";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Response {
  response_date: string;
  mood: string;
}

interface TrendLineChartProps {
  responses: Response[];
  dateRange: { from: Date; to: Date };
  title?: string;
  description?: string;
}

export const TrendLineChart = ({ 
  responses, 
  dateRange,
  title = "Əhval Trendi", 
  description = "Günlər üzrə məmnuniyyət göstəricisi" 
}: TrendLineChartProps) => {
  const [activePoint, setActivePoint] = useState<any>(null);

  // Generate all days in range
  const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
  
  // Group responses by date
  const responsesByDate: Record<string, { good: number; normal: number; bad: number; total: number }> = {};
  
  days.forEach(day => {
    const dateStr = format(day, "yyyy-MM-dd");
    responsesByDate[dateStr] = { good: 0, normal: 0, bad: 0, total: 0 };
  });

  responses.forEach(r => {
    const dateStr = r.response_date;
    if (responsesByDate[dateStr]) {
      responsesByDate[dateStr].total++;
      if (r.mood === "Yaxşı") responsesByDate[dateStr].good++;
      else if (r.mood === "Normal") responsesByDate[dateStr].normal++;
      else if (r.mood === "Pis") responsesByDate[dateStr].bad++;
    }
  });

  const chartData = Object.entries(responsesByDate).map(([date, counts]) => ({
    date,
    displayDate: format(parseISO(date), "dd MMM", { locale: az }),
    satisfaction: counts.total > 0 
      ? Math.round(((counts.good * 100 + counts.normal * 50) / counts.total))
      : null,
    responses: counts.total,
    good: counts.good,
    normal: counts.normal,
    bad: counts.bad,
  }));

  // Calculate average satisfaction
  const validData = chartData.filter(d => d.satisfaction !== null);
  const avgSatisfaction = validData.length > 0 
    ? Math.round(validData.reduce((sum, d) => sum + (d.satisfaction || 0), 0) / validData.length)
    : 0;

  // Calculate trend
  const recentData = validData.slice(-7);
  const olderData = validData.slice(-14, -7);
  const recentAvg = recentData.length > 0 
    ? recentData.reduce((sum, d) => sum + (d.satisfaction || 0), 0) / recentData.length
    : 0;
  const olderAvg = olderData.length > 0 
    ? olderData.reduce((sum, d) => sum + (d.satisfaction || 0), 0) / olderData.length
    : recentAvg;
  const trend = recentAvg - olderAvg;
  const isPositiveTrend = trend >= 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/95 backdrop-blur-sm border border-border rounded-xl p-4 shadow-xl min-w-[180px]"
        >
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
            <Calendar className="w-4 h-4 text-primary" />
            <p className="font-bold text-foreground">{data.displayDate}</p>
          </div>
          
          {data.satisfaction !== null ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Məmnuniyyət</span>
                <span className={cn(
                  "text-lg font-bold",
                  data.satisfaction >= 70 ? "text-emerald-500" : 
                  data.satisfaction >= 40 ? "text-amber-500" : "text-rose-500"
                )}>
                  {data.satisfaction}%
                </span>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Yaxşı
                  </span>
                  <span className="font-medium">{data.good}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Normal
                  </span>
                  <span className="font-medium">{data.normal}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Pis
                  </span>
                  <span className="font-medium">{data.bad}</span>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
                Ümumi cavab: <span className="font-semibold text-foreground">{data.responses}</span>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Məlumat yoxdur</p>
          )}
        </motion.div>
      );
    }
    return null;
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload, index } = props;
    if (payload.satisfaction === null) return null;
    
    const isActive = activePoint?.index === index;
    const color = payload.satisfaction >= 70 ? "#22c55e" : 
                  payload.satisfaction >= 40 ? "#eab308" : "#ef4444";
    
    return (
      <g>
        {isActive && (
          <circle
            cx={cx}
            cy={cy}
            r={12}
            fill={color}
            opacity={0.2}
          />
        )}
        <circle
          cx={cx}
          cy={cy}
          r={isActive ? 6 : 4}
          fill={color}
          stroke="white"
          strokeWidth={2}
          style={{ transition: "all 0.2s ease", cursor: "pointer" }}
        />
      </g>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-xl transition-all duration-500 group">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 group-hover:from-emerald-500/30 group-hover:to-emerald-500/10 transition-all duration-300">
                <Activity className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <CardTitle className="text-foreground">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </div>
            </div>
            
            {/* Stats badges */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-sm bg-muted/50 px-3 py-1.5 rounded-full">
                <span className="text-muted-foreground">Ort:</span>
                <span className={cn(
                  "font-bold",
                  avgSatisfaction >= 70 ? "text-emerald-500" : 
                  avgSatisfaction >= 40 ? "text-amber-500" : "text-rose-500"
                )}>
                  {avgSatisfaction}%
                </span>
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                isPositiveTrend ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
              )}>
                {isPositiveTrend ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span className="font-medium">{Math.abs(Math.round(trend))}%</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={chartData} 
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                onMouseMove={(e) => {
                  if (e.activePayload) {
                    setActivePoint({ index: e.activeTooltipIndex, data: e.activePayload[0]?.payload });
                  }
                }}
                onMouseLeave={() => setActivePoint(null)}
              >
                <defs>
                  <linearGradient id="colorSatisfactionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4}/>
                    <stop offset="50%" stopColor="#22c55e" stopOpacity={0.1}/>
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#22c55e"/>
                    <stop offset="50%" stopColor="#3b82f6"/>
                    <stop offset="100%" stopColor="#22c55e"/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis 
                  dataKey="displayDate" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                  tickLine={false}
                  axisLine={false}
                />
                <ReferenceLine 
                  y={avgSatisfaction} 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeDasharray="5 5"
                  strokeOpacity={0.5}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="satisfaction"
                  stroke="url(#lineGradient)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSatisfactionGradient)"
                  connectNulls
                  animationDuration={1000}
                  dot={<CustomDot />}
                  activeDot={{ r: 8, fill: "#22c55e", stroke: "white", strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500 rounded" />
              <span>Məmnuniyyət trendi</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 border-t-2 border-dashed border-muted-foreground/50" />
              <span>Orta göstərici ({avgSatisfaction}%)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
