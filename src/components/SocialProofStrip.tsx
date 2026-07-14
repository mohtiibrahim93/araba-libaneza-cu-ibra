import { Star, ExternalLink, GraduationCap, Users, Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n";

/**
 * Trust band under the hero (Ref A layout, real data only):
 * verified Preply rating + verifiable facts about the school.
 */
const SocialProofStrip = () => {
  const { t } = useI18n();

  return (
    <div className="border-y border-border/60 bg-background">
      <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
        <a
          href="https://preply.com/en/tutor/471612"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 group"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Star className="w-5 h-5 fill-primary text-primary" />
          </span>
          <span className="min-w-0">
            <span className="block text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
              5.0<span aria-hidden="true">★</span>
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              {t.socialProofPreplyMeta.replace("5.0★ · ", "")}
              <ExternalLink className="w-3 h-3" />
            </span>
          </span>
        </a>

        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-green/10">
            <GraduationCap className="w-5 h-5 text-brand-green" />
          </span>
          <span>
            <span className="block text-sm font-bold text-foreground leading-tight">{t.heroCheck1}</span>
            <span className="text-xs text-muted-foreground">{t.whyStat2Val}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-green/10">
            <Users className="w-5 h-5 text-brand-green" />
          </span>
          <span>
            <span className="block text-sm font-bold text-foreground leading-tight">{t.heroCheck3}</span>
            <span className="text-xs text-muted-foreground">{t.heroCheck2}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-green/10">
            <Globe className="w-5 h-5 text-brand-green" />
          </span>
          <span>
            <span className="block text-sm font-bold text-foreground leading-tight">{t.heroCheck4}</span>
            <span className="text-xs text-muted-foreground">București · Zoom</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default SocialProofStrip;
