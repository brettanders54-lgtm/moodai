import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";

export interface CmsMenuItem {
  id: string;
  label: string;
  url: string | null;
  icon: string | null;
  menu_group: string;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  open_in_new_tab: boolean;
  children?: CmsMenuItem[];
}

export const useCmsMenus = (menuGroup: string) => {
  const { locale, tField } = useLanguage();

  const { data: rawMenus = [], isLoading } = useQuery({
    queryKey: ["cms_menus_public", menuGroup],
    queryFn: async () => {
      const { data } = await supabase
        .from("cms_menus")
        .select("*")
        .eq("menu_group", menuGroup)
        .eq("is_active", true)
        .order("sort_order");
      return (data || []) as CmsMenuItem[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Build tree and apply translations
  const menus = rawMenus
    .filter(m => !m.parent_id)
    .map(m => ({
      ...m,
      label: locale !== "az" ? (tField("cms_menus", m.id, "label", m.label) || m.label) : m.label,
      children: rawMenus
        .filter(c => c.parent_id === m.id)
        .map(c => ({
          ...c,
          label: locale !== "az" ? (tField("cms_menus", c.id, "label", c.label) || c.label) : c.label,
        })),
    }));

  return { menus, isLoading };
};
