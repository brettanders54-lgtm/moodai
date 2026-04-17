import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Brain, Shield, Bell, TrendingUp, Users, Zap, ArrowRight,
  CheckCircle2, Sparkles, MessageSquare, Target, ChevronRight, Crown,
  Building2, Check, Activity, Lock, AlertTriangle, XCircle, Eye, Gauge,
  HeartCrack, ShieldAlert, LineChart, Layers, MousePointerClick, Menu, X,
  Quote, ShoppingCart, Landmark, Wifi, Award, HelpCircle,
  ExternalLink, Globe, Radar } from
"lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/hooks/useLanguage";
import { useCmsMenus } from "@/hooks/useCmsMenus";
import { AppLogo } from "@/components/AppLogo";
import { useRef, useState, useEffect } from "react";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent } from
"@/components/ui/chart";
import {
  LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as RechartsRadar,
  ResponsiveContainer } from
"recharts";

/* ─── Icon maps for CMS-driven arrays ─── */
const painIcons = [HeartCrack, ShieldAlert, TrendingUp, AlertTriangle];
const featureIcons = [MousePointerClick, Gauge, Brain, LineChart, Eye, Bell];
const stepIcons = [MessageSquare, Brain, Zap];
const planIcons = [Sparkles, Crown, Building2];

/* ─── Mock Chart Data ─── */
const weeklyMoodData = [
{ day: "Baz", mood: 68, engagement: 72 },
{ day: "Ber", mood: 72, engagement: 70 },
{ day: "Çrş", mood: 65, engagement: 68 },
{ day: "Crş", mood: 78, engagement: 75 },
{ day: "Cüm", mood: 74, engagement: 80 },
{ day: "Şnb", mood: 82, engagement: 85 },
{ day: "Baz", mood: 85, engagement: 82 }];


const radarData = [
{ metric: "Məhsuldarlıq", value: 82 },
{ metric: "Stress", value: 45 },
{ metric: "Bağlılıq", value: 78 },
{ metric: "Məmnuniyyət", value: 88 },
{ metric: "Enerji", value: 72 }];


const moodChartConfig = {
  mood: { label: "Əhval", color: "hsl(239 84% 67%)" },
  engagement: { label: "Bağlılıq", color: "hsl(160 84% 39%)" }
};

const radarChartConfig = {
  value: { label: "Skor", color: "hsl(239 84% 67%)" }
};

/* ─── Counter Animation Component ─── */
const CounterItem = ({ end, suffix, label, delay }: {end: number;suffix: string;label: string;delay: number;}) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 1500;
          const steps = 40;
          const increment = end / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, hasAnimated]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="space-y-1">
      
      <div className="text-3xl md:text-4xl font-extrabold text-primary">
        {count}{suffix}
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </motion.div>);

};

/* ─── Floating Particles ─── */
const FloatingParticle = ({ delay, x, y, size }: {delay: number;x: string;y: string;size: number;}) =>
<motion.div
  className="absolute rounded-full bg-primary/20 blur-sm"
  style={{ left: x, top: y, width: size, height: size }}
  animate={{
    y: [0, -30, 0],
    x: [0, 15, 0],
    opacity: [0.2, 0.5, 0.2],
    scale: [1, 1.2, 1]
  }}
  transition={{ duration: 6 + delay, repeat: Infinity, ease: "easeInOut", delay }} />;



/* ─── AI Insight Card ─── */
const AIInsightCard = ({ icon: Icon, title, description, color, delay

}: {icon: any;title: string;description: string;color: string;delay: number;}) =>
<motion.div
  initial={{ opacity: 0, x: 20, rotateY: -10 }}
  whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
  viewport={{ once: true }}
  transition={{ delay, duration: 0.6, type: "spring" }}
  whileHover={{ scale: 1.03, y: -4 }}
  className="glass-card rounded-xl p-4 glass-card-hover transition-all duration-300">
  
    <div className="flex items-start gap-3">
      <motion.div
      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}
      animate={{ rotate: [0, 5, -5, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: delay * 2 }}>
      
        <Icon className="w-4 h-4" />
      </motion.div>
      <div className="space-y-1">
        <p className="text-xs font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  </motion.div>;


/* ─── Parallax Section Wrapper ─── */
const ParallaxSection = ({ children, className, speed = 0.1 }: {children: React.ReactNode;className?: string;speed?: number;}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [50 * speed, -50 * speed]);

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>);

};

