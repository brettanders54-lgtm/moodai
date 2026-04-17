import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Mail, UserCog, Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AppLogo } from "@/components/AppLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";

const authSchema = z.object({
  email: z.string().email({ message: "Düzgün email daxil edin" }),
  password: z.string().min(6, { message: "Şifrə ən azı 6 simvol olmalıdır" })
});

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate("/dashboard");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate with zod
    const result = authSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'email') fieldErrors.email = err.message;
        if (err.path[0] === 'password') fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Sign up the user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });
        
        if (signUpError) throw signUpError;

        // If sign up successful, assign manager role by default
        if (signUpData.user) {
          const { error: roleError } = await supabase
            .rpc('assign_user_role', {
              _user_id: signUpData.user.id,
              _role: 'manager'
            });
          
          if (roleError) {
            console.error('Role assignment error:', roleError);
            // Don't throw - user is created, role can be added manually by HR
          }
        }
        
        toast({
          title: "Qeydiyyat uğurlu!",
          description: "Hesabınız Menecer rolu ilə yaradıldı. HR roluna ehtiyacınız varsa, HR ilə əlaqə saxlayın.",
        });
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
      }
    } catch (error: any) {
      let message = "Xəta baş verdi";
      if (error.message.includes("Invalid login credentials")) {
        message = "Email və ya şifrə yanlışdır";
      } else if (error.message.includes("User already registered")) {
        message = "Bu email artıq qeydiyyatdan keçib";
      } else if (error.message.includes("Password should be")) {
        message = "Şifrə ən azı 6 simvol olmalıdır";
      }
      
      toast({
        title: "Xəta",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Gradient Orbs */}
        <motion.div 
          animate={{ 
            x: [0, 40, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-primary/20 via-purple-500/15 to-transparent rounded-full blur-3xl" 
        />
        <motion.div 
          animate={{ 
            x: [0, -30, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-blue-500/20 via-cyan-500/15 to-transparent rounded-full blur-3xl" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-r from-emerald-500/10 via-transparent to-rose-500/10 rounded-full blur-3xl" 
        />

        {/* Floating Stars */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0.2, 0.6, 0.2],
              scale: [0.8, 1, 0.8],
              y: [0, -15, 0],
            }}
            transition={{ 
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
            className="absolute"
            style={{
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 4) * 20}%`,
            }}
          >
            <span className="w-3 h-3 rounded-full bg-primary/30 inline-block" />
          </motion.div>
        ))}

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "50px 50px"
        }} />
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className="w-full max-w-md relative"
      >
        {/* Card Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-50" />
        
        {/* Card */}
        <div className="relative bg-gradient-to-br from-card/95 via-card/90 to-card/80 backdrop-blur-xl rounded-3xl border border-border/50 shadow-2xl overflow-hidden">
          {/* Top Gradient Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500" />
          
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-4 left-4 z-10"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="rounded-xl hover:bg-primary/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </motion.div>

          {/* Header */}
          <div className="p-8 pb-6 text-center space-y-6">
            {/* App Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="relative inline-flex justify-center"
            >
              <div className="absolute -inset-3 bg-gradient-to-r from-primary/30 to-primary-glow/30 rounded-full blur-xl" />
              <div className="relative">
                <AppLogo size="lg" showText={false} />
              </div>
            </motion.div>
            
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <AnimatePresence mode="wait">
                <motion.h1
                  key={isSignUp ? "signup" : "login"}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="text-3xl font-bold bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent"
                >
                  {isSignUp ? "Qeydiyyat" : "Kabinet Girişi"}
                </motion.h1>
              </AnimatePresence>
              <p className="text-muted-foreground">
                {isSignUp 
                  ? "Yeni hesab yaratmaq üçün məlumatları daxil edin" 
                  : "İdarəetmə panelinə daxil olmaq üçün giriş edin"}
              </p>
            </motion.div>
          </div>


          {/* Form */}
          <div className="px-8 pb-8">
            <form onSubmit={handleAuth} className="space-y-5">
              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  Email
                </Label>
                <div className="relative group">
                  <div className={cn(
                    "absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary/50 to-purple-500/50 opacity-0 blur transition-opacity duration-300",
                    focusedField === "email" && "opacity-100"
                  )} />
                  <div className="relative">
                    <Mail className={cn(
                      "absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-300",
                      focusedField === "email" ? "text-primary" : "text-muted-foreground"
                    )} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      className={cn(
                        "pl-11 h-12 rounded-xl border-2 bg-background/50 backdrop-blur-sm transition-all duration-300",
                        focusedField === "email" ? "border-primary shadow-lg" : "border-border/50",
                        errors.email && "border-destructive"
                      )}
                      required
                    />
                  </div>
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-xs text-destructive flex items-center gap-1"
                    >
                      <span className="w-1 h-1 rounded-full bg-destructive" />
                      {errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
              
              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  Şifrə
                </Label>
                <div className="relative group">
                  <div className={cn(
                    "absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary/50 to-purple-500/50 opacity-0 blur transition-opacity duration-300",
                    focusedField === "password" && "opacity-100"
                  )} />
                  <div className="relative">
                    <Lock className={cn(
                      "absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-300",
                      focusedField === "password" ? "text-primary" : "text-muted-foreground"
                    )} />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      className={cn(
                        "pl-11 pr-11 h-12 rounded-xl border-2 bg-background/50 backdrop-blur-sm transition-all duration-300",
                        focusedField === "password" ? "border-primary shadow-lg" : "border-border/50",
                        errors.password && "border-destructive"
                      )}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-xs text-destructive flex items-center gap-1"
                    >
                      <span className="w-1 h-1 rounded-full bg-destructive" />
                      {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Info about role - Only shown during sign up */}
              <AnimatePresence>
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5 p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                          <UserCog className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-foreground">Bölgə Meneceri</span>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Qeydiyyatdan keçdikdən sonra sizə menecer rolu təyin ediləcək.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button 
                    type="submit" 
                    className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 gap-2" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Gözləyin...
                      </>
                    ) : (
                      <>
                        {isSignUp ? "Qeydiyyatdan keç" : "Daxil ol"}
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </form>

            {/* Toggle Sign Up / Sign In */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-6 text-center"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                <span className="text-xs text-muted-foreground">və ya</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>
              
              <p className="text-sm">
                <span className="text-muted-foreground">
                  {isSignUp ? "Artıq hesabınız var? " : "Hesabınız yoxdur? "}
                </span>
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-primary hover:text-primary/80 font-semibold transition-colors inline-flex items-center gap-1"
                >
                  {isSignUp ? "Daxil olun" : "Qeydiyyatdan keçin"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </p>
            </motion.div>
          </div>

          {/* Bottom Security Badge */}
          <div className="px-8 pb-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-full py-2 px-4"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              <span>256-bit SSL şifrələmə ilə qorunur</span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-4 text-xs text-muted-foreground"
      >
        © 2025 OBA Əhval Sistemi
      </motion.p>
    </div>
  );
};

export default Auth;