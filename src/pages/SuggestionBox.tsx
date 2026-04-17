import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquarePlus, 
  Send, 
  CheckCircle2, 
  Star, 
  Lightbulb,
  AlertCircle,
  ArrowLeft,
  Shield,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import obaLogo from "@/assets/oba-logo.jpg";

type CategoryType = "suggestion" | "complaint" | "improvement" | "other" | null;

const categories = [
  { 
    id: "suggestion" as CategoryType, 
    label: "Təklif", 
    icon: Lightbulb, 
    emoji: "💡",
    color: "from-amber-500 to-yellow-400",
    description: "Yeni fikir və ya təşəbbüs"
  },
  { 
    id: "complaint" as CategoryType, 
    label: "Şikayət", 
    icon: AlertCircle, 
    emoji: "⚠️",
    color: "from-rose-500 to-red-400",
    description: "Problem və ya narazılıq"
  },
  { 
    id: "improvement" as CategoryType, 
    label: "Yaxşılaşdırma", 
    icon: Star, 
    emoji: "⭐",
    color: "from-emerald-500 to-green-400",
    description: "Mövcud prosesi inkişaf etdirmə"
  },
  { 
    id: "other" as CategoryType, 
    label: "Digər", 
    icon: MessageSquarePlus, 
    emoji: "📝",
    color: "from-violet-500 to-purple-400",
    description: "Digər mövzular"
  },
];

const branches = [
  { id: "baku", name: "Bakı" },
  { id: "ganja", name: "Gəncə" },
  { id: "sumgait", name: "Sumqayıt" },
  { id: "mingachevir", name: "Mingəçevir" },
  { id: "shirvan", name: "Şirvan" },
  { id: "lankaran", name: "Lənkəran" },
  { id: "shaki", name: "Şəki" },
  { id: "quba", name: "Quba" },
];

