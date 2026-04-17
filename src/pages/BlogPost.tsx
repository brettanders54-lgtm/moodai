import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useEffect } from "react";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog_post", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      return data;
    },
    enabled: !!slug,
  });

  // Set SEO meta tags
  useEffect(() => {
    if (!post) return;
    document.title = post.meta_title || post.title;
    
    const setMeta = (name: string, content: string | null, isProperty = false) => {
      if (!content) return;
      const attr = isProperty ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", post.meta_description || post.excerpt);
    setMeta("og:title", post.meta_title || post.title, true);
    setMeta("og:description", post.meta_description || post.excerpt, true);
    setMeta("og:type", "article", true);
    setMeta("og:url", `https://moodai.az/blog/${post.slug}`, true);
    if (post.cover_image_url) setMeta("og:image", post.cover_image_url, true);
    setMeta("twitter:title", post.meta_title || post.title);
    setMeta("twitter:description", post.meta_description || post.excerpt);

    // JSON-LD for article
    let ldScript = document.getElementById("blog-jsonld") as HTMLScriptElement | null;
    if (!ldScript) {
      ldScript = document.createElement("script");
      ldScript.id = "blog-jsonld";
      ldScript.type = "application/ld+json";
      document.head.appendChild(ldScript);
    }
    ldScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.meta_description || post.excerpt,
      "author": { "@type": "Person", "name": post.author },
      "datePublished": post.published_at,
      "dateModified": post.updated_at,
      "url": `https://moodai.az/blog/${post.slug}`,
      "image": post.cover_image_url || "https://moodai.az/pwa-512x512.png",
      "publisher": {
        "@type": "Organization",
        "name": "MoodAI",
        "logo": { "@type": "ImageObject", "url": "https://moodai.az/pwa-512x512.png" }
      },
      "wordCount": post.content?.split(/\s+/).length || 800,
      "timeRequired": `PT${post.reading_time_minutes}M`
    });

    return () => {
      const el = document.getElementById("blog-jsonld");
      if (el) el.remove();
    };
  }, [post]);

  // Simple markdown-to-HTML renderer
  const renderContent = (md: string) => {
    return md
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-8 mb-3 text-foreground">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-10 mb-4 text-foreground">$1</h2>')
      .replace(/^# (.*$)/gm, '<h2 class="text-3xl font-extrabold mt-12 mb-5 text-foreground">$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc text-muted-foreground mb-1">$1</li>')
      .replace(/^---$/gm, '<hr class="my-8 border-border" />')
      .replace(/\n\n/g, '</p><p class="text-muted-foreground leading-relaxed mb-4">')
      .replace(/^(?!<[hlu]|<li|<hr|<p)(.*)/gm, (match) => match ? `<p class="text-muted-foreground leading-relaxed mb-4">${match}</p>` : '');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse space-y-4 max-w-2xl w-full px-4">
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-xl text-muted-foreground">Blog post not found</p>
        <Button onClick={() => navigate("/blog")}>Back to Blog</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md">
              <span className="text-xl">😊</span>
            </div>
            <span className="text-lg font-bold tracking-tight">MoodAI</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <article className="container mx-auto px-4 py-12 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" size="sm" onClick={() => navigate("/blog")} className="mb-6 gap-1">
            <ArrowLeft className="w-4 h-4" /> Blog
          </Button>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {(post.tags || []).map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-5">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
            <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {post.author}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {post.reading_time_minutes} min read</span>
            {post.published_at && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(post.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
            )}
          </div>

          {post.cover_image_url && (
            <div className="rounded-2xl overflow-hidden mb-10 shadow-medium">
              <img src={post.cover_image_url} alt={post.title} className="w-full h-auto" loading="lazy" />
            </div>
          )}

          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
          />
        </motion.div>
      </article>
    </div>
  );
};

export default BlogPost;
