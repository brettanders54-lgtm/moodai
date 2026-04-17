import { useState } from "react";
import { motion } from "framer-motion";
import {
  UserCog,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AppLayout } from "@/components/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", label: "Gözləyir" },
  in_progress: { icon: AlertTriangle, color: "text-blue-500", bg: "bg-blue-500/10", label: "Davam edir" },
  completed: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Tamamlanmış" },
  cancelled: { icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-500/10", label: "Ləğv edilmiş" },
};

export default function ManagerActionsNew() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: actions = [], isLoading } = useQuery({
    queryKey: ["manager-actions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("manager_actions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const filteredActions = actions.filter((a: any) => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (searchTerm && !a.action_description?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Menecer Fəaliyyətləri</h1>
            <p className="text-muted-foreground">Burnout alertlərə görülən tədbirlər</p>
          </div>
          <Button size="sm" className="gradient-primary">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Fəaliyyət
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {Object.entries(STATUS_CONFIG).map(([key, config]) => {
            const count = actions.filter((a: any) => a.status === key).length;
            const Icon = config.icon;
            return (
              <Card key={key}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", config.bg)}>
                      <Icon className={cn("h-5 w-5", config.color)} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{config.label}</p>
                      <p className="text-xl font-bold">{count}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Actions Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Fəaliyyət Siyahısı</CardTitle>
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
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Hamısı</SelectItem>
                  <SelectItem value="pending">Gözləyir</SelectItem>
                  <SelectItem value="in_progress">Davam edir</SelectItem>
                  <SelectItem value="completed">Tamamlanmış</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fəaliyyət</TableHead>
                  <TableHead>Menecer</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Başlanğıc</TableHead>
                  <TableHead>Bitmə</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Yüklənir...
                    </TableCell>
                  </TableRow>
                ) : filteredActions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Məlumat tapılmadı
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredActions.map((action: any) => {
                    const statusConfig = STATUS_CONFIG[action.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                    const StatusIcon = statusConfig.icon;
                    return (
                      <TableRow key={action.id}>
                        <TableCell>
                          <div className="max-w-[300px]">
                            <p className="font-medium truncate">{action.action_description}</p>
                            {action.notes && (
                              <p className="text-sm text-muted-foreground truncate">{action.notes}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{action.manager_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{action.action_type?.replace("_", " ")}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("gap-1", statusConfig.bg, statusConfig.color)}>
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {action.started_at
                            ? new Date(action.started_at).toLocaleDateString("az-AZ")
                            : "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {action.completed_at
                            ? new Date(action.completed_at).toLocaleDateString("az-AZ")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}