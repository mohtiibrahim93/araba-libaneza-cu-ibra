import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import MyAccount from "@/pages/MyAccount";

export const Route = createFileRoute("/en/my-account")({
  head: () => seoHead("/en/my-account"),
  component: () => <MyAccount lang="en" />,
});
