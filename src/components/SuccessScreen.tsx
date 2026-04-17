import { CheckCircle2, Shield, Sparkles, Heart, PartyPopper } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";

interface SuccessScreenProps {
  onComplete: () => void;
}

const confettiColors = [
  "bg-emerald-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-yellow-500",
  "bg-orange-500",
  "bg-cyan-500",
  "bg-rose-500",
];

export const SuccessScreen = ({ onComplete }: SuccessScreenProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative w-full max-w-md space-y-8 text-center"
    >
      {/* Confetti Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * 400 - 200,
              y: -20,
              rotate: 0,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: 600,
              rotate: Math.random() * 720 - 360,
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: Math.random() * 2 + 2,
              delay: Math.random() * 0.8,
              ease: "easeOut",
            }}
            className={`absolute w-3 h-3 ${i % 3 === 0 ? "rounded-full" : i % 3 === 1 ? "rounded-sm" : ""} ${confettiColors[i % confettiColors.length]}`}
            style={{ left: `${Math.random() * 100}%` }}
          />
        ))}
      </div>

      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        className="relative mx-auto"
      >
        {/* Multiple Pulsing Rings */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 w-36 h-36 mx-auto rounded-full bg-gradient-to-r from-emerald-400 to-green-500 blur-2xl -translate-x-2"
        />
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
          className="absolute inset-0 w-36 h-36 mx-auto rounded-full bg-gradient-to-r from-cyan-400 to-emerald-500 blur-3xl translate-x-2"
        />
        
        {/* Icon Container */}
        <motion.div
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
          className="relative w-36 h-36 mx-auto rounded-full bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-500/40"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          >
            <CheckCircle2 className="w-18 h-18 text-white" strokeWidth={2.5} />
          </motion.div>
          
          {/* Inner Glow */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-t from-white/0 to-white/20" />
        </motion.div>

        {/* Sparkles */}
        <motion.div
          initial={{ opacity: 0, scale: 0, rotate: -45 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.6, type: "spring" }}
          className="absolute -top-2 -right-4"
        >
          <Sparkles className="w-8 h-8 text-yellow-500 fill-yellow-500/30" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0, rotate: 45 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.7, type: "spring" }}
          className="absolute -bottom-1 -left-5"
        >
          <PartyPopper className="w-7 h-7 text-purple-500" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: "spring" }}
          className="absolute top-6 -left-6"
        >
          <Sparkles className="w-5 h-5 text-primary" />
        </motion.div>
      </motion.div>

      {/* Text Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 bg-clip-text text-transparent">
          Təşəkkürlər!
        </h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xl text-muted-foreground flex items-center justify-center gap-2"
        >
          Rəyiniz uğurla qeydə alındı
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
          >
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
          </motion.span>
        </motion.p>
      </motion.div>

      {/* Privacy Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm p-6 shadow-xl"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",
            backgroundSize: "20px 20px"
          }} />
        </div>
        
        {/* Gradient Border Effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-emerald-500/10" />

        <div className="relative space-y-3">
          <div className="flex items-center justify-center gap-2 text-primary">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Shield className="w-6 h-6" />
            </motion.div>
            <span className="font-bold text-lg">Tam Məxfilik</span>
          </div>
          <p className="text-muted-foreground text-sm md:text-base">
            Cavabınız tamamilə anonimdir və yalnız ümumi statistikada istifadə olunur.
          </p>
        </div>
      </motion.div>

      {/* Close Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={onComplete}
            size="lg"
            className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-xl shadow-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/40"
          >
            Bağla
          </Button>
        </motion.div>
      </motion.div>

      {/* Farewell Message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-sm text-muted-foreground flex items-center justify-center gap-2"
      >
        <span>Görüşənədək! Sabah yenə qarşınızda olacağıq</span>
        <motion.span
          animate={{ rotate: [0, 20, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
        >
          👋
        </motion.span>
      </motion.p>
    </motion.div>
  );
};