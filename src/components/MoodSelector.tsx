import { Smile, Meh, Frown } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type MoodType = "good" | "normal" | "bad" | null;

interface MoodSelectorProps {
  onMoodSelect: (mood: MoodType) => void;
  selectedMood: MoodType;
}

const moods = [
  {
    type: "good" as const,
    icon: Smile,
    label: "Yaxşı",
    description: "Hər şey qaydasında",
    emoji: "😊",
    gradient: "from-emerald-400 to-green-500",
    bgGradient: "from-emerald-500/20 to-green-500/20",
    shadowColor: "shadow-emerald-500/25",
    ringColor: "ring-emerald-500",
    accentColor: "emerald",
  },
  {
    type: "normal" as const,
    icon: Meh,
    label: "Normal",
    description: "Adi gün keçir",
    emoji: "😐",
    gradient: "from-amber-400 to-yellow-500",
    bgGradient: "from-amber-500/20 to-yellow-500/20",
    shadowColor: "shadow-amber-500/25",
    ringColor: "ring-amber-500",
    accentColor: "amber",
  },
  {
    type: "bad" as const,
    icon: Frown,
    label: "Pis",
    description: "Çətinliklər var",
    emoji: "😔",
    gradient: "from-rose-400 to-red-500",
    bgGradient: "from-rose-500/20 to-red-500/20",
    shadowColor: "shadow-rose-500/25",
    ringColor: "ring-rose-500",
    accentColor: "rose",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 250,
      damping: 20,
    },
  },
};

export const MoodSelector = ({ onMoodSelect, selectedMood }: MoodSelectorProps) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-4xl"
    >
      {moods.map((mood, index) => {
        const Icon = mood.icon;
        const isSelected = selectedMood === mood.type;

        return (
          <motion.button
            key={mood.type}
            variants={cardVariants}
            onClick={() => onMoodSelect(mood.type)}
            whileHover={{ scale: 1.02, y: -6 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "relative group p-8 md:p-10 rounded-3xl border-2 transition-all duration-500",
              "flex flex-col items-center gap-5",
              "focus:outline-none focus:ring-4 focus:ring-primary/20",
              "overflow-hidden backdrop-blur-sm",
              isSelected
                ? `border-transparent shadow-2xl ${mood.shadowColor} ring-2 ${mood.ringColor}`
                : "border-border/50 bg-gradient-to-br from-card/90 to-card/70 hover:shadow-xl hover:border-transparent"
            )}
          >
            {/* Animated Background Gradient */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: isSelected ? 1 : 0 }}
              className={cn(
                "absolute inset-0 bg-gradient-to-br transition-opacity duration-500",
                mood.bgGradient
              )} 
            />
            
            {/* Hover Background */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-50 transition-opacity duration-500",
              mood.bgGradient
            )} />
            
            {/* Animated Circles Background */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div 
                animate={isSelected ? { 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.15, 0.3]
                } : {}}
                transition={{ duration: 3, repeat: Infinity }}
                className={cn(
                  "absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl transition-opacity duration-500",
                  `bg-gradient-to-br ${mood.gradient}`,
                  isSelected ? "opacity-40" : "opacity-0 group-hover:opacity-20"
                )} 
              />
              <motion.div 
                animate={isSelected ? { 
                  scale: [1, 1.3, 1],
                  opacity: [0.2, 0.1, 0.2]
                } : {}}
                transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                className={cn(
                  "absolute -bottom-24 -left-24 w-48 h-48 rounded-full blur-3xl transition-opacity duration-500",
                  `bg-gradient-to-br ${mood.gradient}`,
                  isSelected ? "opacity-30" : "opacity-0 group-hover:opacity-10"
                )} 
              />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-5">
              {/* Emoji with Glow */}
              <motion.div
                animate={isSelected ? { 
                  scale: [1, 1.08, 1],
                  rotate: [0, -3, 3, 0]
                } : {}}
                transition={{ duration: 1.5, repeat: isSelected ? Infinity : 0, repeatDelay: 2 }}
                className="relative"
              >
                {/* Glow Ring */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={cn(
                      "absolute inset-0 rounded-full blur-2xl",
                      `bg-gradient-to-br ${mood.gradient}`
                    )}
                  />
                )}
                <span className="relative text-7xl md:text-8xl drop-shadow-lg filter">{mood.emoji}</span>
              </motion.div>

              {/* Label */}
              <div className="text-center space-y-2">
                <motion.h3
                  layout
                  className={cn(
                    "text-2xl md:text-3xl font-bold transition-all duration-300",
                    isSelected 
                      ? `bg-gradient-to-r ${mood.gradient} bg-clip-text text-transparent` 
                      : "text-foreground"
                  )}
                >
                  {mood.label}
                </motion.h3>
                <p className={cn(
                  "text-sm md:text-base transition-colors duration-300",
                  isSelected ? "text-foreground/80" : "text-muted-foreground"
                )}>
                  {mood.description}
                </p>
              </div>
            </div>

            {/* Selection Ring Animation */}
            {isSelected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "absolute inset-0 rounded-3xl border-3",
                  mood.type === "good" && "border-emerald-500/50",
                  mood.type === "normal" && "border-amber-500/50",
                  mood.type === "bad" && "border-rose-500/50"
                )}
              />
            )}

            {/* Pulse Ring on Hover */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileHover={{ opacity: 0.5, scale: 1 }}
              className={cn(
                "absolute inset-0 rounded-3xl border-2 transition-all duration-300",
                mood.type === "good" && "border-emerald-500/30",
                mood.type === "normal" && "border-amber-500/30",
                mood.type === "bad" && "border-rose-500/30"
              )}
            />
          </motion.button>
        );
      })}
    </motion.div>
  );
};