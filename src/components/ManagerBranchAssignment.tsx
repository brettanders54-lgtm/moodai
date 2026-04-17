import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserCog, MapPin, Plus, Trash2, Check, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const branches = [
  { id: "baku", name: "Bakı", icon: "🏙️" },
  { id: "ganja", name: "Gəncə", icon: "🌆" },
  { id: "sumgait", name: "Sumqayıt", icon: "🏭" },
  { id: "mingachevir", name: "Mingəçevir", icon: "⚡" },
  { id: "shirvan", name: "Şirvan", icon: "🌾" },
  { id: "lankaran", name: "Lənkəran", icon: "🌊" },
  { id: "shaki", name: "Şəki", icon: "🏔️" },
  { id: "quba", name: "Quba", icon: "🍎" },
];

interface ManagerWithBranch {
  id: string;
  user_id: string;
  branch: string;
  assigned_at: string;
  user_email?: string;
}

interface ManagerRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

export const ManagerBranchAssignment = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedManager, setSelectedManager] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");

  // Fetch managers with their branch assignments
  const { data: managerBranches = [], isLoading: loadingAssignments } = useQuery({
    queryKey: ['manager-branch-assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manager_branches')
        .select('*')
        .order('assigned_at', { ascending: false });
      
      if (error) throw error;
      return data as ManagerWithBranch[];
    },
  });

  // Fetch all managers from user_roles
  const { data: managers = [], isLoading: loadingManagers } = useQuery({
    queryKey: ['all-managers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('role', 'manager');
      
      if (error) throw error;
      return data as ManagerRole[];
    },
  });

  // Group branches by manager
  const managerBranchMap = managerBranches.reduce((acc, mb) => {
    if (!acc[mb.user_id]) {
      acc[mb.user_id] = [];
    }
    acc[mb.user_id].push(mb);
    return acc;
  }, {} as Record<string, ManagerWithBranch[]>);

  // Check if a branch is already assigned to the selected manager
  const getManagerAssignedBranches = (managerId: string) => {
    return managerBranches.filter(mb => mb.user_id === managerId).map(mb => mb.branch);
  };

  // Assign manager to branch mutation
  const assignMutation = useMutation({
    mutationFn: async ({ userId, branch }: { userId: string; branch: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('manager_branches')
        .insert({
          user_id: userId,
          branch: branch,
          assigned_by: user?.id,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manager-branch-assignments'] });
      setSelectedBranch("");
      toast({
        title: "Təyinat uğurlu",
        description: "Menecer bölgəyə təyin edildi",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Xəta",
        description: error.message || "Təyinat zamanı xəta baş verdi",
        variant: "destructive",
      });
    },
  });

  // Remove assignment mutation
  const removeMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from('manager_branches')
        .delete()
        .eq('id', assignmentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manager-branch-assignments'] });
      toast({
        title: "Təyinat silindi",
        description: "Menecer bölgədən çıxarıldı",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Xəta",
        description: error.message || "Silmə zamanı xəta baş verdi",
        variant: "destructive",
      });
    },
  });

  const handleAssign = () => {
    if (!selectedManager || !selectedBranch) {
      toast({
        title: "Xəta",
        description: "Menecer və bölgə seçin",
        variant: "destructive",
      });
      return;
    }
    
    // Check if this exact combination already exists
    const alreadyAssigned = managerBranches.some(
      mb => mb.user_id === selectedManager && mb.branch === selectedBranch
    );
    
    if (alreadyAssigned) {
      toast({
        title: "Xəta",
        description: "Bu menecer artıq bu bölgəyə təyin olunub",
        variant: "destructive",
      });
      return;
    }
    
    assignMutation.mutate({ userId: selectedManager, branch: selectedBranch });
  };

  const getBranchName = (branchId: string) => {
    return branches.find(b => b.id === branchId)?.name || branchId;
  };

  const getBranchIcon = (branchId: string) => {
    return branches.find(b => b.id === branchId)?.icon || "📍";
  };

  // Get unique managers with their branches
  const managersWithBranches = managers.map(m => ({
    ...m,
    branches: managerBranchMap[m.user_id] || []
  }));

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="bg-primary/5">
        <CardTitle className="flex items-center gap-2">
          <UserCog className="w-5 h-5 text-primary" />
          Menecer-Bölgə Təyinatları
        </CardTitle>
        <CardDescription>
          Hər menecerə bir və ya bir neçə bölgə təyin edin
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Assignment Form */}
        <div className="p-4 rounded-lg border border-border bg-muted/30">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Yeni Təyinat Əlavə Et
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select value={selectedManager} onValueChange={(val) => {
              setSelectedManager(val);
              setSelectedBranch(""); // Reset branch when manager changes
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Menecer seçin" />
              </SelectTrigger>
              <SelectContent>
                {managers.length === 0 ? (
                  <SelectItem value="none" disabled>Menecer yoxdur</SelectItem>
                ) : (
                  managers.map(manager => {
                    const assignedCount = (managerBranchMap[manager.user_id] || []).length;
                    return (
                      <SelectItem key={manager.user_id} value={manager.user_id}>
                        <div className="flex items-center gap-2">
                          <span>{manager.user_id.slice(0, 8)}...</span>
                          {assignedCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {assignedCount} bölgə
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>

            <Select 
              value={selectedBranch} 
              onValueChange={setSelectedBranch}
              disabled={!selectedManager}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedManager ? "Bölgə seçin" : "Əvvəl menecer seçin"} />
              </SelectTrigger>
              <SelectContent>
                {branches.map(branch => {
                  const isAssignedToSelectedManager = selectedManager && 
                    getManagerAssignedBranches(selectedManager).includes(branch.id);
                  return (
                    <SelectItem 
                      key={branch.id} 
                      value={branch.id}
                      disabled={isAssignedToSelectedManager}
                    >
                      {branch.icon} {branch.name}
                      {isAssignedToSelectedManager && " (artıq təyin olunub)"}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <Button 
              onClick={handleAssign} 
              disabled={!selectedManager || !selectedBranch || assignMutation.isPending}
              className="gap-2"
            >
              <Check className="w-4 h-4" />
              Təyin Et
            </Button>
          </div>
        </div>

        {/* Managers List with their Branches */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4" />
            Menecerlər və Bölgələri
          </h4>
          
          {loadingAssignments || loadingManagers ? (
            <div className="text-center py-4 text-muted-foreground">Yüklənir...</div>
          ) : managersWithBranches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
              <UserCog className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Heç bir menecer yoxdur</p>
            </div>
          ) : (
            <div className="space-y-4">
              {managersWithBranches.map(manager => (
                <div 
                  key={manager.user_id}
                  className="p-4 rounded-lg border border-border bg-card"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserCog className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">Menecer</div>
                        <div className="text-xs text-muted-foreground">
                          ID: {manager.user_id.slice(0, 12)}...
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {manager.branches.length} bölgə
                    </Badge>
                  </div>
                  
                  {manager.branches.length === 0 ? (
                    <div className="text-sm text-muted-foreground italic py-2">
                      Heç bir bölgə təyin olunmayıb
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {manager.branches.map(assignment => (
                        <Badge 
                          key={assignment.id}
                          variant="secondary"
                          className="gap-2 py-1.5 px-3"
                        >
                          <span>{getBranchIcon(assignment.branch)}</span>
                          <span>{getBranchName(assignment.branch)}</span>
                          <button
                            onClick={() => removeMutation.mutate(assignment.id)}
                            disabled={removeMutation.isPending}
                            className="ml-1 hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Branch Coverage Summary */}
        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Bölgə Əhatəsi
          </h4>
          <div className="flex flex-wrap gap-2">
            {branches.map(branch => {
              const assignedManagers = managerBranches.filter(mb => mb.branch === branch.id);
              const isAssigned = assignedManagers.length > 0;
              return (
                <Badge 
                  key={branch.id}
                  variant={isAssigned ? "default" : "outline"}
                  className={cn(
                    "gap-1",
                    !isAssigned && "text-muted-foreground border-dashed"
                  )}
                >
                  {branch.icon} {branch.name}
                  {isAssigned && (
                    <span className="ml-1 bg-background/20 px-1 rounded text-xs">
                      {assignedManagers.length}
                    </span>
                  )}
                </Badge>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {new Set(managerBranches.map(mb => mb.branch)).size}/{branches.length} bölgə menecerlə təmin edilib
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