const Landing = () => {
  const navigate = useNavigate();
  const { locale, t, tField, cmsContentRaw } = useLanguage();
  const { menus: landingMenus } = useCmsMenus("landing_nav");
  const heroRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Main hero parallax
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  // Dashboard parallax (moves slower than hero text for depth)
  const dashboardY = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const dashboardScale = useTransform(scrollYProgress, [0, 1], [1, 0.98]);

  // CMS Data
  const { data: cmsFaqs = [] } = useQuery({
    queryKey: ["cms_faqs_landing"],
    queryFn: async () => {
      const { data } = await supabase.from("cms_faqs").select("*").eq("is_active", true).order("sort_order");
      return data || [];
    }
  });
  const { data: cmsPartners = [] } = useQuery({
    queryKey: ["cms_partners_landing"],
    queryFn: async () => {
      const { data } = await supabase.from("cms_partners").select("*").eq("is_active", true).order("sort_order");
      return data || [];
    }
  });

  // Helper: check if a CMS key is active (returns true if key doesn't exist in CMS — fallback mode)
  const isKeyActive = (key: string): boolean => {
    const found = cmsContentRaw.find((c) => c.content_key === key);
    return !found || found.is_active;
  };

  // CMS-driven dynamic arrays — items filtered by is_active
  const painStats = [1, 2, 3, 4].
  filter((i) => isKeyActive(`pain_${i}_label`)).
  map((i, idx) => ({
    value: t(`pain_${i}_value`, ['65%', '79%', '+3%', '5%'][idx]),
    label: t(`pain_${i}_label`, ['Müştəri itkisi', 'Həvəssiz işçi', 'Gizli qazanc', 'Zəncir reaksiya'][idx]),
    detail: t(`pain_${i}_detail`, ''),
    source: t(`pain_${i}_source`, ''),
    icon: painIcons[Math.min(idx, painIcons.length - 1)]
  }));

  const solutionFeatures = [1, 2, 3, 4, 5, 6].
  filter((i) => isKeyActive(`feature_${i}_title`)).
  map((i, idx) => ({
    icon: featureIcons[Math.min(idx, featureIcons.length - 1)],
    title: t(`feature_${i}_title`, ''),
    description: t(`feature_${i}_desc`, ''),
    metric: t(`feature_${i}_metric`, '')
  }));

  const steps = [1, 2, 3].
  filter((i) => isKeyActive(`step_${i}_title`)).
  map((i, idx) => ({
    step: `0${i}`,
    title: t(`step_${i}_title`, ''),
    description: t(`step_${i}_desc`, ''),
    icon: stepIcons[Math.min(idx, stepIcons.length - 1)]
  }));

  const resultMetrics = [1, 2, 3, 4].
  filter((i) => isKeyActive(`result_${i}_label`)).
  map((i, idx) => ({
    value: t(`result_${i}_value`, ['60%', '35%', '25%', '3x'][idx]),
    label: t(`result_${i}_label`, '')
  }));

  const sectorDefs = [
  { icon: ShoppingCart, emoji: "🛒", n: 1 },
  { icon: Landmark, emoji: "🏦", n: 2 },
  { icon: Wifi, emoji: "📡", n: 3 }];

  const sectors = sectorDefs.
  filter((s) => isKeyActive(`sector_${s.n}_title`)).
  map((s, idx) => ({
    icon: s.icon,
    emoji: s.emoji,
    title: t(`sector_${s.n}_title`, ''),
    subtitle: t(`sector_${s.n}_subtitle`, ''),
    pain: t(`sector_${s.n}_pain`, ''),
    solution: t(`sector_${s.n}_solution`, '')
  }));

  const testimonials = [1, 2, 3].
  filter((i) => isKeyActive(`testimonial_${i}_quote`)).
  map((i, idx) => ({
    quote: t(`testimonial_${i}_quote`, ''),
    name: t(`testimonial_${i}_name`, ''),
    role: t(`testimonial_${i}_role`, ''),
    emoji: ["🛒", "🏦", "📡"][idx]
  }));

  const pricingFeatureCounts: Record<string, {f: number;n: number;}> = {
    basic: { f: 6, n: 3 },
    premium: { f: 8, n: 1 },
    enterprise: { f: 8, n: 0 }
  };

  const pricingPlans = [
  { key: 'basic', icon: planIcons[0], popular: false },
  { key: 'premium', icon: planIcons[1], popular: true },
  { key: 'enterprise', icon: planIcons[2], popular: false }].

  filter((p) => isKeyActive(`pricing_${p.key}_name`)).
  map((p) => ({
    name: t(`pricing_${p.key}_name`, p.key),
    price: t(`pricing_${p.key}_price`, '0'),
    period: t(`pricing_${p.key}_period`, 'ay / filial'),
    description: t(`pricing_${p.key}_desc`, ''),
    icon: p.icon,
    popular: p.popular,
    features: Array.from({ length: pricingFeatureCounts[p.key].f }, (_, i) => t(`pricing_${p.key}_f${i + 1}`, '')).filter(Boolean),
    notIncluded: Array.from({ length: pricingFeatureCounts[p.key].n }, (_, i) => t(`pricing_${p.key}_n${i + 1}`, '')).filter(Boolean)
  }));

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } })
  };

  const navLinks = landingMenus.length > 0 ?
  landingMenus.map((m) => ({ href: m.url || "#", label: m.label })) :
  [
  { href: "#problem", label: "Problem" },
  { href: "#solution", label: "Həll" },
  { href: "#sectors", label: "Sektorlar" },
  { href: "#how-it-works", label: "Necə işləyir" },
  { href: "#testimonials", label: "Rəylər" },
  { href: "#pricing", label: "Qiymətlər" }];


  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ═══ Fixed Navigation ═══ */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-2xl">
        
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <AppLogo size="sm" onClick={() => navigate("/")} />
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            {navLinks.map((link) =>
            <a key={link.href} href={link.href} className="hover:text-foreground transition-colors font-medium">{link.label}</a>
            )}
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => navigate("/survey")} className="hidden sm:inline-flex text-muted-foreground hover:text-foreground">
              Demo
            </Button>
            <Button size="sm" onClick={() => navigate("/auth")} className="gap-1 hidden sm:inline-flex shadow-lg shadow-primary/20">
              Giriş <ArrowRight className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen &&
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl">
          
            <div className="container mx-auto px-4 py-4 space-y-3">
              {navLinks.map((link) =>
            <a key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {link.label}
                </a>
            )}
              <div className="pt-2 flex flex-col gap-2">
                <Button variant="outline" size="sm" onClick={() => {navigate("/survey");setMobileMenuOpen(false);}}>Demo</Button>
                <Button size="sm" onClick={() => {navigate("/auth");setMobileMenuOpen(false);}}>Giriş <ArrowRight className="w-3.5 h-3.5 ml-1" /></Button>
              </div>
            </div>
          </motion.div>
        }
      </motion.nav>

      {/* ═══ Hero — Centered High-Impact with Parallax ═══ */}
      <section ref={heroRef} className="relative pt-36 pb-24 md:pt-48 md:pb-36 lg:pt-56 lg:pb-44 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[180px]"
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
          
          <motion.div
            className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/8 rounded-full blur-[160px]"
            animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.25, 0.1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
          
          <motion.div
            className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[140px]"
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.15, 0.1, 0.15] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} />
          
          {/* Floating particles */}
          <FloatingParticle delay={0} x="10%" y="20%" size={6} />
          <FloatingParticle delay={1.5} x="85%" y="30%" size={8} />
          <FloatingParticle delay={3} x="50%" y="15%" size={5} />
          <FloatingParticle delay={2} x="30%" y="70%" size={7} />
          <FloatingParticle delay={4} x="70%" y="60%" size={4} />
          <FloatingParticle delay={1} x="20%" y="80%" size={6} />
        </div>

        <motion.div style={{ opacity: heroOpacity, y: heroY, scale: heroScale }} className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
              <Badge variant="outline" className="text-sm px-5 py-2 rounded-full border-primary/30 text-primary bg-primary/5 backdrop-blur-sm font-medium">
                <Sparkles className="w-3.5 h-3.5 mr-2" />
                {t('hero_badge', 'AI-Powered Employee Sentiment Platform')}
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
              
              <span className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
                {t('hero_title_1', 'Turn Employee Sentiment into')}
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
                {t('hero_title_2', 'Competitive Advantage')}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              
              {t('hero_subtitle', 'Satışı ölçürsünüz. Bəs satışı yaradan insanın əhvalını? Ölçülməyən emosiya idarə oluna bilməz.')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center">
              
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="text-base px-10 h-14 rounded-2xl gap-2 shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 hover:scale-[1.02]">
                
                {t('hero_cta_primary', 'Request Demo')} <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/survey")}
                className="text-base px-10 h-14 rounded-2xl gap-2 border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300">
                
                {t('hero_cta_secondary', 'Get Started')} <ChevronRight className="w-5 h-5" />
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              
              <Lock className="w-3.5 h-3.5" />
              {t('hero_trust_text', '')}
            </motion.p>
          </div>

          {/* ═══ Glassmorphism Dashboard Preview with Parallax ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            style={{ y: dashboardY, scale: dashboardScale }}
            className="mt-16 md:mt-24 max-w-5xl mx-auto relative perspective-[1200px]">
            
            <div className="glass-card rounded-2xl p-6 md:p-8 shadow-2xl">
              {/* Top bar */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-status-normal/60" />
                  <div className="w-3 h-3 rounded-full bg-status-good/60" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-secondary/10 text-secondary border-secondary/20">
                    <Activity className="w-3 h-3 mr-1" /> Canlı
                  </Badge>
                  <span className="text-xs text-muted-foreground font-medium">MoodAI Dashboard</span>
                </div>
              </div>

              {/* Mini dashboard cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                { label: "Əhval Skoru", value: "78%", change: "+5%", icon: TrendingUp, positive: true },
                { label: "Tükənmə Riski", value: "Aşağı", change: "Stabil", icon: Shield, positive: true },
                { label: "Aktiv İşçi", value: "342", change: "12 filial", icon: Users, positive: true },
                { label: "AI Alerts", value: "3", change: "Bu həftə", icon: Bell, positive: false }].
                map((card, i) =>
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="rounded-xl bg-muted/50 border border-border/40 p-4 space-y-1">
                  
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                    <p className="text-xl md:text-2xl font-bold text-foreground">{card.value}</p>
                    <div className={`flex items-center gap-1 text-xs ${card.positive ? 'text-secondary' : 'text-primary'}`}>
                      <card.icon className="w-3 h-3" /> {card.change}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Charts Row */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Line Chart */}
                <div className="rounded-xl bg-muted/30 border border-border/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-foreground">Həftəlik Əhval Trendi</span>
                    <Badge variant="outline" className="text-[10px] px-2 py-0 bg-primary/10 text-primary border-primary/20">
                      <LineChart className="w-3 h-3 mr-1" /> Trend
                    </Badge>
                  </div>
                  <ChartContainer config={moodChartConfig} className="h-[180px] w-full">
                    <RechartsLineChart data={weeklyMoodData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 20% 20%)" />
                      <XAxis dataKey="day" tick={{ fill: 'hsl(215 20% 60%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[50, 100]} tick={{ fill: 'hsl(215 20% 60%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="mood" stroke="hsl(239 84% 67%)" strokeWidth={2.5} dot={{ r: 4, fill: 'hsl(239 84% 67%)' }} />
                      <Line type="monotone" dataKey="engagement" stroke="hsl(160 84% 39%)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    </RechartsLineChart>
                  </ChartContainer>
                </div>

                {/* Radar Chart */}
                <div className="rounded-xl bg-muted/30 border border-border/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-foreground">Emosional Balans</span>
                    <Badge variant="outline" className="text-[10px] px-2 py-0 bg-secondary/10 text-secondary border-secondary/20">
                      <Radar className="w-3 h-3 mr-1" /> Analiz
                    </Badge>
                  </div>
                  <ChartContainer config={radarChartConfig} className="h-[180px] w-full">
                    <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                      <PolarGrid stroke="hsl(217 20% 22%)" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: 'hsl(215 20% 60%)', fontSize: 10 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                      <RechartsRadar name="Skor" dataKey="value" stroke="hsl(239 84% 67%)" fill="hsl(239 84% 67%)" fillOpacity={0.2} strokeWidth={2} />
                    </RadarChart>
                  </ChartContainer>
                </div>
              </div>
            </div>

            {/* Glow behind dashboard */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 -z-10 blur-2xl" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ Social Proof — Trusted by Leaders ═══ */}
      <section className="py-12 md:py-16 border-y border-border/40 bg-muted/20">
        <div className="container mx-auto px-4">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-sm text-muted-foreground mb-8 uppercase tracking-widest font-medium">
            
            {t('trust_title', 'Trusted by Leaders')}
          </motion.p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {(cmsPartners.length > 0 ? cmsPartners : [{ name: "OBA Market", logo_url: null }, { name: "PATCO Group", logo_url: null }]).map((partner: any, i: number) =>
            <motion.div
              key={partner.name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="flex items-center gap-3 opacity-50 hover:opacity-100 transition-all duration-500 cursor-default">
              
                {partner.logo_url ?
              <img src={partner.logo_url} alt={partner.name} className="w-12 h-12 object-contain rounded-xl" /> :

              <div className="w-12 h-12 rounded-xl bg-muted/50 border border-border/40 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-muted-foreground" />
                  </div>
              }
                <span className="text-lg font-semibold text-muted-foreground">{partner.name}</span>
              </motion.div>
            )}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 bg-secondary/10 border border-secondary/20 rounded-full px-5 py-2">
              
              <Award className="w-5 h-5 text-secondary" />
              <span className="text-sm font-semibold text-secondary">{t('trusted_partner', 'Trusted Partner Certificate')}</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ Counter Stats ═══ */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          {(() => {
            const statItems = [
            { key: 'stat_companies', suffix: "+", label_key: 'stat_companies_label', def: '50', deflabel: 'Şirkət istifadə edir' },
            { key: 'stat_users', suffix: "+", label_key: 'stat_users_label', def: '340', deflabel: 'Aktiv istifadəçi' },
            { key: 'stat_branches', suffix: "+", label_key: 'stat_branches_label', def: '120', deflabel: 'Filial' },
            { key: 'stat_satisfaction', suffix: "%", label_key: 'stat_satisfaction_label', def: '98', deflabel: 'Məmnuniyyət' }].
            filter((s) => isKeyActive(s.key));
            const cols = statItems.length <= 2 ? 'grid-cols-2' : statItems.length === 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4';
            return (
              <div className={`grid ${cols} gap-8 max-w-4xl mx-auto text-center`}>
                {statItems.map((item, i) =>
                <CounterItem
                  key={item.key}
                  end={parseInt(t(item.key, item.def))}
                  suffix={item.suffix}
                  label={t(item.label_key, item.deflabel)}
                  delay={i * 0.15} />

                )}
              </div>);

          })()}
        </div>
      </section>

      {/* ═══ Pain Point Statistics with Parallax ═══ */}
      <section id="problem" className="py-20 md:py-28 relative overflow-hidden">
        <FloatingParticle delay={2} x="5%" y="30%" size={5} />
        <FloatingParticle delay={4} x="90%" y="60%" size={7} />
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16 space-y-4">
            <motion.div variants={fadeUp} custom={0}>
              <Badge variant="outline" className="text-sm px-4 py-1.5 rounded-full border-destructive/30 text-destructive bg-destructive/5">
                <XCircle className="w-3.5 h-3.5 mr-1.5" /> {t('problem_badge', 'Problem')}
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-bold">
              {t('problem_title', 'Rəqəmlərin arxasındakı həqiqət')}
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('problem_subtitle', 'Rəqabət qiymətdə deyil, müştəri təcrübəsindədir.')}
            </motion.p>
          </motion.div>

          <div className={`grid gap-5 ${painStats.length <= 2 ? 'sm:grid-cols-2' : painStats.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
            {painStats.map((stat, i) =>
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30, rotateX: 10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, type: "spring", stiffness: 100 }}
              whileHover={{ y: -8, scale: 1.02 }}>
              
                <Card className="h-full border-border/40 glass-card glass-card-hover transition-all duration-300 group rounded-2xl">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <motion.div
                      className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/15 transition-colors"
                      whileHover={{ rotate: 10, scale: 1.1 }}>
                      
                        <stat.icon className="w-6 h-6 text-destructive" />
                      </motion.div>
                      <span className="text-3xl md:text-4xl font-extrabold text-foreground">{stat.value}</span>
                    </div>
                    <h3 className="text-lg font-semibold">{stat.label}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{stat.detail}</p>
                    <p className="text-xs text-muted-foreground/60 italic">— {stat.source}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ═══ The 'Mood' Engine — AI Sentiment Analysis ═══ */}
      <section id="solution" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-8 space-y-4">
            <motion.div variants={fadeUp} custom={0}>
              <Badge variant="outline" className="text-sm px-4 py-1.5 rounded-full border-primary/30 text-primary bg-primary/5">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" /> {t('solution_badge', 'The Mood Engine')}
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-bold">
              {t('solution_title', 'AI ilə Emosiya Analitikası')}
            </motion.h2>
          </motion.div>

          {/* MoodAI intro card */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto mb-16">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-secondary/5 shadow-xl overflow-hidden rounded-2xl">
              <CardContent className="p-8 md:p-12 text-center space-y-6">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto shadow-glow">
                  
                  <Brain className="w-10 h-10 text-primary-foreground" />
                </motion.div>
                <p className="text-xl md:text-2xl leading-relaxed text-foreground/90 max-w-2xl mx-auto" dangerouslySetInnerHTML={{ __html: t('solution_intro', 'Emosiyaları <strong class="text-primary">KPI-ya</strong> çevirin. İtkini gözləməyin — <strong class="text-secondary">qarşısını alın.</strong>') }} />
                <div className="flex items-center justify-center gap-2 text-secondary font-medium">
                  <Shield className="w-5 h-5" />
                  <span>{t('solution_shield', 'İtki olmadan ÖNCƏ müdaxilə')}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ═══ Bento Grid Features — auto-reflows based on active count ═══ */}
          {solutionFeatures.length > 0 && (() => {
            const count = solutionFeatures.length;
            // Determine grid cols: 1→1col, 2→2col, 3→3col, 4→2×2, 5-6→3col
            const gridCols =
            count === 1 ? "grid-cols-1 max-w-md mx-auto" :
            count === 2 ? "md:grid-cols-2 max-w-3xl mx-auto" :
            count === 4 ? "md:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto" :
            "md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto";

            return (
              <div className={`grid gap-5 ${gridCols}`}>
                {solutionFeatures.map((feature, i) => {
                  // First card gets wide span only when count is 5 or 6
                  const isWide = i === 0 && count >= 5;
                  return (
                    <motion.div
                      key={feature.title || i}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, type: "spring", stiffness: 120 }}
                      whileHover={{ y: -6, scale: 1.02 }}
                      className={isWide ? "lg:col-span-2" : ""}>
                      
                      <Card className={`h-full glass-card glass-card-hover transition-all duration-300 group rounded-2xl ${isWide ? "bg-gradient-to-br from-primary/5 to-transparent" : ""}`}>
                        <CardContent className="p-7 space-y-4">
                          <div className="flex items-center justify-between">
                            <motion.div
                              className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors"
                              whileHover={{ rotate: 12, scale: 1.1 }}
                              transition={{ type: "spring", stiffness: 300 }}>
                              
                              <feature.icon className="w-6 h-6 text-primary" />
                            </motion.div>
                            {feature.metric &&
                            <Badge variant="outline" className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-muted/50 text-muted-foreground">
                                {feature.metric}
                              </Badge>
                            }
                          </div>
                          <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{feature.title}</h3>
                          <p className="text-muted-foreground leading-relaxed text-sm">{feature.description}</p>
                        </CardContent>
                      </Card>
                    </motion.div>);

                })}
              </div>);

          })()}
        </div>
      </section>

      {/* ═══ AI Insights Section ═══ */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12 space-y-4">
            <motion.div variants={fadeUp} custom={0}>
              <Badge variant="outline" className="text-sm px-4 py-1.5 rounded-full border-primary/30 text-primary bg-primary/5">
                <Brain className="w-3.5 h-3.5 mr-1.5 animate-pulse" /> AI Insights
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold">
              Real-vaxt AI Analiz
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <AIInsightCard
              icon={TrendingUp}
              title="Stress Artımı Aşkarlandı"
              description="Marketinq şöbəsində stress səviyyəsi bu həftə 12% artıb. Proaktiv müdaxilə tövsiyə olunur."
              color="bg-status-normal/10 text-status-normal"
              delay={0.1} />
            
            <AIInsightCard
              icon={AlertTriangle}
              title="Burnout Riski"
              description="3 əməkdaşda ardıcıl 5 gün mənfi əhval-ruhiyyə qeydə alınıb. Menecerə bildiriş göndərildi."
              color="bg-destructive/10 text-destructive"
              delay={0.2} />
            
            <AIInsightCard
              icon={CheckCircle2}
              title="Pozitiv Trend"
              description="Satış şöbəsində məmnuniyyət 8% artıb. Komanda toplantılarının müsbət təsiri müşahidə olunur."
              color="bg-secondary/10 text-secondary"
              delay={0.3} />
            
          </div>
        </div>
      </section>

      {/* ═══ Sectors ═══ */}
      <section id="sectors" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16 space-y-4">
            <motion.div variants={fadeUp} custom={0}>
              <Badge variant="outline" className="text-sm px-4 py-1.5 rounded-full">
                <Layers className="w-3.5 h-3.5 mr-1.5" /> {t('sectors_title', 'Sektorlar')}
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-bold">
              {t('sectors_title', 'Sektorlar üçün MoodAI')}
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('sectors_subtitle', 'Hər sektorun öz ağrı nöqtəsi var. MoodAI hər birinə uyğunlaşır.')}
            </motion.p>
          </motion.div>

          <div className={`grid gap-5 max-w-6xl mx-auto ${sectors.length === 1 ? 'grid-cols-1 max-w-xl mx-auto' : sectors.length === 2 ? 'md:grid-cols-2 max-w-3xl' : 'md:grid-cols-3'}`}>
            {sectors.map((sector, i) =>
            <motion.div
              key={sector.title || i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}>
              
                <Card className="h-full glass-card glass-card-hover hover:-translate-y-2 transition-all duration-300 group rounded-2xl overflow-hidden">
                  <div className="h-1 w-full gradient-primary" />
                  <CardContent className="p-7 space-y-5">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{sector.emoji}</span>
                      <div>
                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{sector.title}</h3>
                        <p className="text-sm text-muted-foreground">{sector.subtitle}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="rounded-xl bg-destructive/5 border border-destructive/10 p-3">
                        <p className="text-sm text-destructive/80 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>{sector.pain}</span>
                        </p>
                      </div>
                      <div className="rounded-xl bg-secondary/5 border border-secondary/10 p-3">
                        <p className="text-sm text-secondary flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>{sector.solution}</span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ═══ How it Works ═══ */}
      <section id="how-it-works" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-20 space-y-4">
            <motion.div variants={fadeUp} custom={0}>
              <Badge variant="outline" className="text-sm px-4 py-1.5 rounded-full">
                <Zap className="w-3.5 h-3.5 mr-1.5" /> {t('badge_process', 'Proses')}
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-bold">{t('steps_title', 'Sadəcə 3 addım')}</motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg max-w-xl mx-auto">
              {t('steps_subtitle', 'Dəqiqələr ərzində quraşdırın. Elə bu gün nəticə görün.')}
            </motion.p>
          </motion.div>

          <div className={`grid gap-8 max-w-5xl mx-auto ${steps.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' : steps.length === 2 ? 'md:grid-cols-2 max-w-3xl' : 'md:grid-cols-3'}`}>
            {steps.map((item, i) =>
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative text-center space-y-5">
              
                <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 shadow-glow">
                
                  <item.icon className="w-9 h-9 text-primary" />
                </motion.div>
                <div className="inline-block text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full tracking-widest uppercase">
                  {t('step_label', 'Addım')} {item.step}
                </div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                {i < steps.length - 1 &&
              <div className="hidden md:block absolute top-10 -right-4 translate-x-1/2">
                    <motion.div
                  animate={{ x: [0, 6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                  
                      <ArrowRight className="w-6 h-6 text-primary/25" />
                    </motion.div>
                  </div>
              }
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ═══ Results & Impact ═══ */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16 space-y-4">
            <motion.div variants={fadeUp} custom={0}>
              <Badge variant="outline" className="text-sm px-4 py-1.5 rounded-full">
                <TrendingUp className="w-3.5 h-3.5 mr-1.5" /> {t('badge_results', 'Nəticələr')}
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-bold">
              {t('results_title', 'Ölçülə bilən nəticələr')}
            </motion.h2>
          </motion.div>

          <div className={`grid gap-5 max-w-5xl mx-auto ${resultMetrics.length <= 2 ? 'sm:grid-cols-2' : resultMetrics.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
            {resultMetrics.map((m, i) =>
            <motion.div
              key={m.label || i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}>
              
                <Card className="text-center glass-card glass-card-hover hover:-translate-y-1 transition-all duration-300 rounded-2xl">
                  <CardContent className="p-8 space-y-3">
                    <div className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {m.value}
                    </div>
                    <p className="text-sm text-muted-foreground leading-snug">{m.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ═══ Testimonials ═══ */}
      <section id="testimonials" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16 space-y-4">
            <motion.div variants={fadeUp} custom={0}>
              <Badge variant="outline" className="text-sm px-4 py-1.5 rounded-full">
                <Quote className="w-3.5 h-3.5 mr-1.5" /> {t('badge_reviews', 'Rəylər')}
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-bold">
              {t('reviews_title', 'Müştərilərimiz nə deyir?')}
            </motion.h2>
          </motion.div>

          <div className={`grid gap-5 max-w-5xl mx-auto ${testimonials.length === 1 ? 'grid-cols-1 max-w-lg mx-auto' : testimonials.length === 2 ? 'md:grid-cols-2 max-w-3xl' : 'md:grid-cols-3'}`}>
            {testimonials.map((item, i) =>
            <motion.div
              key={item.name || i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}>
              
                <Card className="h-full glass-card glass-card-hover transition-all duration-300 rounded-2xl group">
                  <CardContent className="p-7 space-y-5">
                    <Quote className="w-10 h-10 text-primary/20 group-hover:text-primary/30 transition-colors" />
                    <p className="text-foreground/80 leading-relaxed italic text-[15px]">"{item.quote}"</p>
                    <div className="flex items-center gap-3 pt-2 border-t border-border/30">
                      <span className="text-2xl">{item.emoji}</span>
                      <div>
                        <div className="text-sm font-semibold">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ═══ Pricing ═══ */}
      <section id="pricing" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-20 space-y-4">
            <motion.div variants={fadeUp} custom={0}>
              <Badge variant="outline" className="text-sm px-4 py-1.5 rounded-full">
                <Crown className="w-3.5 h-3.5 mr-1.5" /> {t('badge_pricing', 'Qiymətlər')}
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-bold">{t('pricing_title', 'Abunə Paketləri')}</motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg max-w-xl mx-auto">
              {t('pricing_subtitle', 'Filial bazasında. 14 gün pulsuz.')}
            </motion.p>
          </motion.div>

          <div className={`grid gap-5 max-w-6xl mx-auto ${pricingPlans.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' : pricingPlans.length === 2 ? 'md:grid-cols-2 max-w-3xl' : 'md:grid-cols-3'}`}>
            {pricingPlans.map((plan, i) =>
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative">
              
                {plan.popular &&
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="gradient-primary text-primary-foreground px-4 py-1 text-xs shadow-glow">
                      <Sparkles className="w-3 h-3 mr-1" /> {t('popular_badge', 'Ən populyar')}
                    </Badge>
                  </div>
              }
                <Card className={`h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 rounded-2xl ${
              plan.popular ?
              "border-primary/50 shadow-glow bg-gradient-to-b from-primary/10 to-transparent" :
              "glass-card glass-card-hover"}`
              }>
                  <CardHeader className="pb-4 pt-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-md ${
                    plan.popular ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`
                    }>
                        <plan.icon className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold">{plan.price}</span>
                      <span className="text-lg text-muted-foreground">AZN</span>
                      <span className="text-sm text-muted-foreground ml-1">/ {plan.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Button
                    onClick={() => navigate("/auth")}
                    className={`w-full h-11 rounded-xl transition-all duration-300 ${plan.popular ? "shadow-lg shadow-primary/30 hover:shadow-primary/50" : ""}`}
                    variant={plan.popular ? "default" : "outline"}>
                    
                      {t('free_start_btn', 'Pulsuz başla')} <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                    <div className="space-y-3">
                      {plan.features.map((feature) =>
                    <div key={feature} className="flex items-start gap-2.5 text-sm">
                          <Check className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </div>
                    )}
                      {plan.notIncluded.map((feature) =>
                    <div key={feature} className="flex items-start gap-2.5 text-sm text-muted-foreground/50">
                          <Check className="w-4 h-4 mt-0.5 shrink-0 opacity-30" />
                          <span className="line-through">{feature}</span>
                        </div>
                    )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ═══ FAQ (CMS) ═══ */}
      {cmsFaqs.length > 0 &&
      <section id="faq" className="py-20 md:py-28">
          <div className="container mx-auto px-4 max-w-3xl">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12 space-y-4">
              <motion.div variants={fadeUp} custom={0}>
                <Badge variant="outline" className="text-sm px-4 py-1.5 rounded-full">
                  <HelpCircle className="w-3.5 h-3.5 mr-1.5" /> FAQ
                </Badge>
              </motion.div>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold">{t('faq_title', 'Tez-tez Verilən Suallar')}</motion.h2>
            </motion.div>

            <Accordion type="single" collapsible className="space-y-3">
              {cmsFaqs.map((faq: any, i: number) =>
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}>
              
                  <AccordionItem value={faq.id} className="border border-border/40 rounded-xl px-5 glass-card">
                    <AccordionTrigger className="text-left font-medium hover:no-underline py-4">{locale !== 'az' ? tField('cms_faqs', faq.id, 'question', faq.question) || faq.question : faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">{locale !== 'az' ? tField('cms_faqs', faq.id, 'answer', faq.answer) || faq.answer : faq.answer}</AccordionContent>
                  </AccordionItem>
                </motion.div>
            )}
            </Accordion>
          </div>
        </section>
      }

      {/* ═══ CTA ═══ */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-secondary/5 p-12 md:p-20 space-y-8 shadow-2xl relative overflow-hidden">
            
            {/* Ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 blur-[120px] -z-10" />

            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto shadow-glow">
              
              <span className="text-3xl">🚀</span>
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-bold">
              {t('cta_title', 'Emosiyaları ölçməyə başlayın. Satışları qoruyun.')}
            </h2>
            

            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Button size="lg" onClick={() => navigate("/auth")} className="text-base px-10 h-14 rounded-2xl gap-2 shadow-xl shadow-primary/30 hover:shadow-primary/50 text-lg transition-all duration-300 hover:scale-[1.02]">
                {t('nav_free_start', 'Pulsuz başlayın')} <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/survey")} className="text-base px-10 h-14 rounded-2xl text-lg border-border/60 hover:border-primary/40">
                {t('cta_demo_btn', 'Canlı demo sınayın')}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ Professional Footer ═══ */}
      <footer className="border-t border-border/30 py-16 bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="space-y-4">
              <AppLogo size="sm" onClick={() => navigate("/")} />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('footer_tagline', 'Əməkdaş Emosiya Analitika Platforması. AI ilə işçi əhvalını biznesin gücünə çevirin.')}
              </p>
            </div>

            {/* Platform */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Platform</h4>
              <div className="space-y-2">
                <button onClick={() => navigate("/survey")} className="block text-sm text-muted-foreground hover:text-primary transition-colors">Demo</button>
                <button onClick={() => navigate("/auth")} className="block text-sm text-muted-foreground hover:text-primary transition-colors">Giriş</button>
                <button onClick={() => navigate("/suggestion-box")} className="block text-sm text-muted-foreground hover:text-primary transition-colors">Təklif qutusu</button>
              </div>
            </div>

            {/* Partners */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tərəfdaşlar</h4>
              <div className="space-y-2">
                <a href="https://reytings.az" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                  reytings.az <ExternalLink className="w-3 h-3" />
                </a>
                <a href="#" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                  PATCO Group <ExternalLink className="w-3 h-3" />
                </a>
                <a href="#" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                  OBA Market <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Social */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Əlaqə</h4>
              <div className="space-y-2">
                <a href="mailto:info@moodai.az" className="block text-sm text-muted-foreground hover:text-primary transition-colors">info@moodai.az</a>
                <a href="https://moodai.az" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Globe className="w-3.5 h-3.5" /> moodai.az
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-border/30 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              {t('footer_copyright', '© 2026 PATCO Group. Bütün hüquqlar qorunur.')}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground/50">Powered by</span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                <Brain className="w-3.5 h-3.5 text-primary" />
                <span>MoodAI Engine v2.0</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>);

};

export default Landing;