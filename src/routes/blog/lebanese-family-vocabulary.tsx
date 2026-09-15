import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import LebaneseFamilyVocabulary from "@/pages/blog/LebaneseFamilyVocabulary";

export const Route = createFileRoute("/blog/lebanese-family-vocabulary")({
  head: () => seoHead("/blog/lebanese-family-vocabulary"),
  component: LebaneseFamilyVocabulary,
});
