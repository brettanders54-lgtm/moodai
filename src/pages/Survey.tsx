import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronRight, ChevronLeft, Smile, Meh, Frown, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const MOODS = [
  { value: "Əla", label: "Əla", icon: Smile, color: "bg-emerald-500", gradient: "from-emerald-500 to-emerald-600" },
  { value: "Yaxşı", label: "Yaxşı", icon: Smile, color: "bg-emerald-400", gradient: "from-emerald-400 to-emerald-500" },
  { value: "Normal", label: "Normal", icon: Meh, color: "bg-amber-500", gradient: "from-amber-500 to-amber-600" },
  { value: "Pis", label: "Pis", icon: Frown, color: "bg-rose-500", gradient: "from-rose-500 to-rose-600" },
  { value: "Çox pis", label: "Çox pis", icon: Frown, color: "bg-rose-600", gradient: "from-rose-600 to-rose-700" },
];

const REASONS = [
  { value: "workload", label: "İş yükü" },
  { value: "schedule", label: "Qrafik" },
  { value: "manager", label: "Menecer" },
  { value: "team", label: "Komanda" },
  { value: "conditions", label: "Şərtlər" },
  { value: "other", label: "Digər" },
];

const BRANCHES = [
  { value: "baku", label: "Bakı Mərkəz" },
  { value: "ganja", label: "Gəncə" },
  { value: "sumgait", label: "Sumqayıt" },
  { value: "mingachevir", label: "Mingəçevir" },
  { value: "shirvan", label: "Şirvan" },
  { value: "lankaran", label: "Lənkəran" },
  { value: "shaki", label: "Şəki" },
  { value: "quba", label: "Quba" },
  { value: "nakhchivan", label: "Naxçıvan" },
];

const STEPS = ["branch", "department", "mood", "reason", "confirm"];

export default function SurveyNew() {
  const [currentStep, setCurrentStep] = useState(0);
  const [branch, setBranch] = useState("");
  const [department, setDepartment] = useState("");
  const [mood, setMood] = useState("");
  const [reason, setReason] = useState("");
  const [reasonText, setReasonText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const currentStepKey = STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const canProceed = () => {
    switch (currentStepKey) {
      case "branch":
        return !!branch;
      case "department":
        return !!department;
      case "mood":
        return !!mood;
      case "reason":
        return true;
      case "confirm":
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!mood) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("employee_responses").insert({
        branch,
        department,
        mood,
        reason_category: reason || null,
        reason: reasonText || null,
        response_date: new Date().toISOString().split("T")[0],
      });

      if (error) throw error;

      setIsSuccess(true);
    } catch (error) {
      console.error("Failed to submit:", error);
      toast({
        title: "Xəta baş verdi",
        description: "Cavabınız göndərilə bilmədi. Zəhmət olmasa bir azdan yenidən cəhd edin.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="text-center">
            <CardContent className="pt-12 pb-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Təşəkkürlər!</h2>
              <p className="text-muted-foreground mb-8">
                Cavablarınız uğurla qəbul edildi. Sizin rəyiniz bizim üçün çox önəmlidir.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setIsSuccess(false);
                  setCurrentStep(0);
                  setBranch("");
                  setDepartment("");
                  setMood("");
                  setReason("");
                  setReasonText("");
                }}
              >
                Yeni Cavab Vermək
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-lg mb-4">
            <span className="text-2xl font-bold text-white">O</span>
          </div>
          <h1 className="text-2xl font-bold">Əhval Sorğusu</h1>
          <p className="text-muted-foreground mt-1">Şəxsi məmnuniyyətinizi qiymətləndirin</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground text-center mt-2">
            {currentStep + 1} / {STEPS.length}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStepKey === "branch" && "Filial Seçin"}
              {currentStepKey === "department" && "Departament"}
              {currentStepKey === "mood" && "Necə hiss edirsiniz?"}
              {currentStepKey === "reason" && "Səbəb (İstəyə bağlı)"}
              {currentStepKey === "confirm" && "Təsdiqləyin"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {/* Branch Selection */}
              {currentStepKey === "branch" && (
                <motion.div
                  key="branch"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-3"
                >
                  {BRANCHES.map((b) => (
                    <button
                      key={b.value}
                      onClick={() => setBranch(b.value)}
                      className={cn(
                        "w-full p-4 rounded-xl border text-left transition-all",
                        branch === b.value
                          ? "border-primary bg-primary/5 ring-2 ring-primary"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      )}
                    >
                      {b.label}
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Department */}
              {currentStepKey === "department" && (
                <motion.div
                  key="department"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Textarea
                    placeholder="Departament adını daxil edin..."
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="min-h-[120px]"
                  />
                </motion.div>
              )}

              {/* Mood Selection */}
              {currentStepKey === "mood" && (
                <motion.div
                  key="mood"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-1 gap-3"
                >
                  {MOODS.map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.value}
                        onClick={() => setMood(m.value)}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-xl border transition-all",
                          mood === m.value
                            ? "border-primary bg-primary/5 ring-2 ring-primary"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        )}
                      >
                        <div className={cn("p-3 rounded-xl bg-gradient-to-br", m.gradient)}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <span className="font-medium">{m.label}</span>
                      </button>
                    );
                  })}
                </motion.div>
              )}

              {/* Reason */}
              {currentStepKey === "reason" && (
                <motion.div
                  key="reason"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <RadioGroup value={reason} onValueChange={setReason}>
                    {REASONS.map((r) => (
                      <div key={r.value} className="flex items-center gap-3">
                        <RadioGroupItem value={r.value} id={r.value} />
                        <Label htmlFor={r.value}>{r.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <Textarea
                    placeholder="Əlavə şərh (istəyə bağlı)..."
                    value={reasonText}
                    onChange={(e) => setReasonText(e.target.value)}
                    className="min-h-[80px]"
                  />
                </motion.div>
              )}

              {/* Confirm */}
              {currentStepKey === "confirm" && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Filial:</span>
                      <span className="font-medium">{BRANCHES.find((b) => b.value === branch)?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Departament:</span>
                      <span className="font-medium">{department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Əhval:</span>
                      <span className="font-medium">{mood}</span>
                    </div>
                    {reason && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Səbəb:</span>
                        <span className="font-medium">{REASONS.find((r) => r.value === reason)?.label}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Geri
              </Button>
              {currentStep < STEPS.length - 1 ? (
                <Button onClick={handleNext} disabled={!canProceed()}>
                  Davam et
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting || !canProceed()}>
                  {isSubmitting ? "Göndərilir..." : "Göndər"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}