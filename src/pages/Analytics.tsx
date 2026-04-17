import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Brain } from "lucide-react";
import { PredictiveAnalytics } from "@/components/PredictiveAnalytics";
import { MobileNavMenu } from "@/components/MobileNavMenu";
import { AppLogo } from "@/components/AppLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";

const Analytics = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-primary/10 hidden sm:flex">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <AppLogo size="sm" onClick={() => navigate("/")} showText={false} />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Proqnozlaşdırıcı Analitika</h1>
              <p className="text-sm text-muted-foreground hidden sm:block">1C/SAP məlumatları ilə stress korrelyasiyası</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
            <MobileNavMenu />
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <PredictiveAnalytics />
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-6 rounded-lg bg-muted/30 border border-border/50"
        >
          <h3 className="font-semibold mb-2">Necə işləyir?</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• <strong>Məlumat toplama:</strong> İşçi əhval sorğuları və satış metrikları (1C/SAP test data) birləşdirilir</li>
            <li>• <strong>Korrelyasiya analizi:</strong> Stress səviyyəsi ilə satış/şikayət arasındakı əlaqə hesablanır</li>
            <li>• <strong>AI proqnozu:</strong> Süni intellekt növbəti 3 gün üçün risk proqnozu verir</li>
            <li>• <strong>Tövsiyyələr:</strong> Problemlərin qarşısını almaq üçün konkret addımlar təklif edilir</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
