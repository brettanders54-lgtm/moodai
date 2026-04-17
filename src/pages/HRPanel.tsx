import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Settings,
  Bell,
  Shield,
  Database,
  RefreshCw,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

function StatCard({ title, value, change, icon: Icon, gradient }: {
  title: string;
  value: string | number;
  change: number;
  icon: React.ElementType;
  gradient: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="stat-card">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold mt-2">{value}</p>
              <p className={cn("text-sm mt-1", change >= 0 ? "text-emerald-500" : "text-rose-500")}>
                {change >= 0 ? "+" : ""}{change}% keçən aya
              </p>
            </div>
            <div className={cn("p-3 rounded-xl", gradient)}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function HRPanelNew() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch burnout alerts
  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["burnout-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("burnout_alerts")
        .select("*")
        .order("detected_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch employee responses for stats
  const { data: responses = [] } = useQuery({
    queryKey: ["employee-responses-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_responses")
        .select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const totalEmployees = responses.length;
  const atRiskCount = alerts.filter((a: any) => !a.is_resolved).length;
  const resolvedCount = alerts.filter((a: any) => a.is_resolved).length;
  const criticalCount = alerts.filter((a: any) => a.risk_score >= 70 && !a.is_resolved).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">HR Panel</h1>
            <p className="text-muted-foreground">İşçi məmnuniyyəti və burnout idarəetməsi</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Yenilə
            </Button>
            <Button size="sm" className="gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Alert
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Ümumi İşçilər"
            value={totalEmployees}
            change={12}
            icon={Users}
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard
            title="Risk Altında"
            value={atRiskCount}
            change={-8}
            icon={AlertTriangle}
            gradient="bg-gradient-to-br from-amber-500 to-amber-600"
          />
          <StatCard
            title="Həll Edilmiş"
            value={resolvedCount}
            change={15}
            icon={CheckCircle2}
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
          />
          <StatCard
            title="Kritik Hallar"
            value={criticalCount}
            change={criticalCount > 0 ? 5 : 0}
            icon={Shield}
            gradient="bg-gradient-to-br from-rose-500 to-rose-600"
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="alerts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="alerts">Burnout Alertlər</TabsTrigger>
            <TabsTrigger value="employees">İşçi Siyahısı</TabsTrigger>
            <TabsTrigger value="settings">Tənzimləmələr</TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Son Burnout Alertlər</CardTitle>
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
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Hamısı</SelectItem>
                      <SelectItem value="active">Aktiv</SelectItem>
                      <SelectItem value="resolved">Həll edilmiş</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>İşçi Kodu</TableHead>
                      <TableHead>Departament</TableHead>
                      <TableHead>Filial</TableHead>
                      <TableHead>Risk Skoru</TableHead>
                      <TableHead>Səbəb</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tarix</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alertsLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          Yüklənir...
                        </TableCell>
                      </TableRow>
                    ) : alerts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          Alert tapılmadı
                        </TableCell>
                      </TableRow>
                    ) : (
                      alerts
                        .filter((a: any) => {
                          if (statusFilter === "active") return !a.is_resolved;
                          if (statusFilter === "resolved") return a.is_resolved;
                          return true;
                        })
                        .filter((a: any) =>
                          a.employee_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.department?.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((alert: any) => (
                          <TableRow key={alert.id}>
                            <TableCell className="font-medium">{alert.employee_code}</TableCell>
                            <TableCell>{alert.department}</TableCell>
                            <TableCell>{alert.branch}</TableCell>
                            <TableCell>
                              <Badge
                                className={cn(
                                  alert.risk_score >= 70 ? "bg-rose-500" :
                                  alert.risk_score >= 50 ? "bg-amber-500" : "bg-emerald-500"
                                )}
                              >
                                {alert.risk_score}%
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {alert.reason_category}
                            </TableCell>
                            <TableCell>
                              {alert.is_resolved ? (
                                <Badge variant="outline" className="border-emerald-500 text-emerald-500">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Həll edilmiş
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-amber-500 text-amber-500">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Gözləyir
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(alert.detected_at).toLocaleDateString("az-AZ")}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees">
            <Card>
              <CardHeader>
                <CardTitle>İşçi Siyahısı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>İşçi siyahısı tezliklə əlavə olunacaq</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Tənzimləmələr</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Burnout Bildirişləri</p>
                      <p className="text-sm text-muted-foreground">Risk yüksəldikdə email göndər</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Konfiqurasiya</Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Məlumat İdxalı</p>
                      <p className="text-sm text-muted-foreground">Excel faylından işçi məlumatları</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">İdxal Et</Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Rol İdarəetməsi</p>
                      <p className="text-sm text-muted-foreground">İstifadəçi rollarını təyin et</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">İdarə Et</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}