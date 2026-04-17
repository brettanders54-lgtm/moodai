import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Users,
  Target,
  Star,
  Calendar,
  MessageSquare,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { az } from "date-fns/locale";
import { AppLogo } from "@/components/AppLogo";
import { MobileNavMenu } from "@/components/MobileNavMenu";

type ActionStatus = "pending" | "in_progress" | "completed" | "cancelled";
type ActionType = "one_on_one" | "workload_adjustment" | "schedule_change" | "team_meeting" | "training" | "other";

interface BurnoutAlert {
  id: string;
  employee_code: string;
  department: string;
  branch: string;
  risk_score: number;
  reason_category: string;
  detected_at: string;
  is_resolved: boolean;
}

interface ManagerAction {
  id: string;
  alert_id: string;
  manager_name: string;
  action_type: ActionType;
  action_description: string;
  status: ActionStatus;
  effectiveness_score: number | null;
  notes: string | null;
  started_at: string;
  completed_at: string | null;
  burnout_alerts?: BurnoutAlert;
}

const actionTypeLabels: Record<ActionType, string> = {
  one_on_one: "1:1 Görüş",
  workload_adjustment: "İş Yükü Tənzimləmə",
  schedule_change: "Qrafik Dəyişikliyi",
  team_meeting: "Komanda Görüşü",
  training: "Təlim",
  other: "Digər"
};

const statusLabels: Record<ActionStatus, string> = {
  pending: "Gözləyir",
  in_progress: "Davam edir",
  completed: "Tamamlandı",
  cancelled: "Ləğv edildi"
};

const statusColors: Record<ActionStatus, string> = {
  pending: "bg-amber-500/20 text-amber-600 border-amber-500/30",
  in_progress: "bg-blue-500/20 text-blue-600 border-blue-500/30",
  completed: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30",
  cancelled: "bg-red-500/20 text-red-600 border-red-500/30"
};

