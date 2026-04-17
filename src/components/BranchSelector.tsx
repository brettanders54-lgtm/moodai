import { MapPin, Sparkles, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export type BranchType = string | null;

const branches = [
  { id: "baku", name: "Bakı", icon: "🏙️", gradient: "from-blue-500 to-cyan-400", color: "blue" },
  { id: "ganja", name: "Gəncə", icon: "🌆", gradient: "from-purple-500 to-pink-400", color: "purple" },
  { id: "sumgait", name: "Sumqayıt", icon: "🏭", gradient: "from-slate-500 to-zinc-400", color: "slate" },
  { id: "mingachevir", name: "Mingəçevir", icon: "⚡", gradient: "from-yellow-500 to-orange-400", color: "yellow" },
  { id: "shirvan", name: "Şirvan", icon: "🌾", gradient: "from-green-500 to-emerald-400", color: "green" },
  { id: "lankaran", name: "Lənkəran", icon: "🌊", gradient: "from-teal-500 to-cyan-400", color: "teal" },
  { id: "shaki", name: "Şəki", icon: "🏔️", gradient: "from-indigo-500 to-blue-400", color: "indigo" },
  { id: "quba", name: "Quba", icon: "🍎", gradient: "from-red-500 to-rose-400", color: "red" },
];

interface BranchSelectorProps {
  onBranchSelect: (branch: BranchType) => void;
  selectedBranch: BranchType;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.15,
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
      stiffness: 400,
      damping: 25,
    },
  },
};

export const BranchSelector = ({ onBranchSelect, selectedBranch }: BranchSelectorProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl space-y-8"
    >
      {/* Header Section */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="relative inline-flex items-center justify-center"
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 w-24 h-24 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-3xl blur-2xl" />
          
          <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 via-purple-500/15 to-primary/10 backdrop-blur-sm border border-primary/20 shadow-xl flex items-center justify-center">
            <MapPin className="w-12 h-12 text-primary" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
            Hansı bölgədənsən?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            Sorğunu göndərmək üçün bölgəni seç
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          </p>
        </motion.div>
      </div>

      {/* Branch Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
      >
        {branches.map((branch, index) => {
          const isSelected = selectedBranch === branch.id;
          
          return (
            <motion.button
              key={branch.id}
              variants={itemVariants}
              onClick={() => onBranchSelect(branch.id)}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className={`
                group relative p-5 md:p-6 rounded-2xl border-2 transition-all duration-300 overflow-hidden
                ${isSelected 
                  ? "border-primary shadow-xl shadow-primary/20" 
                  : "border-border/50 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm hover:border-primary/50 hover:shadow-lg"
                }
              `}
            >
              {/* Background Gradient Overlay */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: isSelected ? 0.2 : 0 }}
                whileHover={{ opacity: 0.15 }}
                className={`absolute inset-0 bg-gradient-to-br ${branch.gradient}`} 
              />
              
              {/* Animated Border Glow */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute -inset-px rounded-2xl overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${branch.gradient} opacity-50`} />
                </motion.div>
              )}
              
              {/* Shine Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <motion.div 
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "200%" }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" 
                />
              </div>

              <div className="relative flex flex-col items-center gap-3">
                {/* Emoji Container */}
                <motion.div
                  animate={isSelected ? { scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] } : {}}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <span className="text-4xl md:text-5xl drop-shadow-lg">
                    {branch.icon}
                  </span>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`absolute inset-0 rounded-full bg-gradient-to-r ${branch.gradient} blur-xl`}
                    />
                  )}
                </motion.div>
                
                {/* Name */}
                <div className="flex items-center gap-1">
                  <span className={`
                    font-bold text-base md:text-lg transition-all duration-300
                    ${isSelected 
                      ? "text-primary" 
                      : "text-foreground group-hover:text-primary"
                    }
                  `}>
                    {branch.name}
                  </span>
                  <ChevronRight className={`
                    w-4 h-4 transition-all duration-300
                    ${isSelected 
                      ? "opacity-100 text-primary" 
                      : "opacity-0 group-hover:opacity-100 text-muted-foreground"
                    }
                  `} />
                </div>
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center shadow-lg"
                >
                  <svg className="w-3.5 h-3.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Footer Hint */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm rounded-full px-4 py-2 border border-border/50">
          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Seçdiyiniz bölgə yalnız statistika üçün istifadə olunur
        </span>
      </motion.div>
    </motion.div>
  );
};