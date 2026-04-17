import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart as PieChartIcon, Smile, Meh, Frown } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MoodData {
  mood: string;
  count: number;
  percentage: number;
  color: string;
}

interface MoodPieChartProps {
  data: MoodData[];
  title?: string;
  description?: string;
}

const COLORS = {
  "status-good": "hsl(142, 76%, 36%)",
  "status-normal": "hsl(45, 93%, 47%)",
  "status-bad": "hsl(0, 84%, 60%)",
};

const GRADIENTS = {
  "status-good": ["#22c55e", "#16a34a"],
  "status-normal": ["#eab308", "#ca8a04"],
  "status-bad": ["#ef4444", "#dc2626"],
};

const getMoodIcon = (mood: string) => {
  switch (mood) {
    case "Yaxşı": return Smile;
    case "Normal": return Meh;
    case "Pis": return Frown;
    default: return Meh;
  }
};

// Active shape for hover effect
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 4}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" }}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 16}
        fill={fill}
        opacity={0.3}
      />
      <text x={cx} y={cy - 10} textAnchor="middle" fill="hsl(var(--foreground))" className="text-lg font-bold">
        {payload.name}
      </text>
      <text x={cx} y={cy + 15} textAnchor="middle" fill="hsl(var(--muted-foreground))" className="text-sm">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    </g>
  );
};

export const MoodPieChart = ({ 
  data, 
  title = "Əhval Bölgüsü", 
  description = "İşçilərin əhval paylanması" 
}: MoodPieChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const chartData = data.map(item => ({
    name: item.mood,
    value: item.count,
    percentage: item.percentage,
    fill: COLORS[item.color as keyof typeof COLORS] || "hsl(var(--primary))",
    gradient: GRADIENTS[item.color as keyof typeof GRADIENTS] || ["#6366f1", "#4f46e5"],
    color: item.color,
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const Icon = getMoodIcon(data.name);
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card/95 backdrop-blur-sm border border-border rounded-xl p-4 shadow-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${data.fill}20` }}>
              <Icon className="w-4 h-4" style={{ color: data.fill }} />
            </div>
            <p className="font-bold text-foreground">{data.name}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground font-semibold">{data.value}</span> nəfər
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Ümumi cavabların <span className="font-semibold" style={{ color: data.fill }}>{data.percentage}%</span>-i
          </p>
        </motion.div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage, index }: any) => {
    if (percentage < 8 || activeIndex === index) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-sm font-bold"
        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
      >
        {`${percentage}%`}
      </text>
    );
  };

  const CustomLegend = ({ payload }: any) => (
    <div className="flex justify-center gap-4 mt-4">
      {payload?.map((entry: any, index: number) => {
        const Icon = getMoodIcon(entry.value);
        const isActive = activeIndex === index;
        return (
          <motion.div
            key={entry.value}
            whileHover={{ scale: 1.05 }}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-all duration-300",
              isActive ? "bg-muted shadow-md" : "hover:bg-muted/50"
            )}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(undefined)}
          >
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <Icon className="w-4 h-4" style={{ color: entry.color }} />
            <span className="text-sm font-medium text-foreground">{entry.value}</span>
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-xl transition-all duration-500 group">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <CardHeader className="relative">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 group-hover:from-primary/30 group-hover:to-primary/10 transition-all duration-300">
              <PieChartIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-foreground">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          {/* Stats summary */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {chartData.map((item, idx) => {
              const Icon = getMoodIcon(item.name);
              return (
                <motion.div
                  key={item.name}
                  whileHover={{ scale: 1.02 }}
                  className={cn(
                    "text-center p-2 rounded-lg cursor-pointer transition-all duration-300",
                    activeIndex === idx ? "bg-muted shadow-inner" : "hover:bg-muted/50"
                  )}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(undefined)}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1" style={{ color: item.fill }} />
                  <p className="text-lg font-bold" style={{ color: item.fill }}>{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.name}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {chartData.map((item, index) => (
                    <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={item.gradient[0]} />
                      <stop offset="100%" stopColor={item.gradient[1]} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={90}
                  innerRadius={50}
                  dataKey="value"
                  animationDuration={800}
                  animationBegin={0}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(undefined)}
                  style={{ cursor: "pointer" }}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#gradient-${index})`}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Total indicator */}
          <div className="text-center mt-2 text-sm text-muted-foreground">
            Ümumi: <span className="font-semibold text-foreground">{total}</span> cavab
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
