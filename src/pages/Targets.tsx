import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Target, 
  ArrowLeft, 
  Plus,
  TrendingUp,
  TrendingDown,
  Calendar,
  Building2,
  CheckCircle2,
  AlertCircle,
  BarChart3
} from "lucide-react";
import { format, differenceInDays, addDays } from "date-fns";
import { az } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import obaLogo from "@/assets/oba-logo.jpg";

interface TargetData {
  id: string;
  branch: string | null;
  department: string | null;
  target_type: string;
  target_value: number;
  current_value: number;
  period_start: string;
  period_end: string;
  status: string;
  created_at: string;
}

const branches = [
  { id: "all", name: "Ümumi (Bütün filiallar)" },
  { id: "baku", name: "Bakı" },
  { id: "ganja", name: "Gəncə" },
  { id: "sumgait", name: "Sumqayıt" },
  { id: "mingachevir", name: "Mingəçevir" },
  { id: "shirvan", name: "Şirvan" },
  { id: "lankaran", name: "Lənkəran" },
  { id: "shaki", name: "Şəki" },
  { id: "quba", name: "Quba" },
];

const targetTypes = [
  { id: "satisfaction_rate", name: "Məmnuniyyət dərəcəsi (%)" },
  { id: "response_rate", name: "Cavab dərəcəsi (%)" },
  { id: "burnout_reduction", name: "Burnout azalması (%)" },
  { id: "resolution_time", name: "Həll müddəti (gün)" },
];

