import { useI18n } from "@/lib/i18n";
import { Star } from "lucide-react";
import { Link } from "@/components/LocalizedLink";

/** One compact row of facts already stated elsewhere on the site. */
const HomeTrustStrip = () => {
  const { lang } = useI18n();
  const en = lang === "en";
  const item =
    "inline-flex items-center gap-1.5 text-sm font-medium text-foreground";
  return (
    <div className="border-y border-[#E7E1D6] bg-card px-gutter py-4 dark:border-border">
      <ul className="w-full max-w-content mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        <li>
          <a
            href="https://preply.com/en/tutor/471612"
            target="_blank"
            rel="noopener noreferrer"
            className={`${item} hover:text-primary transition-colors`}
          >
            <Star className="h-4 w-4 fill-primary text-primary" aria-hidden="true" />
            {en ? "5.0★ · 21 Preply reviews" : "5.0★ · 21 recenzii Preply"}
          </a>
        </li>
        <li className={item}>{en ? "6+ years teaching" : "6+ ani experiență"}</li>
        <li className={item}>{en ? "370+ lessons" : "370+ lecții"}</li>
        <li>
          <Link to="/trial" className={`${item} text-primary hover:underline underline-offset-4`}>
            {en ? "Free trial lesson" : "Lecția de probă gratuită"}
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default HomeTrustStrip;
