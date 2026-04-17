-- Create table for sales/complaint data from external systems
CREATE TABLE public.external_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch TEXT NOT NULL,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  daily_sales NUMERIC(12,2) DEFAULT 0,
  customer_complaints INTEGER DEFAULT 0,
  customer_count INTEGER DEFAULT 0,
  returns_count INTEGER DEFAULT 0,
  source_system TEXT DEFAULT 'manual', -- '1c', 'sap', 'manual', 'api'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(branch, metric_date)
);

-- Create table for AI predictions
CREATE TABLE public.risk_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch TEXT NOT NULL,
  prediction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  stress_change_percent NUMERIC(5,2),
  complaint_risk_percent NUMERIC(5,2),
  sales_impact_percent NUMERIC(5,2),
  prediction_text TEXT,
  confidence_score NUMERIC(5,2),
  factors JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days')
);

-- Enable RLS
ALTER TABLE public.external_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_predictions ENABLE ROW LEVEL SECURITY;

-- RLS policies for external_metrics
CREATE POLICY "HR can manage all metrics"
ON public.external_metrics FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'hr'))
WITH CHECK (public.has_role(auth.uid(), 'hr'));

CREATE POLICY "Managers can view their branch metrics"
ON public.external_metrics FOR SELECT
TO authenticated
USING (
  branch = public.get_user_branch(auth.uid()) 
  OR public.has_role(auth.uid(), 'hr')
);

-- RLS policies for risk_predictions
CREATE POLICY "HR can manage all predictions"
ON public.risk_predictions FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'hr'))
WITH CHECK (public.has_role(auth.uid(), 'hr'));

CREATE POLICY "Managers can view their branch predictions"
ON public.risk_predictions FOR SELECT
TO authenticated
USING (
  branch = public.get_user_branch(auth.uid()) 
  OR public.has_role(auth.uid(), 'hr')
);

-- Trigger for updated_at
CREATE TRIGGER update_external_metrics_updated_at
BEFORE UPDATE ON public.external_metrics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert test data for external_metrics
INSERT INTO public.external_metrics (branch, metric_date, daily_sales, customer_complaints, customer_count, returns_count, source_system) VALUES
('Bakı - Nərimanov', CURRENT_DATE - interval '6 days', 45000.00, 3, 120, 5, 'test'),
('Bakı - Nərimanov', CURRENT_DATE - interval '5 days', 42000.00, 5, 115, 8, 'test'),
('Bakı - Nərimanov', CURRENT_DATE - interval '4 days', 38000.00, 7, 95, 12, 'test'),
('Bakı - Nərimanov', CURRENT_DATE - interval '3 days', 35000.00, 9, 85, 15, 'test'),
('Bakı - Nərimanov', CURRENT_DATE - interval '2 days', 32000.00, 12, 75, 18, 'test'),
('Bakı - Nərimanov', CURRENT_DATE - interval '1 day', 28000.00, 15, 65, 22, 'test'),
('Bakı - Nərimanov', CURRENT_DATE, 25000.00, 18, 55, 25, 'test'),
('Bakı - Yasamal', CURRENT_DATE - interval '6 days', 38000.00, 2, 100, 3, 'test'),
('Bakı - Yasamal', CURRENT_DATE - interval '5 days', 40000.00, 2, 105, 4, 'test'),
('Bakı - Yasamal', CURRENT_DATE - interval '4 days', 42000.00, 1, 110, 3, 'test'),
('Bakı - Yasamal', CURRENT_DATE - interval '3 days', 44000.00, 2, 115, 2, 'test'),
('Bakı - Yasamal', CURRENT_DATE - interval '2 days', 46000.00, 1, 120, 2, 'test'),
('Bakı - Yasamal', CURRENT_DATE - interval '1 day', 48000.00, 1, 125, 1, 'test'),
('Bakı - Yasamal', CURRENT_DATE, 50000.00, 0, 130, 1, 'test'),
('Sumqayıt', CURRENT_DATE - interval '6 days', 22000.00, 4, 60, 6, 'test'),
('Sumqayıt', CURRENT_DATE - interval '5 days', 21000.00, 5, 58, 7, 'test'),
('Sumqayıt', CURRENT_DATE - interval '4 days', 20000.00, 6, 55, 8, 'test'),
('Sumqayıt', CURRENT_DATE - interval '3 days', 19000.00, 7, 52, 10, 'test'),
('Sumqayıt', CURRENT_DATE - interval '2 days', 18000.00, 8, 48, 12, 'test'),
('Sumqayıt', CURRENT_DATE - interval '1 day', 17000.00, 10, 45, 14, 'test'),
('Sumqayıt', CURRENT_DATE, 16000.00, 12, 42, 16, 'test');