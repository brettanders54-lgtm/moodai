import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Home, LayoutDashboard, UserCog, ClipboardCheck, MessageSquare, CalendarIcon, LogOut, Users, Brain, Globe } from "lucide-react";
import { format, subDays } from "date-fns";
import { az } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useCmsMenus } from "@/hooks/useCmsMenus";
import { LanguageSelector } from "@/components/LanguageSelector";

const navItems = [
  { label: "Ana Səhifə", to: "/survey", icon: Home },
  { label: "İdarəetmə Paneli", to: "/dashboard", icon: LayoutDashboard },
  { label: "Proqnozlaşdırıcı Analitika", to: "/analytics", icon: Brain },
  { label: "HR Paneli", to: "/hr-panel", icon: UserCog },
  { label: "Menecer Təyinatları", to: "/manager-assignments", icon: Users },
  { label: "Menecer Tapşırıqları", to: "/manager-actions", icon: ClipboardCheck },
  { label: "İşçi Cavabları", to: "/employee-responses", icon: MessageSquare },
];

interface MobileNavMenuProps {
  dateRange?: { from: Date; to: Date };
  onDateRangeChange?: (range: { from: Date; to: Date }) => void;
  showDatePicker?: boolean;
}

export const MobileNavMenu = ({ dateRange, onDateRangeChange, showDatePicker = false }: MobileNavMenuProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { menus: cmsMenus } = useCmsMenus("main_nav");

  // Use CMS menus if available, fallback to static
  const activeNavItems = cmsMenus.length > 0
    ? cmsMenus.map(m => {
        const iconMap: Record<string, any> = { Home, LayoutDashboard, UserCog, ClipboardCheck, MessageSquare, Brain, Users };
        return { label: m.label, to: m.url || "/", icon: iconMap[m.icon || ""] || Home };
      })
    : navItems;

  const handleNavigate = (to: string) => {
    navigate(to);
    setOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="sm:hidden"
        >
          <Menu className="w-5 h-5" />
          <span className="sr-only">Mobil menyu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col gap-6 pt-8">
       <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="text-left">Naviqasiya</SheetTitle>
            <LanguageSelector variant="outline" size="sm" />
          </div>
        </SheetHeader>
        <nav className="space-y-2 flex-1">
          {activeNavItems.map((item) => {
            const isActive = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Button
                key={item.to}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2",
                  isActive && "shadow-soft"
                )}
                onClick={() => handleNavigate(item.to)}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </nav>

        {/* Date Picker in Mobile Menu */}
        {showDatePicker && dateRange && onDateRangeChange && (
          <div className="pt-4 border-t border-border">
            <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Tarix Aralığı
            </p>
            <div className="text-sm text-muted-foreground mb-3">
              {format(dateRange.from, "dd MMM", { locale: az })} - {format(dateRange.to, "dd MMM yyyy", { locale: az })}
            </div>
            <div className="flex gap-2 flex-wrap mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDateRangeChange({ from: subDays(new Date(), 7), to: new Date() })}
                className="text-xs"
              >
                Son 7 gün
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDateRangeChange({ from: subDays(new Date(), 30), to: new Date() })}
                className="text-xs"
              >
                Son 30 gün
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDateRangeChange({ from: subDays(new Date(), 90), to: new Date() })}
                className="text-xs"
              >
                Son 90 gün
              </Button>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Xüsusi tarix seç
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      onDateRangeChange({ from: range.from, to: range.to });
                    } else if (range?.from) {
                      onDateRangeChange({ from: range.from, to: range.from });
                    }
                  }}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Logout Button */}
        <div className="pt-4 border-t border-border">
          <Button
            variant="destructive"
            className="w-full justify-start gap-2"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            <span>Çıxış</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
