-- Table: blog_posts
CREATE TABLE public.blog_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    slug text NOT NULL UNIQUE,
    title text NOT NULL,
    excerpt text,
    content text NOT NULL,
    cover_image_url text,
    author text DEFAULT 'MoodAI Team' NOT NULL,
    tags text[] DEFAULT '{}',
    is_published boolean DEFAULT false,
    published_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    meta_title text,
    meta_description text,
    reading_time_minutes integer DEFAULT 5
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published blog_posts" ON public.blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can insert blog_posts" ON public.blog_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update blog_posts" ON public.blog_posts FOR UPDATE USING (true);

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();