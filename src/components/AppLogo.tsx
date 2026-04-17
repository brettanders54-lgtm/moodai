import { Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
  onClick?: () => void;
}

const sizeMap = {
  sm: { container: "w-9 h-9", icon: "w-4 h-4", text: "text-base" },
  md: { container: "w-12 h-12", icon: "w-5 h-5", text: "text-lg" },
  lg: { container: "w-14 h-14", icon: "w-6 h-6", text: "text-xl" },
};

export const AppLogo = ({ size = "md", className, showText = true, onClick }: AppLogoProps) => {
  const s = sizeMap[size];
  return (
    <div
      className={cn("flex items-center gap-3 cursor-pointer select-none", className)}
      onClick={onClick}
    >
      <div className="relative group">
        <div className="absolute inset-0 bg-primary/30 rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
        <div
          className={cn(
            "relative rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30 transition-transform duration-200 group-hover:scale-105",
            s.container
          )}
        >
          <Brain className={cn("text-primary-foreground", s.icon)} />
        </div>
      </div>
      {showText && (
        <span className={cn("font-bold tracking-tight text-foreground", s.text)}>
          MoodAI
        </span>
      )}
    </div>
  );
};
