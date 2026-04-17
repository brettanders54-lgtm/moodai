-- Step 1: Create the app_role enum
CREATE TYPE public.app_role AS ENUM ('hr', 'manager', 'employee');

-- Step 2: Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Step 3: Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create the SECURITY DEFINER function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Step 5: RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Only HR can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'hr'))
WITH CHECK (public.has_role(auth.uid(), 'hr'));

-- Step 6: Drop existing permissive policies on burnout_alerts
DROP POLICY IF EXISTS "Allow public insert on burnout_alerts" ON public.burnout_alerts;
DROP POLICY IF EXISTS "Allow public read on burnout_alerts" ON public.burnout_alerts;
DROP POLICY IF EXISTS "Allow public update on burnout_alerts" ON public.burnout_alerts;

-- Step 7: Create role-based policies for burnout_alerts
CREATE POLICY "HR and managers can view burnout_alerts"
ON public.burnout_alerts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Only system can insert burnout_alerts"
ON public.burnout_alerts
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'hr'));

CREATE POLICY "Only HR can update burnout_alerts"
ON public.burnout_alerts
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'hr'));

-- Step 8: Drop existing permissive policies on employee_responses
DROP POLICY IF EXISTS "Allow public insert on employee_responses" ON public.employee_responses;
DROP POLICY IF EXISTS "Allow public read on employee_responses" ON public.employee_responses;

-- Step 9: Create role-based policies for employee_responses
-- Anyone can submit (anonymous survey)
CREATE POLICY "Anyone can submit responses"
ON public.employee_responses
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only HR and managers can view responses
CREATE POLICY "HR and managers can view responses"
ON public.employee_responses
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'manager'));

-- Step 10: Drop existing permissive policies on manager_actions
DROP POLICY IF EXISTS "Allow public insert on manager_actions" ON public.manager_actions;
DROP POLICY IF EXISTS "Allow public read on manager_actions" ON public.manager_actions;
DROP POLICY IF EXISTS "Allow public update on manager_actions" ON public.manager_actions;

-- Step 11: Create role-based policies for manager_actions
CREATE POLICY "HR and managers can view actions"
ON public.manager_actions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "HR and managers can create actions"
ON public.manager_actions
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "HR and managers can update actions"
ON public.manager_actions
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'manager'));