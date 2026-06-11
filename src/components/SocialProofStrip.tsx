import { Star, ExternalLink } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const SocialProofStrip = () => {
  const { t } = useI18n();
  return (
    <div className="border-y border-border/60 bg-muted/30">
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 text-center">
        <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground font-medium">
          {t.socialProofPreply}
        </div>
        <a
          href="https://preply.com/en/tutor/471612"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
        >
          <span className="inline-flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
            ))}
          </span>
          <span>Preply</span>
          <span className="text-muted-foreground font-normal">{t.socialProofPreplyMeta}</span>
          <ExternalLink className="w-3 h-3 text-muted-foreground" />
        </a>
      </div>
    </div>
  );
};

export default SocialProofStrip;