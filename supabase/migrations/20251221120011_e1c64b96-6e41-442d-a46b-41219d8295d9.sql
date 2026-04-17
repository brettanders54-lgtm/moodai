-- 1. Create table for anonymous suggestions
CREATE TABLE public.anonymous_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch TEXT NOT NULL,
  department TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  suggestion_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  priority TEXT DEFAULT 'normal',
  admin_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.anonymous_suggestions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit suggestions (anonymous)
CREATE POLICY "Anyone can submit suggestions"
ON public.anonymous_suggestions
FOR INSERT
WITH CHECK (true);

-- HR can view all suggestions
CREATE POLICY "HR can view all suggestions"
ON public.anonymous_suggestions
FOR SELECT
USING (has_role(auth.uid(), 'hr'));

-- Managers can view their branch suggestions
CREATE POLICY "Managers can view their branch suggestions"
ON public.anonymous_suggestions
FOR SELECT
USING (has_role(auth.uid(), 'manager') AND branch = get_user_branch(auth.uid()));

-- HR can update suggestions
CREATE POLICY "HR can update suggestions"
ON public.anonymous_suggestions
FOR UPDATE
USING (has_role(auth.uid(), 'hr'));

-- Managers can update their branch suggestions
CREATE POLICY "Managers can update their branch suggestions"
ON public.anonymous_suggestions
FOR UPDATE
USING (has_role(auth.uid(), 'manager') AND branch = get_user_branch(auth.uid()));

-- 2. Create table for satisfaction targets/goals
CREATE TABLE public.satisfaction_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch TEXT,
  department TEXT,
  target_type TEXT NOT NULL DEFAULT 'satisfaction_rate',
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.satisfaction_targets ENABLE ROW LEVEL SECURITY;

-- HR can manage all targets
CREATE POLICY "HR can manage all targets"
ON public.satisfaction_targets
FOR ALL
USING (has_role(auth.uid(), 'hr'))
WITH CHECK (has_role(auth.uid(), 'hr'));

-- Managers can view their branch targets
CREATE POLICY "Managers can view their branch targets"
ON public.satisfaction_targets
FOR SELECT
USING (has_role(auth.uid(), 'manager') AND (branch = get_user_branch(auth.uid()) OR branch IS NULL));

-- Create trigger for updated_at
CREATE TRIGGER update_satisfaction_targets_updated_at
BEFORE UPDATE ON public.satisfaction_targets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Add notification preferences to manager_notifications for push notifications
ALTER TABLE public.manager_notifications ADD COLUMN IF NOT EXISTS urgency TEXT DEFAULT 'normal';
ALTER TABLE public.manager_notifications ADD COLUMN IF NOT EXISTS sent_via_push BOOLEAN DEFAULT false;