import { useState } from "react";
import { MoodSelector, type MoodType } from "@/components/MoodSelector";
import { ReasonSelector, type ReasonType } from "@/components/ReasonSelector";
import { BranchSelector, type BranchType } from "@/components/BranchSelector";
import { SuccessScreen } from "@/components/SuccessScreen";
import { TrendingUp, Sparkles, Download, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { AppLogo } from "@/components/AppLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useToast } from "@/hooks/use-toast";

type StepType = "branch" | "mood" | "reason" | "success";

// Branch name mapping
const branchNames: Record<string, string> = {
  'baku': 'Bakı',
  'ganja': 'Gəncə',
  'sumgait': 'Sumqayıt',
  'mingachevir': 'Mingəçevir',
  'shirvan': 'Şirvan',
  'lankaran': 'Lənkəran',
  'shaki': 'Şəki',
  'quba': 'Quba',
};

// Generate employee code (in real app, this would come from user session/profile)
const generateEmployeeCode = (): string => {
  return `EMP${String(Math.floor(Math.random() * 9000) + 1000)}`;
};

const Index = () => {
  const [currentStep, setCurrentStep] = useState<StepType>("branch");
  const [selectedBranch, setSelectedBranch] = useState<BranchType>(null);
  const [selectedMood, setSelectedMood] = useState<MoodType>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleBranchSelect = (branch: BranchType) => {
    setSelectedBranch(branch);
    setTimeout(() => setCurrentStep("mood"), 300);
  };

  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood);

    if (mood === "bad") {
      // If bad mood, ask for reason
      setTimeout(() => setCurrentStep("reason"), 300);
    } else {
      // If good or normal, go directly to success
      setTimeout(() => handleSubmit(mood), 300);
    }
  };

  const handleReasonSelect = (reason: ReasonType, customText?: string) => {
    handleSubmit(selectedMood, reason, customText);
  };

  const handleSubmit = async (mood: MoodType, reason?: ReasonType, customText?: string) => {
    if (isSubmitting || !selectedBranch || !mood) return;

    setIsSubmitting(true);

    try {
      const employeeCode = generateEmployeeCode();
      const branchName = branchNames[selectedBranch] || selectedBranch;

      // Map mood to Azerbaijani
      const moodMap: Record<string, string> = {
        good: "Yaxşı",
        normal: "Normal",
        bad: "Pis"
      };

      // Map reason category to Azerbaijani
      const reasonMap: Record<string, string> = {
        workload: "İş yükü",
        schedule: "Qrafik",
        manager: "Menecer",
        team: "Komanda",
        conditions: "Şərtlər",
        other: "Digər"
      };

      // 1. Save employee response to database
      const { error: responseError } = await supabase
        .from("employee_responses")
        .insert({
          employee_code: employeeCode,
          branch: selectedBranch,
          department: branchName, // Filialda şöbə yoxdur, bölgə adı istifadə olunur
          mood: moodMap[mood] || mood,
          reason: customText || null,
          reason_category: reason ? (reasonMap[reason] || reason) : null,
        });

      if (responseError) {
        console.error("Error saving response:", responseError);
        throw responseError;
      }

      // 2. If bad mood, create a burnout alert
      if (mood === "bad" && reason) {
        const riskScore = 70 + Math.floor(Math.random() * 25); // 70-95 risk score for bad mood

        const { error: alertError } = await supabase
          .from("burnout_alerts")
          .insert({
            employee_code: employeeCode,
            branch: selectedBranch,
            department: branchName, // Filialda şöbə yoxdur, bölgə adı istifadə olunur
            reason_category: reasonMap[reason] || reason,
            risk_score: riskScore,
            is_resolved: false,
          });

        if (alertError) {
          console.error("Error creating burnout alert:", alertError);
          // Don't throw - the main response was saved successfully
        }
      }

      console.log("Submitted successfully:", {
        mood,
        reason,
        customText,
        branch: selectedBranch,
        branchName,
        employeeCode,
        timestamp: new Date()
      });

      // Show success screen
      setCurrentStep("success");
    } catch (error) {
      console.error("Failed to submit:", error);
      toast({
        title: "Xəta baş verdi",
        description: "Cavabınız göndərilə bilmədi. Zəhmət olmasa bir azdan yenidən cəhd edin.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = () => {
    // Reset for next day
    setCurrentStep("branch");
    setSelectedBranch(null);
    setSelectedMood(null);
  };

  const handleBack = () => {
    if (currentStep === "reason") {
      setCurrentStep("mood");
      setSelectedMood(null);
    } else if (currentStep === "mood") {
      setCurrentStep("branch");
      setSelectedBranch(null);
    }
  };

  const stepIndex = currentStep === "branch" ? 0 : currentStep === "mood" ? 1 : currentStep === "reason" ? 2 : 3;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Gradient Orbs */}
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-purple-500/15 via-blue-500/10 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-emerald-500/10 via-transparent to-cyan-500/10 rounded-full blur-3xl"
        />

        {/* Floating Stars */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.3, 0.7, 0.3],
              scale: [0.8, 1, 0.8],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut"
            }}
            className="absolute"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
          >
            <Sparkles className="w-4 h-4 text-primary/40" />
          </motion.div>
        ))}

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 bg-gradient-to-b from-background/95 via-background/80 to-background/0 backdrop-blur-xl"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="rounded-xl hover:bg-primary/10"
                title="Ana Səhifə"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <AppLogo size="sm" onClick={() => navigate("/")} />
            </div>
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <ThemeToggle />
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/install")}
                  className="gap-2 rounded-xl hover:bg-emerald-500/10"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Quraşdır</span>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/suggestion-box")}
                  className="gap-2 rounded-xl hover:bg-violet-500/10"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Təklif</span>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/dashboard")}
                  className="gap-2 rounded-xl border-border/50 bg-card/50 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 shadow-lg shadow-black/5"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">İdarəetmə Paneli</span>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        {currentStep !== "success" && (
          <div className="container mx-auto px-4 pb-4">
            <div className="flex items-center gap-2 max-w-md mx-auto">
              {["branch", "mood", "reason"].map((step, i) => (
                <div key={step} className="flex-1 relative">
                  <motion.div
                    className="h-1.5 rounded-full bg-muted overflow-hidden"
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: i < stepIndex ? "100%" : i === stepIndex ? "50%" : "0%"
                      }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                    />
                  </motion.div>
                  {i < 2 && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 rounded-full bg-muted z-10" />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between max-w-md mx-auto mt-2 px-1">
              <span className={`text-xs font-medium transition-colors ${stepIndex >= 0 ? "text-primary" : "text-muted-foreground"}`}>Bölgə</span>
              <span className={`text-xs font-medium transition-colors ${stepIndex >= 1 ? "text-primary" : "text-muted-foreground"}`}>Əhval</span>
              <span className={`text-xs font-medium transition-colors ${stepIndex >= 2 ? "text-primary" : "text-muted-foreground"}`}>Səbəb</span>
            </div>
          </div>
        )}
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <AnimatePresence mode="wait">
          {currentStep === "branch" && (
            <motion.div
              key="branch"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <BranchSelector
                onBranchSelect={handleBranchSelect}
                selectedBranch={selectedBranch}
              />
            </motion.div>
          )}

          {currentStep === "mood" && (
            <motion.div
              key="mood"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-4xl space-y-10"
            >
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 via-purple-500/15 to-primary/10 backdrop-blur-sm border border-primary/20 shadow-xl shadow-primary/10"
                >
                  <motion.span
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="text-6xl"
                  >
                    👋
                  </motion.span>
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent"
                >
                  Bu gün necəsən?
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
                >
                  Hisslərini bizimlə paylaş. Cavabın tamamilə{" "}
                  <span className="inline-flex items-center gap-1 text-primary font-semibold">
                    <Sparkles className="w-4 h-4" />
                    anonim
                  </span>{" "}
                  və konfidensiyaldır.
                </motion.p>
              </div>

              <MoodSelector
                onMoodSelect={handleMoodSelect}
                selectedMood={selectedMood}
              />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center"
              >
                <span className="inline-flex items-center gap-2 bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm rounded-full px-5 py-2.5 border border-border/50 shadow-lg text-sm text-muted-foreground">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  Hər gün bir dəfə doldurulur
                </span>
              </motion.div>
            </motion.div>
          )}

          {currentStep === "reason" && (
            <motion.div
              key="reason"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <ReasonSelector
                onReasonSelect={handleReasonSelect}
                onBack={handleBack}
              />
            </motion.div>
          )}

          {currentStep === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <SuccessScreen onComplete={handleComplete} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="py-6 text-center text-sm text-muted-foreground border-t border-border/30 bg-gradient-to-t from-card/50 to-transparent backdrop-blur-sm"
      >
        <p className="flex items-center justify-center gap-2">
          © 2025 Personal Məmnuniyyət Sistemi
          <span className="text-primary">•</span>
          Bütün hüquqlar qorunur
        </p>
      </motion.footer>
    </div>
  );
};

export default Index;