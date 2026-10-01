import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import { useI18n } from "@/lib/i18n";
import Index from "@/pages/Index";

/**
 * The English homepage: the same bilingual component as /, pinned to English.
 * The i18n provider already starts English on /en URLs; the explicit setLang
 * covers the case where the router was mounted without a matching
 * window.location (tests, and any future embedding), so the page can never
 * paint Romanian copy at an English address.
 */
function EnglishHome() {
  const { setLang } = useI18n();
  useEffect(() => {
    setLang("en");
  }, [setLang]);
  return <Index />;
}

export const Route = createFileRoute("/en/")({
  head: () => seoHead("/en"),
  component: EnglishHome,
});
