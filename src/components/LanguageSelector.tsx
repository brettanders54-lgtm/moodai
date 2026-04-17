import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

export const LanguageSelector = ({ variant = "ghost", size = "icon" }: { variant?: "ghost" | "outline"; size?: "icon" | "sm" }) => {
  const { locale, setLocale, locales } = useLanguage();
  const current = locales.find(l => l.code === locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-1.5">
          <Globe className="w-4 h-4" />
          {size !== "icon" && <span className="text-xs">{current?.flag} {current?.code.toUpperCase()}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map(l => (
          <DropdownMenuItem key={l.code} onClick={() => setLocale(l.code)} className={locale === l.code ? "bg-accent" : ""}>
            <span className="mr-2">{l.flag}</span> {l.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
