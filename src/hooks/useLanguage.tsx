import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Locale = "az" | "ru" | "en";

interface CmsContentItem {
  id: string;
  content_key: string;
  content_value: string;
  is_active: boolean;
  section: string;
}

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (contentKey: string, fallback?: string) => string;
  tField: (table: string, contentId: string, field: string, fallback?: string) => string;
  locales: { code: Locale; label: string; flag: string }[];
  /** Raw CMS content including is_active status — for filtering deactivated items */
  cmsContentRaw: CmsContentItem[];
}

const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: "az", label: "Azərbaycan", flag: "🇦🇿" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    return (localStorage.getItem("app_locale") as Locale) || "az";
  });

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("app_locale", l);
    document.documentElement.lang = l;
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  // Fetch all CMS content including is_active (for filtering in UI)
  const { data: cmsContentRaw = [] } = useQuery({
    queryKey: ["cms_content_i18n_raw"],
    queryFn: async () => {
      const { data } = await supabase.from("cms_content").select("id,content_key,content_value,is_active,section");
      return (data || []) as CmsContentItem[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Only active items for t() translation lookups
  const cmsContent = cmsContentRaw.filter(c => c.is_active);

  // Fetch translations for current locale
  const { data: translations = [] } = useQuery({
    queryKey: ["cms_translations_all", locale],
    queryFn: async () => {
      if (locale === "az") return [];
      const { data } = await supabase.from("cms_translations").select("content_id,content_table,field_name,translated_value").eq("locale", locale);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // t() - translate by content_key (for cms_content table)
  const t = useCallback((contentKey: string, fallback?: string): string => {
    const content = cmsContent.find((c: any) => c.content_key === contentKey);
    if (!content) return fallback || contentKey;

    if (locale === "az") return content.content_value;

    const trans = translations.find(
      (tr: any) => tr.content_id === content.id && tr.content_table === "cms_content" && tr.field_name === "content_value"
    );
    return trans?.translated_value || content.content_value;
  }, [cmsContent, translations, locale]);

  // tField() - translate by table/id/field (for any CMS table)
  const tField = useCallback((table: string, contentId: string, field: string, fallback?: string): string => {
    if (locale === "az") return fallback || "";

    const trans = translations.find(
      (tr: any) => tr.content_id === contentId && tr.content_table === table && tr.field_name === field
    );
    return trans?.translated_value || fallback || "";
  }, [translations, locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, tField, locales: LOCALES, cmsContentRaw }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
