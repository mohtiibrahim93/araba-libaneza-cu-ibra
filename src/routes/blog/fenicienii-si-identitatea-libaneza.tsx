import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import FenicieniiIdentitateaLibaneza from "@/pages/blog/FenicieniiIdentitateaLibaneza";

export const Route = createFileRoute("/blog/fenicienii-si-identitatea-libaneza")({
  head: () => seoHead("/blog/fenicienii-si-identitatea-libaneza"),
  component: FenicieniiIdentitateaLibaneza,
});
