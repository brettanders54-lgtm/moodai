import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const DynamicSEO = () => {
  const location = useLocation();

  const { data: seo } = useQuery({
    queryKey: ["cms_seo", location.pathname],
    queryFn: async () => {
      const { data } = await supabase
        .from("cms_seo")
        .select("*")
        .eq("page_path", location.pathname)
        .maybeSingle();
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (!seo) return;

    if (seo.meta_title) document.title = seo.meta_title;

    const setMeta = (name: string, content: string | null, isProperty = false) => {
      if (!content) return;
      const attr = isProperty ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", seo.meta_description);
    setMeta("og:title", seo.og_title || seo.meta_title, true);
    setMeta("og:description", seo.og_description || seo.meta_description, true);
    setMeta("og:image", seo.og_image_url, true);
    setMeta("twitter:title", seo.og_title || seo.meta_title);
    setMeta("twitter:description", seo.og_description || seo.meta_description);
    setMeta("twitter:image", seo.og_image_url);

    if (seo.canonical_url) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = seo.canonical_url;
    }

    if (seo.no_index) {
      setMeta("robots", "noindex,nofollow");
    }
  }, [seo]);

  return null;
};
