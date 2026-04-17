import { useState } from "react";
import { motion } from "framer-motion";
import {
  Target,
  Plus,
  Search,
  MoreHorizontal,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppLayout } from "@/components/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export default function TargetsNew() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: targets = [], isLoading } = useQuery({
    queryKey: ["satisfaction-targets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("satisfaction_targets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const filteredTargets = targets.filter((t: any) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (searchTerm && !t.branch?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const activeCount = targets.filter((t: any) => t.status === "active").length;
  const achievedCount = targets.filter((t: any) => t.current_value >= t.target_value).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Məqsədlər</h1>
            <p className="text-muted-foreground">Məmnuniyyət hədəfləri və nəticələr</p>
          </div>
          <Button size="sm" className="gradient-primary">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Məqsəd
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <Target className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ümumi Məqsədlər</p>
                  <p className="text-2xl font-bold">{targets.length}</p>
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
                  <p className="text-sm text-muted-foreground">Aktiv</p>
                  <p className="text-2xl font-bold">{activeCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-violet-500/10">
                  <CheckCircle2 className="h-6 w-6 text-violet-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Uğurla Tamamlanmış</p>
                  <p className="text-2xl font-bold">{achievedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Targets List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Məqsəd Siyahısı</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Axtar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Hamısı</SelectItem>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="completed">Tamamlanmış</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                <div className="col-span-full text-center py-8">Yüklənir...</div>
              ) : filteredTargets.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  Məlumat tapılmadı
                </div>
              ) : (
                filteredTargets.map((target: any) => {
                  const progress = target.target_value > 0
                    ? Math.round((target.current_value / target.target_value) * 100)
                    : 0;
                  const isAchieved = target.current_value >= target.target_value;

                  return (
                    <motion.div
                      key={target.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{target.branch || "Ümumi"}</h3>
                          <p className="text-sm text-muted-foreground">{target.department || "Bütün departamentlər"}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            isAchieved
                              ? "border-emerald-500 text-emerald-500"
                              : "border-blue-500 text-blue-500"
                          )}
                        >
                          {isAchieved ? "Uğurlu" : "Aktiv"}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Cari dəyər</span>
                          <span className="font-semibold">{target.current_value}%</span>
                        </div>
                        <Progress value={Math.min(progress, 100)} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Hədəf: {target.target_value}%</span>
                          <span>{progress}%</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-4 pt-3 border-t">
                        <span className="text-xs text-muted-foreground">
                          {target.period_start} - {target.period_end}
                        </span>
                        <Button variant="ghost" size="sm" className="h-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}