import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import TestDeNivel from "@/pages/TestDeNivel";

// The English twin of /test-de-nivel. Every prompt, answer and distractor in
// the placement bank is a T(ro, en) pair, so the test really is bilingual and
// this URL is not advertising a translation that does not exist.
export const Route = createFileRoute("/en/level-test")({
  head: () => seoHead("/en/level-test"),
  component: TestDeNivel,
});
