import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, TrendingUp, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ReasonData {
  reason: string;
  count: number;
  percentage: number;
}

interface ReasonsBarChartProps {
  data: ReasonData[];
  title?: string;
  description?: string;
}

const GRADIENT_COLORS = [
  { start: "#6366f1", end: "#4f46e5" }, // indigo
  { start: "#3b82f6", end: "#2563eb" }, // blue
  { start: "#8b5cf6", end: "#7c3aed" }, // violet
  { start: "#ec4899", end: "#db2777" }, // pink
  { start: "#f97316", end: "#ea580c" }, // orange
];

export const ReasonsBarChart = ({ 
  data, 
  title = "Şikayət Səbəbləri", 
  description = "Ən çox qeyd olunan problemlər" 
}: ReasonsBarChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const totalComplaints = data.reduce((sum, item) => sum + item.count, 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const colorIndex = data.findIndex(d => d.reason === label);
      const colors = GRADIENT_COLORS[colorIndex % GRADIENT_COLORS.length];
      return (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card/95 backdrop-blur-sm border border-border rounded-xl p-4 shadow-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ background: `linear-gradient(135deg, ${colors.start}, ${colors.end})` }}
            />
            <p className="font-bold text-foreground">{label}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground font-semibold text-lg">{payload[0].value}</span> şikayət
          </p>
          <div className="flex items-center gap-1 mt-1">
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{ 
                  width: `${payload[0].payload.percentage}%`,
                  background: `linear-gradient(90deg, ${colors.start}, ${colors.end})`
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground ml-2">{payload[0].payload.percentage}%</span>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  const CustomBar = (props: any) => {
    const { x, y, width, height, index } = props;
    const colors = GRADIENT_COLORS[index % GRADIENT_COLORS.length];
    const isActive = activeIndex === index;
    
    return (
      <g>
        <defs>
          <linearGradient id={`barGradient-${index}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>
          <filter id={`shadow-${index}`}>
            <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor={colors.start} floodOpacity="0.3"/>
          </filter>
        </defs>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={`url(#barGradient-${index})`}
          rx={4}
          ry={4}
          filter={isActive ? `url(#shadow-${index})` : undefined}
          style={{ 
            transition: "all 0.3s ease",
            transform: isActive ? "scaleX(1.02)" : "scaleX(1)",
            transformOrigin: "left center"
          }}
        />
        {isActive && (
          <rect
            x={x + width + 4}
            y={y + height / 2 - 6}
            width={12}
            height={12}
            fill={colors.start}
            rx={6}
            opacity={0.5}
          />
        )}
      </g>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-xl transition-all duration-500 group">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-500/5 group-hover:from-violet-500/30 group-hover:to-violet-500/10 transition-all duration-300">
                <BarChart3 className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <CardTitle className="text-foreground">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">{totalComplaints}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          {/* Top reasons summary */}
          <div className="flex flex-wrap gap-2 mb-4">
          {data.slice(0, 3).map((item, idx) => {
              const colors = GRADIENT_COLORS[idx % GRADIENT_COLORS.length];
              return (
                <motion.div
                  key={item.reason}
                  whileHover={{ scale: 1.02 }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-all duration-300",
                    activeIndex === idx ? "shadow-md" : ""
                  )}
                  style={{ 
                    background: activeIndex === idx 
                      ? `linear-gradient(135deg, ${colors.start}20, ${colors.end}10)`
                      : "hsl(var(--muted) / 0.5)"
                  }}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ background: `linear-gradient(135deg, ${colors.start}, ${colors.end})` }}
                  />
                  <span className="text-xs font-medium text-foreground">{item.reason}</span>
                  <span className="text-xs text-muted-foreground">({item.count})</span>
                </motion.div>
              );
            })}
          </div>

          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis 
                  type="number" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  type="category" 
                  dataKey="reason" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  width={75}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted) / 0.3)", radius: 4 }} />
                <Bar 
                  dataKey="count" 
                  shape={<CustomBar />}
                  animationDuration={1000}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
