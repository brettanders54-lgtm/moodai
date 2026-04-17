import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Sparkles, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export interface AITask {
  id: string;
  title: string;
  description: string;
  priority: "kritik" | "yüksək" | "orta";
  targetEmployee?: string;
  category: string;
  status?: string;
  branch?: string;
}

interface DBTask {
  id: string;
  title: string;
  description: string;
  priority: string;
  target_employee: string | null;
  category: string;
  status: string;
  branch: string;
  created_at: string;
  completed_at: string | null;
}

interface AITasksCardProps {
  newTasks?: AITask[];
  isGenerating: boolean;
  onRefresh: () => void;
  branch?: string | null;
}

export const AITasksCard = ({ newTasks = [], isGenerating, onRefresh, branch }: AITasksCardProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Auto-save new tasks when they arrive
  useEffect(() => {
    if (newTasks.length > 0) {
      // Only save critical/high priority tasks, limit to max 3
      const criticalTasks = newTasks
        .filter(t => t.priority === 'kritik' || t.priority === 'yüksək')
        .slice(0, 3);
      
      if (criticalTasks.length > 0) {
        saveTasks(criticalTasks);
      }
    }
  }, [newTasks]);

  // Fetch existing tasks from database - only kritik and yüksək priority
  const { data: dbTasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['ai-tasks'],
    queryFn: async () => {
      // Fetch all pending critical/high priority tasks (no branch filter for testing)
      const { data, error } = await supabase
        .from('ai_tasks')
        .select('*')
        .in('priority', ['kritik', 'yüksək'])
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }
      return data as DBTask[];
    },
  });

  // Listen to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('ai-tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ai_tasks' },
        () => queryClient.invalidateQueries({ queryKey: ['ai-tasks'] })
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  // Save tasks to database
  const saveTasks = async (tasks: AITask[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: branchData } = await supabase
        .from('manager_branches')
        .select('branch')
        .eq('user_id', user.id)
        .maybeSingle();

      const userBranch = branchData?.branch || branch || 'baku';

      const tasksToInsert = tasks.map(task => ({
        title: task.title,
        description: task.description,
        priority: task.priority,
        category: task.category,
        target_employee: task.targetEmployee || null,
        branch: userBranch,
        status: 'pending',
        created_by: user.id,
      }));

      await supabase.from('ai_tasks').insert(tasksToInsert);
      queryClient.invalidateQueries({ queryKey: ['ai-tasks'] });
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  };

  // Update task status mutation
  const updateMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const updateData: any = { status };
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
        updateData.completed_by = user?.id;
      }

      const { error } = await supabase
        .from('ai_tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ai-tasks'] }),
    onError: (error: any) => {
      toast({
        title: "Xəta",
        description: error.message || "Status yenilənə bilmədi",
        variant: "destructive",
      });
    },
  });

  const handleTaskToggle = (taskId: string) => {
    updateMutation.mutate({ taskId, status: 'completed' });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "kritik":
        return "bg-destructive/10 text-destructive border-destructive/30";
      case "yüksək":
        return "bg-orange-500/10 text-orange-600 border-orange-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const isLoading = loadingTasks || isGenerating;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Kritik Tapşırıqlar</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
        <CardDescription>AI tərəfindən müəyyən edilən təcili addımlar</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && dbTasks.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Yüklənir...
          </div>
        ) : dbTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-10 w-10 mb-2 text-status-good" />
            <p className="text-sm">Kritik tapşırıq yoxdur</p>
          </div>
        ) : (
          <div className="space-y-2">
            {dbTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors"
              >
                <Checkbox
                  checked={false}
                  onCheckedChange={() => handleTaskToggle(task.id)}
                  disabled={updateMutation.isPending}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm truncate">{task.title}</span>
                    <Badge variant="outline" className={cn("shrink-0 text-xs", getPriorityColor(task.priority))}>
                      {task.priority === 'kritik' && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
