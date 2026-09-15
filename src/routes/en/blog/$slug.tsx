import { createFileRoute } from "@tanstack/react-router";
import type { ComponentType } from "react";
import NotFound from "@/pages/NotFound";
import BlogCumInvetiArabaLibaneza from "@/pages/blog/CumInvetiArabaLibaneza";
import BlogArabaLibanezaVsArabaStandard from "@/pages/blog/ArabaLibanezaVsArabaStandard";
import BlogPrimele20Expresii from "@/pages/blog/Primele20Expresii";
import BlogCatCostaCursurile from "@/pages/blog/CatCostaCursurile";
import BlogAlfabetulArab from "@/pages/blog/AlfabetulArab";
import BlogCeEsteArabizi from "@/pages/blog/CeEsteArabizi";
import BlogCulturaLibaneza from "@/pages/blog/CulturaLibaneza";
import BlogCumSalutiInLibaneza from "@/pages/blog/CumSalutiInLibaneza";
import BlogCatDureaza from "@/pages/blog/CatDureaza";
import BlogArabaPentruCopii from "@/pages/blog/ArabaPentruCopii";
import BlogCumAlegiProfesor from "@/pages/blog/CumAlegiProfesor";
import BlogInvataArabaOnline from "@/pages/blog/InvataArabaOnline";
import BlogNumereInLibaneza from "@/pages/blog/NumereInLibaneza";
import BlogGramaticaArabaLibaneza from "@/pages/blog/GramaticaArabaLibaneza";
import BlogLebaneseArabicPhrases from "@/pages/blog/LebaneseArabicPhrases";
import BlogLebaneseFamilyVocabulary from "@/pages/blog/LebaneseFamilyVocabulary";
import BlogDeCeInvatamAraba2026 from "@/pages/blog/DeCeInvatamAraba2026";
import BlogLimbileVorbiteInLiban from "@/pages/blog/LimbileVorbiteInLiban";
import BlogLebaneseArabicLearningResources from "@/pages/blog/LebaneseArabicLearningResources";

/**
 * English twins of the blog, at /en/blog/<same-slug>. Every article component
 * is bilingual — LanguageFromPath (in __root.tsx) forces English on /en/.
 * (Ported unchanged from the old App.tsx BLOG_COMPONENTS map.)
 */
const BLOG_COMPONENTS: Record<string, ComponentType> = {
  "cum-inveti-araba-libaneza": BlogCumInvetiArabaLibaneza,
  "araba-libaneza-vs-araba-standard": BlogArabaLibanezaVsArabaStandard,
  "primele-20-de-expresii-libaneze": BlogPrimele20Expresii,
  "cat-costa-cursurile-de-araba-libaneza": BlogCatCostaCursurile,
  "alfabetul-arab-pentru-incepatori": BlogAlfabetulArab,
  "ce-este-arabizi": BlogCeEsteArabizi,
  "cultura-libaneza-obiceiuri-mancare-traditii": BlogCulturaLibaneza,
  "cum-saluti-in-libaneza": BlogCumSalutiInLibaneza,
  "cat-dureaza-sa-inveti-araba-libaneza": BlogCatDureaza,
  "araba-pentru-copii-ghidul-parintilor": BlogArabaPentruCopii,
  "cum-alegi-profesor-de-araba": BlogCumAlegiProfesor,
  "invata-araba-libaneza-online": BlogInvataArabaOnline,
  "numere-in-araba-libaneza": BlogNumereInLibaneza,
  "gramatica-arabei-libaneze": BlogGramaticaArabaLibaneza,
  "lebanese-arabic-phrases": BlogLebaneseArabicPhrases,
  "lebanese-family-vocabulary": BlogLebaneseFamilyVocabulary,
  "de-ce-invatam-araba-in-2026": BlogDeCeInvatamAraba2026,
  "limbile-vorbite-in-liban": BlogLimbileVorbiteInLiban,
  "lebanese-arabic-learning-resources": BlogLebaneseArabicLearningResources,
};

function EnBlogPost() {
  const { slug } = Route.useParams();
  const Post = slug ? BLOG_COMPONENTS[slug] : undefined;
  return Post ? <Post /> : <NotFound />;
}

export const Route = createFileRoute("/en/blog/$slug")({
  component: EnBlogPost,
});
