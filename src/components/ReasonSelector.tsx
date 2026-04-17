import { useState } from "react";
import { User, Briefcase, Clock, Users, Building, MoreHorizontal, ArrowLeft, Send, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

export type ReasonType = "manager" | "workload" | "schedule" | "team" | "conditions" | "other";

interface ReasonSelectorProps {
  onReasonSelect: (reason: ReasonType, customText?: string) => void;
  onBack: () => void;
}

const reasons = [
  {
    type: "manager" as const,
    icon: User,
    label: "Menecer",
    description: "İdarəetmə ilə bağlı",
    gradient: "from-violet-500 to-purple-500",
    bgGradient: "from-violet-500/15 to-purple-500/15",
    iconBg: "bg-gradient-to-br from-violet-500 to-purple-500",
  },
  {
    type: "workload" as const,
    icon: Briefcase,
    label: "İş yükü",
    description: "Çox iş, stress",
    gradient: "from-orange-500 to-red-500",
    bgGradient: "from-orange-500/15 to-red-500/15",
    iconBg: "bg-gradient-to-br from-orange-500 to-red-500",
  },
  {
    type: "schedule" as const,
    icon: Clock,
    label: "Qrafik",
    description: "İş saatları problemi",
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-500/15 to-cyan-500/15",
    iconBg: "bg-gradient-to-br from-blue-500 to-cyan-500",
  },
  {
    type: "team" as const,
    icon: Users,
    label: "Komanda",
    description: "Həmkarlarla münasibət",
    gradient: "from-green-500 to-emerald-500",
    bgGradient: "from-green-500/15 to-emerald-500/15",
    iconBg: "bg-gradient-to-br from-green-500 to-emerald-500",
  },
  {
    type: "conditions" as const,
    icon: Building,
    label: "Şərtlər",
    description: "İş mühiti",
    gradient: "from-slate-500 to-gray-500",
    bgGradient: "from-slate-500/15 to-gray-500/15",
    iconBg: "bg-gradient-to-br from-slate-500 to-gray-500",
  },
  {
    type: "other" as const,
    icon: MoreHorizontal,
    label: "Digər",
    description: "Başqa səbəb",
    gradient: "from-pink-500 to-rose-500",
    bgGradient: "from-pink-500/15 to-rose-500/15",
    iconBg: "bg-gradient-to-br from-pink-500 to-rose-500",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 350,
      damping: 25,
    },
  },
};

export const ReasonSelector = ({ onReasonSelect, onBack }: ReasonSelectorProps) => {
  const [selectedReason, setSelectedReason] = useState<ReasonType | null>(null);
  const [customText, setCustomText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReasonClick = (reason: ReasonType) => {
    setSelectedReason(reason);
    if (reason !== "other") {
      handleSubmit(reason);
    }
  };

  const handleSubmit = (reason: ReasonType = selectedReason!) => {
    if (!reason) return;
    
    setIsSubmitting(true);
    setTimeout(() => {
      onReasonSelect(reason, reason === "other" ? customText : undefined);
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="relative inline-flex items-center justify-center"
        >
          <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-rose-500/30 to-red-500/30 rounded-2xl blur-2xl" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500/20 via-red-500/15 to-rose-500/10 backdrop-blur-sm border border-rose-500/20 shadow-xl flex items-center justify-center">
            <motion.span 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
              className="text-5xl"
            >
              💭
            </motion.span>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
            Nə baş verib?
          </h2>
          <p className="text-lg text-muted-foreground">
            Səbəbi seçin •{" "}
            <span className="text-primary font-medium">Tamamilə anonim</span>
          </p>
        </motion.div>
      </div>

      {/* Reason Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4"
      >
        {reasons.map((reason) => {
          const Icon = reason.icon;
          const isSelected = selectedReason === reason.type;

          return (
            <motion.button
              key={reason.type}
              variants={itemVariants}
              onClick={() => handleReasonClick(reason.type)}
              disabled={isSubmitting}
              whileHover={{ scale: 1.02, y: -3 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative group p-5 md:p-6 rounded-2xl border-2 transition-all duration-300",
                "flex flex-col items-center gap-4",
                "focus:outline-none focus:ring-4 focus:ring-primary/20",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "overflow-hidden backdrop-blur-sm",
                isSelected
                  ? "border-transparent shadow-xl"
                  : "border-border/50 bg-gradient-to-br from-card/90 to-card/70 hover:border-transparent hover:shadow-lg"
              )}
            >
              {/* Gradient Background */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: isSelected ? 1 : 0 }}
                className={cn(
                  "absolute inset-0 bg-gradient-to-br transition-opacity duration-500",
                  reason.bgGradient
                )} 
              />
              
              {/* Hover Gradient */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-60 transition-opacity duration-500",
                reason.bgGradient
              )} />

              {/* Shine Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <motion.div 
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "200%" }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" 
                />
              </div>

              {/* Icon Container */}
              <motion.div
                animate={isSelected ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
                transition={{ duration: 0.4 }}
                className={cn(
                  "relative w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg",
                  isSelected 
                    ? reason.iconBg
                    : "bg-muted/50 group-hover:bg-muted"
                )}
              >
                <Icon className={cn(
                  "w-7 h-7 transition-colors duration-300",
                  isSelected ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                )} />
                
                {/* Icon Glow */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={cn(
                      "absolute inset-0 rounded-xl blur-xl",
                      reason.iconBg
                    )}
                  />
                )}
              </motion.div>

              {/* Text */}
              <div className="relative text-center">
                <h3 className={cn(
                  "text-lg font-bold mb-1 transition-colors duration-300",
                  isSelected 
                    ? `bg-gradient-to-r ${reason.gradient} bg-clip-text text-transparent` 
                    : "text-foreground"
                )}>
                  {reason.label}
                </h3>
                <p className={cn(
                  "text-xs transition-colors duration-300",
                  isSelected ? "text-foreground/70" : "text-muted-foreground"
                )}>
                  {reason.description}
                </p>
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center shadow-lg"
                >
                  <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Custom Text Input for "Other" */}
      <AnimatePresence>
        {selectedReason === "other" && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 overflow-hidden"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-2xl blur-lg" />
              <div className="relative bg-gradient-to-br from-card to-card/80 rounded-xl border border-border/50 p-1">
                <div className="flex items-center gap-2 px-4 py-2 border-b border-border/30">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Əlavə məlumat</span>
                </div>
                <Textarea
                  placeholder="Zəhmət olmasa qısaca yazın... (ixtiyari)"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="min-h-[100px] resize-none text-base border-0 focus-visible:ring-0 bg-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Button
                  variant="outline"
                  onClick={onBack}
                  className="w-full h-12 rounded-xl gap-2 border-border/50 hover:bg-muted/50"
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Geri
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Button
                  onClick={() => handleSubmit()}
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-xl gap-2 bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Göndərilir...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Göndər
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back Button */}
      <AnimatePresence>
        {selectedReason && selectedReason !== "other" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="text-center"
          >
            <Button
              variant="ghost"
              onClick={onBack}
              disabled={isSubmitting}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Geri qayıt
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};