const ManagerActions = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<BurnoutAlert[]>([]);
  const [actions, setActions] = useState<ManagerAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<string>("");
  const [newAction, setNewAction] = useState({
    manager_name: "",
    action_type: "" as ActionType,
    action_description: "",
    notes: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch burnout alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('burnout_alerts')
        .select('*')
        .order('detected_at', { ascending: false });

      if (alertsError) throw alertsError;
      setAlerts(alertsData || []);

      // Fetch manager actions with related alerts
      const { data: actionsData, error: actionsError } = await supabase
        .from('manager_actions')
        .select('*, burnout_alerts(*)')
        .order('started_at', { ascending: false });

      if (actionsError) throw actionsError;
      setActions(actionsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Xəta",
        description: "Məlumatlar yüklənərkən xəta baş verdi",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAction = async () => {
    if (!selectedAlert || !newAction.manager_name || !newAction.action_type || !newAction.action_description) {
      toast({
        title: "Xəta",
        description: "Bütün tələb olunan sahələri doldurun",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('manager_actions')
        .insert({
          alert_id: selectedAlert,
          manager_name: newAction.manager_name,
          action_type: newAction.action_type,
          action_description: newAction.action_description,
          notes: newAction.notes || null,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Uğurlu",
        description: "Yeni tapşırıq əlavə edildi"
      });
      setIsAddDialogOpen(false);
      setNewAction({ manager_name: "", action_type: "" as ActionType, action_description: "", notes: "" });
      setSelectedAlert("");
      fetchData();
    } catch (error) {
      console.error('Error adding action:', error);
      toast({
        title: "Xəta",
        description: "Tapşırıq əlavə edilərkən xəta baş verdi",
        variant: "destructive"
      });
    }
  };

  const updateActionStatus = async (actionId: string, newStatus: ActionStatus) => {
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('manager_actions')
        .update(updateData)
        .eq('id', actionId);

      if (error) throw error;

      toast({
        title: "Uğurlu",
        description: "Status yeniləndi"
      });
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Xəta",
        description: "Status yenilənərkən xəta baş verdi",
        variant: "destructive"
      });
    }
  };

  const updateEffectivenessScore = async (actionId: string, score: number) => {
    try {
      const { error } = await supabase
        .from('manager_actions')
        .update({ effectiveness_score: score })
        .eq('id', actionId);

      if (error) throw error;

      toast({
        title: "Uğurlu",
        description: "Effektivlik qiymətləndirildi"
      });
      fetchData();
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  // Statistics
  const totalActions = actions.length;
  const completedActions = actions.filter(a => a.status === 'completed').length;
  const pendingActions = actions.filter(a => a.status === 'pending').length;
  const avgEffectiveness = actions
    .filter(a => a.effectiveness_score !== null)
    .reduce((sum, a) => sum + (a.effectiveness_score || 0), 0) / 
    (actions.filter(a => a.effectiveness_score !== null).length || 1);
  const unresolvedAlerts = alerts.filter(a => !a.is_resolved).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/hr-panel')}
                className="rounded-full hidden sm:flex"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <AppLogo size="sm" onClick={() => navigate("/")} showText={false} />
              <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Menecer Tapşırıqları</h1>
              <p className="text-sm text-muted-foreground hidden sm:block">Tükənmişlik hallarına görülən tədbirlər</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MobileNavMenu />
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Yeni Tapşırıq</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Yeni Tapşırıq Əlavə Et</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tükənmişlik Xəbərdarlığı</label>
                    <Select value={selectedAlert} onValueChange={setSelectedAlert}>
                      <SelectTrigger>
                        <SelectValue placeholder="Alert seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {alerts.filter(a => !a.is_resolved).map(alert => (
                          <SelectItem key={alert.id} value={alert.id}>
                            {alert.employee_code} - {alert.department} ({alert.risk_score}%)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Menecer Adı</label>
                    <Input
                      placeholder="Ad Soyad"
                      value={newAction.manager_name}
                      onChange={(e) => setNewAction({ ...newAction, manager_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tapşırıq Növü</label>
                    <Select 
                      value={newAction.action_type} 
                      onValueChange={(v) => setNewAction({ ...newAction, action_type: v as ActionType })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Növ seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(actionTypeLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Təsvir</label>
                    <Textarea
                      placeholder="Tapşırıq haqqında ətraflı məlumat"
                      value={newAction.action_description}
                      onChange={(e) => setNewAction({ ...newAction, action_description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Qeydlər (opsional)</label>
                    <Textarea
                      placeholder="Əlavə qeydlər"
                      value={newAction.notes}
                      onChange={(e) => setNewAction({ ...newAction, notes: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleAddAction} className="w-full">
                    Əlavə Et
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalActions}</p>
                  <p className="text-xs text-muted-foreground">Ümumi Tapşırıq</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedActions}</p>
                  <p className="text-xs text-muted-foreground">Tamamlandı</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingActions}</p>
                  <p className="text-xs text-muted-foreground">Gözləyir</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Star className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{avgEffectiveness.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Ort. Effektivlik</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{unresolvedAlerts}</p>
                  <p className="text-xs text-muted-foreground">Aktiv Alert</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Active Burnout Alerts */}
          <Card className="lg:col-span-1 bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Aktiv Tükənmişlik Xəbərdarlıqları
              </CardTitle>
              <CardDescription>Müdaxilə tələb edən hallar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
              {loading ? (
                <p className="text-sm text-muted-foreground">Yüklənir...</p>
              ) : alerts.filter(a => !a.is_resolved).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Aktiv alert yoxdur</p>
              ) : (
                alerts.filter(a => !a.is_resolved).map(alert => (
                  <div 
                    key={alert.id} 
                    className="p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-background/80 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{alert.employee_code}</span>
                      <Badge variant="outline" className={cn(
                        alert.risk_score >= 80 ? "bg-red-500/20 text-red-600 border-red-500/30" :
                        alert.risk_score >= 60 ? "bg-amber-500/20 text-amber-600 border-amber-500/30" :
                        "bg-blue-500/20 text-blue-600 border-blue-500/30"
                      )}>
                        Risk: {alert.risk_score}%
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>{alert.branch} • {alert.department}</p>
                      <p>Səbəb: {alert.reason_category}</p>
                      <p>{format(new Date(alert.detected_at), "dd MMM yyyy", { locale: az })}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Actions List */}
          <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Tapşırıqlar Siyahısı
              </CardTitle>
              <CardDescription>Görülən və planlaşdırılan tədbirlər</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[500px] overflow-y-auto">
              {loading ? (
                <p className="text-sm text-muted-foreground">Yüklənir...</p>
              ) : actions.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">Hələ heç bir tapşırıq əlavə edilməyib</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="mt-3"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    İlk tapşırığı əlavə et
                  </Button>
                </div>
              ) : (
                actions.map(action => (
                  <div 
                    key={action.id} 
                    className="p-4 rounded-xl border border-border/50 bg-background/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {actionTypeLabels[action.action_type]}
                          </Badge>
                          <Badge variant="outline" className={cn("text-xs", statusColors[action.status])}>
                            {statusLabels[action.status]}
                          </Badge>
                        </div>
                        <p className="font-medium">{action.action_description}</p>
                      </div>
                      {action.status !== 'completed' && action.status !== 'cancelled' && (
                        <Select 
                          value={action.status} 
                          onValueChange={(v) => updateActionStatus(action.id, v as ActionStatus)}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Gözləyir</SelectItem>
                            <SelectItem value="in_progress">Davam edir</SelectItem>
                            <SelectItem value="completed">Tamamlandı</SelectItem>
                            <SelectItem value="cancelled">Ləğv et</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-4 flex-wrap">
                        <span>Menecer: {action.manager_name}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(action.started_at), "dd MMM yyyy", { locale: az })}
                        </span>
                        {action.burnout_alerts && (
                          <>
                            <span>•</span>
                            <span>{action.burnout_alerts.employee_code} ({action.burnout_alerts.department})</span>
                          </>
                        )}
                      </div>
                    </div>

                    {action.notes && (
                      <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg mb-3">
                        {action.notes}
                      </p>
                    )}

                    {/* Effectiveness Rating */}
                    {action.status === 'completed' && (
                      <div className="border-t border-border/50 pt-3 mt-3">
                        <p className="text-xs text-muted-foreground mb-2">Effektivlik Qiymətləndirilməsi:</p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              onClick={() => updateEffectivenessScore(action.id, star)}
                              className={cn(
                                "p-1 rounded transition-colors",
                                (action.effectiveness_score || 0) >= star 
                                  ? "text-amber-500" 
                                  : "text-muted-foreground/30 hover:text-amber-500/50"
                              )}
                            >
                              <Star className="w-5 h-5 fill-current" />
                            </button>
                          ))}
                          {action.effectiveness_score && (
                            <span className="text-sm text-muted-foreground ml-2">
                              ({action.effectiveness_score}/5)
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Effectiveness Summary */}
        {actions.filter(a => a.effectiveness_score).length > 0 && (
          <Card className="mt-6 bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                Tapşırıq Növləri üzrə Effektivlik
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(actionTypeLabels).map(([type, label]) => {
                  const typeActions = actions.filter(a => a.action_type === type && a.effectiveness_score);
                  if (typeActions.length === 0) return null;
                  const avgScore = typeActions.reduce((sum, a) => sum + (a.effectiveness_score || 0), 0) / typeActions.length;
                  return (
                    <div key={type} className="p-4 rounded-lg bg-background/50 border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{label}</span>
                        <span className="text-lg font-bold">{avgScore.toFixed(1)}/5</span>
                      </div>
                      <Progress value={avgScore * 20} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">{typeActions.length} tapşırıq</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ManagerActions;
