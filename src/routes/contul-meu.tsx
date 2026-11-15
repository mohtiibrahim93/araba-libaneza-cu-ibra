import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import MyAccount from "@/pages/MyAccount";

export const Route = createFileRoute("/contul-meu")({
  head: () => seoHead("/contul-meu"),
  component: () => <MyAccount lang="ro" />,
});
