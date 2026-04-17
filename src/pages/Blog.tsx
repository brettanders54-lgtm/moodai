import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Calendar, Clock, User } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useEffect } from "react";

const Blog = () => {
  const navigate = useNavigate();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blog_posts_list"],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, slug, title, excerpt, cover_image_url, author, tags, published_at, reading_time_minutes")
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      return data || [];
    },
  });

  useEffect(() => {
    document.title = "Blog | MoodAI – AI-powered Mood Analysis Insights";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Read the latest insights on AI-powered mood analysis, recommendation systems, and personalized workplace well-being.");
  }, []);

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
            <Button size="sm" onClick={() => navigate("/auth")} className="gap-1">
              Giriş <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-4 gap-1">
            <ArrowLeft className="w-4 h-4" /> Ana Səhifə
          </Button>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">Blog</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            AI-powered mood analysis, recommendation systems, and workplace well-being insights.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6 space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post: any, idx: number) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link to={`/blog/${post.slug}`}>
                  <Card className="h-full hover:shadow-medium transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
                    {post.cover_image_url && (
                      <div className="aspect-video overflow-hidden rounded-t-xl">
                        <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                      </div>
                    )}
                    <CardContent className="p-6 space-y-3">
                      <div className="flex flex-wrap gap-1.5">
                        {(post.tags || []).slice(0, 3).map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                      <h2 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.reading_time_minutes} min</span>
                        {post.published_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && posts.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No blog posts yet. Check back soon!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Blog;
