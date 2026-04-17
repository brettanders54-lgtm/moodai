import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppLogo } from "@/components/AppLogo";
import { ManagerBranchAssignment } from "@/components/ManagerBranchAssignment";
import { MobileNavMenu } from "@/components/MobileNavMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";

const ManagerAssignments = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-4 min-w-0">
              <AppLogo size="md" onClick={() => navigate("/")} showText={false} />
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-foreground truncate">Menecer Təyinatları</h1>
                <p className="text-sm text-muted-foreground truncate">Bölgə menecerlərinin idarə edilməsi</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1">
                <LanguageSelector />
                <ThemeToggle />
              </div>
              {/* Desktop navigation */}
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/hr-panel")}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  HR Paneli
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    navigate("/auth");
                  }}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">Çıxış</span>
                </Button>
              </div>
              {/* Mobile hamburger menu */}
              <MobileNavMenu showDatePicker={false} />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <ManagerBranchAssignment />
      </div>
    </div>
  );
};

export default ManagerAssignments;
