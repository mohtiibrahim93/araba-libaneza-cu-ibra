import { Instagram, Facebook, Music2, Users } from "lucide-react";
import { SOCIAL_LINKS } from "@/lib/social";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface SocialLinksProps {
  /** "row" = icon buttons (footer); "cards" = labelled buttons (contact section). */
  variant?: "row" | "cards";
  className?: string;
}

/**
 * Renders only the channels that have a real URL configured in
 * src/lib/social.ts — empty slots stay invisible so no dead links ship.
 */
const SocialLinks = ({ variant = "row", className }: SocialLinksProps) => {
  const { lang } = useI18n();

  const channels = [
    {
      url: SOCIAL_LINKS.instagram,
      Icon: Instagram,
      label: "Instagram",
    },
    {
      url: SOCIAL_LINKS.tiktok,
      Icon: Music2,
      label: "TikTok",
    },
    {
      url: SOCIAL_LINKS.facebook,
      Icon: Facebook,
      label: "Facebook",
    },
    {
      url: SOCIAL_LINKS.whatsappCommunity,
      Icon: Users,
      label: lang === "en" ? "WhatsApp community" : "Comunitatea WhatsApp",
    },
  ].filter((c) => c.url);

  if (channels.length === 0) return null;

  if (variant === "cards") {
    return (
      <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-3", className)}>
        {channels.map(({ url, Icon, label }) => (
          <a
            key={label}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-4 text-center hover:border-primary/40 transition-colors"
          >
            <Icon className="w-5 h-5 text-primary" />
            <span className="text-xs font-medium text-foreground">{label}</span>
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {channels.map(({ url, Icon, label }) => (
        <a
          key={label}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
        >
          <Icon className="w-4 h-4" />
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;
