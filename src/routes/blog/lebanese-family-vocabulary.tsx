import { createFileRoute } from "@tanstack/react-router";
import LebaneseFamilyVocabulary from "@/pages/blog/LebaneseFamilyVocabulary";

export const Route = createFileRoute("/blog/lebanese-family-vocabulary")({
  component: LebaneseFamilyVocabulary,
});
