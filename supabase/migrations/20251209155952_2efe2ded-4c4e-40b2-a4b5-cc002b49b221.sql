-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Only system can insert burnout_alerts" ON public.burnout_alerts;

-- Create new policy that allows anyone to insert (for anonymous survey submissions)
CREATE POLICY "Anyone can create burnout alerts from survey"
ON public.burnout_alerts
FOR INSERT
WITH CHECK (true);