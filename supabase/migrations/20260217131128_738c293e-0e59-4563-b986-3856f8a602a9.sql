
-- 1. Media Library table
CREATE TABLE public.cms_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL DEFAULT 'image',
  file_size integer DEFAULT 0,
  alt_text text,
  folder text DEFAULT 'general',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cms_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read media" ON public.cms_media FOR SELECT USING (true);
CREATE POLICY "Admin can manage media" ON public.cms_media FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 2. Translations table (multi-language)
CREATE TABLE public.cms_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_table text NOT NULL, -- 'cms_content', 'cms_faqs', 'cms_partners'
  content_id uuid NOT NULL,
  locale text NOT NULL DEFAULT 'az', -- az, ru, en
  field_name text NOT NULL, -- which field is translated
  translated_value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(content_table, content_id, locale, field_name)
);
ALTER TABLE public.cms_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read translations" ON public.cms_translations FOR SELECT USING (true);
CREATE POLICY "Admin can manage translations" ON public.cms_translations FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3. Menu Builder table
CREATE TABLE public.cms_menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_group text NOT NULL DEFAULT 'main_nav', -- main_nav, footer, sidebar
  label text NOT NULL,
  url text,
  icon text, -- lucide icon name
  parent_id uuid REFERENCES public.cms_menus(id) ON DELETE CASCADE,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  open_in_new_tab boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cms_menus ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active menus" ON public.cms_menus FOR SELECT USING (is_active = true);
CREATE POLICY "Admin can manage menus" ON public.cms_menus FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 4. SEO table
CREATE TABLE public.cms_seo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text NOT NULL UNIQUE, -- e.g. '/', '/survey', '/auth'
  meta_title text,
  meta_description text,
  og_image_url text,
  og_title text,
  og_description text,
  canonical_url text,
  no_index boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cms_seo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read seo" ON public.cms_seo FOR SELECT USING (true);
CREATE POLICY "Admin can manage seo" ON public.cms_seo FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 5. Content Versions table
CREATE TABLE public.cms_content_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_table text NOT NULL,
  content_id uuid NOT NULL,
  version_data jsonb NOT NULL,
  version_number integer NOT NULL DEFAULT 1,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cms_content_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage versions" ON public.cms_content_versions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 6. Add scheduling fields to cms_content
ALTER TABLE public.cms_content ADD COLUMN IF NOT EXISTS publish_at timestamptz;
ALTER TABLE public.cms_content ADD COLUMN IF NOT EXISTS unpublish_at timestamptz;

-- 7. Add scheduling fields to cms_faqs
ALTER TABLE public.cms_faqs ADD COLUMN IF NOT EXISTS publish_at timestamptz;
ALTER TABLE public.cms_faqs ADD COLUMN IF NOT EXISTS unpublish_at timestamptz;

-- Triggers for updated_at
CREATE TRIGGER update_cms_media_updated_at BEFORE UPDATE ON public.cms_media FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cms_translations_updated_at BEFORE UPDATE ON public.cms_translations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cms_menus_updated_at BEFORE UPDATE ON public.cms_menus FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cms_seo_updated_at BEFORE UPDATE ON public.cms_seo FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
