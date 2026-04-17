import { Bell, BellOff, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const NotificationButton = () => {
  const { isSupported, permission, requestPermission } = useNotifications();

  if (!isSupported) {
    return null;
  }

  const getIcon = () => {
    switch (permission) {
      case "granted":
        return <BellRing className="w-4 h-4" />;
      case "denied":
        return <BellOff className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getTooltip = () => {
    switch (permission) {
      case "granted":
        return "Bildirişlər aktivdir";
      case "denied":
        return "Bildirişlər bloklanıb";
      default:
        return "Bildirişlərə icazə ver";
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant={permission === "granted" ? "default" : "outline"}
            size="sm"
            onClick={requestPermission}
            disabled={permission === "denied"}
            className={`gap-2 rounded-xl relative ${
              permission === "granted" 
                ? "bg-emerald-500/20 text-emerald-600 hover:bg-emerald-500/30 border-emerald-500/30" 
                : "hover:bg-primary/10"
            }`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={permission}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ duration: 0.2 }}
              >
                {getIcon()}
              </motion.div>
            </AnimatePresence>
            
            {/* Pulse animation for granted state */}
            {permission === "granted" && (
              <motion.span
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500"
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </Button>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{getTooltip()}</p>
      </TooltipContent>
    </Tooltip>
  );
};