const SuggestionBox = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<"branch" | "category" | "text" | "success">("branch");
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(null);
  const [suggestionText, setSuggestionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBranchSelect = (branchId: string) => {
    setSelectedBranch(branchId);
    setTimeout(() => setStep("category"), 300);
  };

  const handleCategorySelect = (category: CategoryType) => {
    setSelectedCategory(category);
    setTimeout(() => setStep("text"), 300);
  };

  const handleSubmit = async () => {
    if (!selectedBranch || !selectedCategory || !suggestionText.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const branchName = branches.find(b => b.id === selectedBranch)?.name || selectedBranch;
      
      const { error } = await supabase
        .from("anonymous_suggestions")
        .insert({
          branch: selectedBranch,
          department: branchName,
          category: selectedCategory,
          suggestion_text: suggestionText.trim(),
        });

      if (error) throw error;

      setStep("success");
      toast({
        title: "Təklifiniz göndərildi!",
        description: "Rəy üçün təşəkkür edirik. Tamamilə anonimdir.",
      });
    } catch (error) {
      console.error("Error submitting suggestion:", error);
      toast({
        title: "Xəta baş verdi",
        description: "Zəhmət olmasa yenidən cəhd edin.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep("branch");
    setSelectedBranch(null);
    setSelectedCategory(null);
    setSuggestionText("");
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div 
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-violet-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl" 
        />
        <motion.div 
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-primary/15 via-blue-500/10 to-transparent rounded-full blur-3xl" 
        />
        
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
        className="sticky top-0 z-50 bg-gradient-to-b from-background/95 via-background/80 to-background/0 backdrop-blur-xl"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="rounded-xl hover:bg-primary/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg" />
                <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-lg ring-2 ring-border/50">
                  <span className="text-2xl">😊</span>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Anonim Təklif Qutusu
                </h1>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Lock className="w-3 h-3" />
                  Tam anonim və konfidensial
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        {step !== "success" && (
          <div className="container mx-auto px-4 pb-4">
            <div className="flex items-center gap-2 max-w-md mx-auto">
              {["branch", "category", "text"].map((s, i) => (
                <div key={s} className="flex-1 relative">
                  <motion.div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ 
                        width: (step === "branch" && i === 0) ? "50%" : 
                               (step === "category" && i <= 1) ? (i === 1 ? "50%" : "100%") :
                               (step === "text" && i <= 2) ? (i === 2 ? "50%" : "100%") : "0%"
                      }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                    />
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <AnimatePresence mode="wait">
          {/* Branch Selection */}
          {step === "branch" && (
            <motion.div
              key="branch"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full max-w-3xl space-y-8"
            >
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500/20 via-purple-500/15 to-violet-500/10 border border-violet-500/20"
                >
                  <span className="text-5xl">📍</span>
                </motion.div>
                <h2 className="text-3xl md:text-4xl font-bold">Bölgənizi seçin</h2>
                <p className="text-muted-foreground">Hansı filialda işləyirsiniz?</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {branches.map((branch, i) => (
                  <motion.div
                    key={branch.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Button
                      variant="outline"
                      onClick={() => handleBranchSelect(branch.id)}
                      className={`w-full h-20 rounded-2xl border-2 transition-all duration-300 ${
                        selectedBranch === branch.id 
                          ? "border-violet-500 bg-violet-500/10" 
                          : "border-border/50 hover:border-violet-500/50 hover:bg-violet-500/5"
                      }`}
                    >
                      <span className="text-lg font-medium">{branch.name}</span>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Category Selection */}
          {step === "category" && (
            <motion.div
              key="category"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full max-w-3xl space-y-8"
            >
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500/20 via-purple-500/15 to-violet-500/10 border border-violet-500/20"
                >
                  <span className="text-5xl">📝</span>
                </motion.div>
                <h2 className="text-3xl md:text-4xl font-bold">Kateqoriya seçin</h2>
                <p className="text-muted-foreground">Mesajınız hansı mövzuya aiddir?</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {categories.map((cat, i) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      onClick={() => handleCategorySelect(cat.id)}
                      className={`cursor-pointer transition-all duration-300 overflow-hidden group ${
                        selectedCategory === cat.id
                          ? "ring-2 ring-violet-500 bg-violet-500/10"
                          : "hover:shadow-xl hover:shadow-violet-500/10"
                      }`}
                    >
                      <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <span className="text-3xl">{cat.emoji}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{cat.label}</h3>
                          <p className="text-sm text-muted-foreground">{cat.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="text-center">
                <Button variant="ghost" onClick={() => setStep("branch")} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Geri
                </Button>
              </div>
            </motion.div>
          )}

          {/* Text Input */}
          {step === "text" && (
            <motion.div
              key="text"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full max-w-2xl space-y-8"
            >
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500/20 via-purple-500/15 to-violet-500/10 border border-violet-500/20"
                >
                  <span className="text-5xl">✍️</span>
                </motion.div>
                <h2 className="text-3xl md:text-4xl font-bold">Fikirlərinizi yazın</h2>
                <p className="text-muted-foreground">
                  {categories.find(c => c.id === selectedCategory)?.label} haqqında düşüncələriniz
                </p>
              </div>

              <Card className="border-border/50 shadow-xl">
                <CardContent className="p-6 space-y-4">
                  <Textarea
                    placeholder="Fikir və təkliflərinizi burada yazın..."
                    value={suggestionText}
                    onChange={(e) => setSuggestionText(e.target.value)}
                    className="min-h-[200px] resize-none text-lg border-border/50 focus:border-violet-500/50"
                  />
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-500" />
                      256-bit şifrələmə ilə qorunur
                    </span>
                    <span>{suggestionText.length} / 1000</span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => setStep("category")} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Geri
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!suggestionText.trim() || isSubmitting}
                  className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 px-8"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Göndərilir...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Göndər
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Success */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md text-center space-y-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/20"
              >
                <CheckCircle2 className="w-16 h-16 text-emerald-500" />
              </motion.div>

              <div className="space-y-3">
                <h2 className="text-3xl font-bold">Təşəkkür edirik!</h2>
                <p className="text-lg text-muted-foreground">
                  Fikirləriniz anonim şəkildə qəbul edildi və baxılacaq.
                </p>
              </div>

              <Card className="border-emerald-500/20 bg-emerald-500/5">
                <CardContent className="p-4 flex items-center gap-3">
                  <Lock className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm">Kimliyiniz heç bir şəkildə məlum deyil.</span>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3">
                <Button onClick={handleReset} className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600">
                  <MessageSquarePlus className="w-4 h-4" />
                  Yeni təklif göndər
                </Button>
                <Button variant="ghost" onClick={() => navigate("/")}>
                  Ana səhifəyə qayıt
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="py-6 text-center text-sm text-muted-foreground border-t border-border/30"
      >
        <p className="flex items-center justify-center gap-2">
          <Lock className="w-4 h-4" />
          Bütün məlumatlar tamamilə anonimdir
        </p>
      </motion.footer>
    </div>
  );
};

export default SuggestionBox;