const Targets = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTarget, setNewTarget] = useState({
    branch: "all",
    target_type: "satisfaction_rate",
    target_value: 80,
    period_start: format(new Date(), "yyyy-MM-dd"),
    period_end: format(addDays(new Date(), 30), "yyyy-MM-dd"),
  });

  const { data: targets = [], isLoading } = useQuery<TargetData[]>({
    queryKey: ["targets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("satisfaction_targets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Calculate current values from responses
  const { data: responses = [] } = useQuery({
    queryKey: ["target-responses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_responses")
        .select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const calculateCurrentValue = (target: TargetData): number => {
    const periodResponses = responses.filter(r => {
      const date = new Date(r.response_date);
      return date >= new Date(target.period_start) && date <= new Date(target.period_end) &&
        (target.branch === null || target.branch === "all" || r.branch === target.branch);
    });

    if (periodResponses.length === 0) return 0;

    if (target.target_type === "satisfaction_rate") {
      const good = periodResponses.filter(r => r.mood === "Yaxşı").length;
      return Math.round((good / periodResponses.length) * 100);
    }
    
    return Math.round((periodResponses.length / 100) * 100); // Placeholder
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("satisfaction_targets")
        .insert({
          branch: newTarget.branch === "all" ? null : newTarget.branch,
          department: newTarget.branch === "all" ? null : branches.find(b => b.id === newTarget.branch)?.name,
          target_type: newTarget.target_type,
          target_value: newTarget.target_value,
          period_start: newTarget.period_start,
          period_end: newTarget.period_end,
          created_by: user?.id,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["targets"] });
      toast({ title: "Hədəf yaradıldı!" });
      setIsDialogOpen(false);
      setNewTarget({
        branch: "all",
        target_type: "satisfaction_rate",
        target_value: 80,
        period_start: format(new Date(), "yyyy-MM-dd"),
        period_end: format(addDays(new Date(), 30), "yyyy-MM-dd"),
      });
    },
    onError: () => {
      toast({ title: "Xəta baş verdi", variant: "destructive" });
    },
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const activeTargets = targets.filter(t => t.status === "active");
  const achievedCount = activeTargets.filter(t => calculateCurrentValue(t) >= t.target_value).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/70 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/hr-panel")}
                className="rounded-xl"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-lg">
                <span className="text-2xl">😊</span>
              </div>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-500" />
                  Hədəf Təyini
                </h1>
                <p className="text-sm text-muted-foreground">Məmnuniyyət hədəflərini təyin et və izlə</p>
              </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-emerald-600 to-green-600">
                  <Plus className="w-4 h-4" />
                  Yeni Hədəf
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yeni Hədəf Yarat</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Filial</Label>
                    <Select value={newTarget.branch} onValueChange={(v) => setNewTarget(p => ({ ...p, branch: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map(b => (
                          <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Hədəf tipi</Label>
                    <Select value={newTarget.target_type} onValueChange={(v) => setNewTarget(p => ({ ...p, target_type: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {targetTypes.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Hədəf dəyəri</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={newTarget.target_value}
                      onChange={(e) => setNewTarget(p => ({ ...p, target_value: parseInt(e.target.value) || 0 }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Başlama tarixi</Label>
                      <Input
                        type="date"
                        value={newTarget.period_start}
                        onChange={(e) => setNewTarget(p => ({ ...p, period_start: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Bitmə tarixi</Label>
                      <Input
                        type="date"
                        value={newTarget.period_end}
                        onChange={(e) => setNewTarget(p => ({ ...p, period_end: e.target.value }))}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => createMutation.mutate()}
                    disabled={createMutation.isPending}
                    className="w-full bg-gradient-to-r from-emerald-600 to-green-600"
                  >
                    {createMutation.isPending ? "Yaradılır..." : "Yarat"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Summary */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Aktiv Hədəflər", value: activeTargets.length, color: "from-primary to-blue-500", icon: Target },
            { label: "Əldə Edilib", value: achievedCount, color: "from-emerald-500 to-green-500", icon: CheckCircle2 },
            { label: "Davam edir", value: activeTargets.length - achievedCount, color: "from-amber-500 to-yellow-500", icon: TrendingUp },
            { label: "Orta İrəliləyiş", value: `${activeTargets.length > 0 ? Math.round(activeTargets.reduce((acc, t) => acc + Math.min((calculateCurrentValue(t) / t.target_value) * 100, 100), 0) / activeTargets.length) : 0}%`, color: "from-violet-500 to-purple-500", icon: BarChart3 },
          ].map((stat) => (
            <motion.div key={stat.label} variants={itemVariants}>
              <Card className="border-border/50 hover:shadow-lg transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Targets List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : targets.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="p-12 text-center">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Hələ hədəf yoxdur</p>
              <p className="text-muted-foreground mb-4">İlk hədəfinizi yaradın</p>
              <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Yeni Hədəf
              </Button>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 gap-6"
          >
            {targets.map((target) => {
              const currentValue = calculateCurrentValue(target);
              const progress = Math.min((currentValue / target.target_value) * 100, 100);
              const isAchieved = currentValue >= target.target_value;
              const daysLeft = differenceInDays(new Date(target.period_end), new Date());
              const targetType = targetTypes.find(t => t.id === target.target_type);

              return (
                <motion.div key={target.id} variants={itemVariants}>
                  <Card className={`border-border/50 hover:shadow-lg transition-all ${isAchieved ? "ring-2 ring-emerald-500/30" : ""}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {isAchieved ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <Target className="w-5 h-5 text-primary" />
                            )}
                            {targetType?.name || target.target_type}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Building2 className="w-3 h-3" />
                            {target.branch ? branches.find(b => b.id === target.branch)?.name : "Bütün filiallar"}
                          </CardDescription>
                        </div>
                        <Badge variant={isAchieved ? "default" : daysLeft < 7 ? "destructive" : "secondary"}>
                          {isAchieved ? "Əldə edilib" : daysLeft > 0 ? `${daysLeft} gün qaldı` : "Müddət bitib"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">İrəliləyiş</span>
                          <span className="font-medium">
                            {currentValue}% / {target.target_value}%
                          </span>
                        </div>
                        <Progress 
                          value={progress} 
                          className={`h-3 ${isAchieved ? "[&>div]:bg-emerald-500" : ""}`}
                        />
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(target.period_start), "dd MMM", { locale: az })} - {format(new Date(target.period_end), "dd MMM yyyy", { locale: az })}
                        </span>
                        <span className={`flex items-center gap-1 ${isAchieved ? "text-emerald-600" : progress >= 50 ? "text-amber-600" : "text-rose-600"}`}>
                          {isAchieved ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {Math.round(progress)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Targets;
