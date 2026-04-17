
-- Create storage bucket for CMS partner logos
INSERT INTO storage.buckets (id, name, public) VALUES ('cms-assets', 'cms-assets', true);

-- Allow anyone to read from cms-assets bucket (logos are public)
CREATE POLICY "Public read access for cms-assets" ON storage.objects FOR SELECT USING (bucket_id = 'cms-assets');

-- Only admin can upload/update/delete
CREATE POLICY "Admin can upload to cms-assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cms-assets' AND public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin can update cms-assets" ON storage.objects FOR UPDATE USING (bucket_id = 'cms-assets' AND public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin can delete cms-assets" ON storage.objects FOR DELETE USING (bucket_id = 'cms-assets' AND public.has_role(auth.uid(), 'admin'::app_role));
