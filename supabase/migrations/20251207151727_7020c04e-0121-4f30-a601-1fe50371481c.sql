-- Create employee_responses table for storing mood surveys
CREATE TABLE public.employee_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_code TEXT NOT NULL,
  department TEXT NOT NULL,
  branch TEXT NOT NULL,
  mood TEXT NOT NULL CHECK (mood IN ('Yaxşı', 'Normal', 'Pis')),
  reason TEXT,
  reason_category TEXT,
  response_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employee_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (will be restricted later with auth)
CREATE POLICY "Allow public read on employee_responses" 
ON public.employee_responses 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert on employee_responses" 
ON public.employee_responses 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_employee_responses_date ON public.employee_responses(response_date);
CREATE INDEX idx_employee_responses_mood ON public.employee_responses(mood);
CREATE INDEX idx_employee_responses_branch ON public.employee_responses(branch);
CREATE INDEX idx_employee_responses_department ON public.employee_responses(department);

-- Insert sample data for testing
INSERT INTO public.employee_responses (employee_code, department, branch, mood, reason_category, response_date) VALUES
('EMP001', 'Satış', 'Bakı Mərkəz', 'Yaxşı', NULL, CURRENT_DATE),
('EMP002', 'Satış', 'Bakı Mərkəz', 'Yaxşı', NULL, CURRENT_DATE),
('EMP003', 'Texniki', 'Bakı 28 May', 'Normal', 'İş yükü', CURRENT_DATE),
('EMP004', 'Logistika', 'Gəncə', 'Pis', 'Qrafik', CURRENT_DATE),
('EMP005', 'Satış', 'Sumqayıt', 'Yaxşı', NULL, CURRENT_DATE),
('EMP006', 'İnsan Resursları', 'Bakı Mərkəz', 'Yaxşı', NULL, CURRENT_DATE),
('EMP007', 'Texniki', 'Bakı Mərkəz', 'Pis', 'Menecer', CURRENT_DATE),
('EMP008', 'Logistika', 'Bakı 28 May', 'Normal', 'Komanda', CURRENT_DATE),
('EMP009', 'Satış', 'Gəncə', 'Yaxşı', NULL, CURRENT_DATE),
('EMP010', 'Satış', 'Bakı Mərkəz', 'Yaxşı', NULL, CURRENT_DATE),
('EMP011', 'Texniki', 'Sumqayıt', 'Yaxşı', NULL, CURRENT_DATE),
('EMP012', 'Logistika', 'Bakı Mərkəz', 'Pis', 'İş yükü', CURRENT_DATE),
('EMP013', 'Satış', 'Bakı 28 May', 'Yaxşı', NULL, CURRENT_DATE - INTERVAL '1 day'),
('EMP014', 'İnsan Resursları', 'Gəncə', 'Normal', 'Şərtlər', CURRENT_DATE - INTERVAL '1 day'),
('EMP015', 'Texniki', 'Bakı Mərkəz', 'Yaxşı', NULL, CURRENT_DATE - INTERVAL '1 day'),
('EMP016', 'Satış', 'Sumqayıt', 'Pis', 'Qrafik', CURRENT_DATE - INTERVAL '2 days'),
('EMP017', 'Logistika', 'Bakı Mərkəz', 'Yaxşı', NULL, CURRENT_DATE - INTERVAL '2 days'),
('EMP018', 'Satış', 'Bakı 28 May', 'Normal', 'İş yükü', CURRENT_DATE - INTERVAL '3 days'),
('EMP019', 'Texniki', 'Gəncə', 'Yaxşı', NULL, CURRENT_DATE - INTERVAL '3 days'),
('EMP020', 'İnsan Resursları', 'Bakı Mərkəz', 'Yaxşı', NULL, CURRENT_DATE - INTERVAL '4 days');