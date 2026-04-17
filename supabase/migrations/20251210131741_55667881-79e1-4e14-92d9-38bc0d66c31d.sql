-- Create AI tasks table for storing AI-generated tasks
CREATE TABLE public.ai_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('kritik', 'yüksək', 'orta')),
  category TEXT NOT NULL,
  target_employee TEXT,
  department TEXT,
  branch TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  created_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  source_analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_tasks ENABLE ROW LEVEL SECURITY;

-- HR can view and manage all tasks
CREATE POLICY "HR can manage all tasks"
ON public.ai_tasks
FOR ALL
USING (has_role(auth.uid(), 'hr'::app_role))
WITH CHECK (has_role(auth.uid(), 'hr'::app_role));

-- Managers can view tasks for their branch
CREATE POLICY "Managers can view their branch tasks"
ON public.ai_tasks
FOR SELECT
USING (
  has_role(auth.uid(), 'manager'::app_role) 
  AND branch = get_user_branch(auth.uid())
);

-- Managers can update tasks for their branch (mark as complete, etc.)
CREATE POLICY "Managers can update their branch tasks"
ON public.ai_tasks
FOR UPDATE
USING (
  has_role(auth.uid(), 'manager'::app_role) 
  AND branch = get_user_branch(auth.uid())
);

-- Managers can create tasks for their branch
CREATE POLICY "Managers can create tasks for their branch"
ON public.ai_tasks
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'manager'::app_role) 
  AND branch = get_user_branch(auth.uid())
);

-- Add trigger for updated_at
CREATE TRIGGER update_ai_tasks_updated_at
BEFORE UPDATE ON public.ai_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for ai_tasks
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_tasks;