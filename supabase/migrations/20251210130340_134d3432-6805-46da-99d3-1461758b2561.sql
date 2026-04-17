-- Create manager_branches table to assign managers to specific branches
CREATE TABLE public.manager_branches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  branch TEXT NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE (user_id) -- Each manager can only have one branch
);

-- Enable RLS
ALTER TABLE public.manager_branches ENABLE ROW LEVEL SECURITY;

-- Only HR can manage branch assignments
CREATE POLICY "HR can manage branch assignments"
ON public.manager_branches
FOR ALL
USING (has_role(auth.uid(), 'hr'::app_role))
WITH CHECK (has_role(auth.uid(), 'hr'::app_role));

-- Managers can view their own branch assignment
CREATE POLICY "Managers can view own branch"
ON public.manager_branches
FOR SELECT
USING (user_id = auth.uid());

-- Create function to get user's assigned branch
CREATE OR REPLACE FUNCTION public.get_user_branch(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT branch
  FROM public.manager_branches
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Update employee_responses RLS: managers only see their branch, HR sees all
DROP POLICY IF EXISTS "HR and managers can view responses" ON public.employee_responses;

CREATE POLICY "HR can view all responses"
ON public.employee_responses
FOR SELECT
USING (has_role(auth.uid(), 'hr'::app_role));

CREATE POLICY "Managers can view their branch responses"
ON public.employee_responses
FOR SELECT
USING (
  has_role(auth.uid(), 'manager'::app_role) 
  AND branch = get_user_branch(auth.uid())
);

-- Update burnout_alerts RLS: managers only see their branch, HR sees all
DROP POLICY IF EXISTS "HR and managers can view burnout_alerts" ON public.burnout_alerts;

CREATE POLICY "HR can view all burnout_alerts"
ON public.burnout_alerts
FOR SELECT
USING (has_role(auth.uid(), 'hr'::app_role));

CREATE POLICY "Managers can view their branch alerts"
ON public.burnout_alerts
FOR SELECT
USING (
  has_role(auth.uid(), 'manager'::app_role) 
  AND branch = get_user_branch(auth.uid())
);

-- Update manager_actions RLS for branch filtering
DROP POLICY IF EXISTS "HR and managers can view actions" ON public.manager_actions;
DROP POLICY IF EXISTS "HR and managers can create actions" ON public.manager_actions;
DROP POLICY IF EXISTS "HR and managers can update actions" ON public.manager_actions;

CREATE POLICY "HR can view all actions"
ON public.manager_actions
FOR SELECT
USING (has_role(auth.uid(), 'hr'::app_role));

CREATE POLICY "Managers can view their branch actions"
ON public.manager_actions
FOR SELECT
USING (
  has_role(auth.uid(), 'manager'::app_role) 
  AND alert_id IN (
    SELECT id FROM public.burnout_alerts 
    WHERE branch = get_user_branch(auth.uid())
  )
);

CREATE POLICY "HR can create actions"
ON public.manager_actions
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'hr'::app_role));

CREATE POLICY "Managers can create actions for their branch"
ON public.manager_actions
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'manager'::app_role)
  AND alert_id IN (
    SELECT id FROM public.burnout_alerts 
    WHERE branch = get_user_branch(auth.uid())
  )
);

CREATE POLICY "HR can update all actions"
ON public.manager_actions
FOR UPDATE
USING (has_role(auth.uid(), 'hr'::app_role));

CREATE POLICY "Managers can update their branch actions"
ON public.manager_actions
FOR UPDATE
USING (
  has_role(auth.uid(), 'manager'::app_role)
  AND alert_id IN (
    SELECT id FROM public.burnout_alerts 
    WHERE branch = get_user_branch(auth.uid())
  )
);