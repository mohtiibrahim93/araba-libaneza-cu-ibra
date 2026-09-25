import { cn } from "@/lib/utils";

/**
 * Stylized Lebanese cedar: stacked horizontal canopy layers + trunk.
 * Hand-built vector (no raster asset) so it stays crisp at any size and
 * inherits `currentColor` for light/dark theming.
 */
export const CedarMark = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className={className}
    focusable="false"
  >
    <ellipse cx="12" cy="3.4" rx="1.8" ry="1.3" />
    <ellipse cx="12" cy="6.6" rx="3.6" ry="1.5" />
    <ellipse cx="12" cy="10.1" rx="5.6" ry="1.7" />
    <ellipse cx="12" cy="13.8" rx="7.6" ry="1.9" />
    <path d="M10.9 15.5h2.2V21a1.1 1.1 0 0 1-2.2 0v-5.5z" />
  </svg>
);

/**
 * Brand mark: a red tile holding a white speech bubble with a green cedar and
 * a short red line under it (speech bubble = spoken Lebanese). The colours are
 * fixed brand colours, not theme tokens, so the mark reads the same in light
 * and dark mode.
 */
export const BrandMark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 48" aria-hidden="true" className={className} focusable="false">
    <rect width="48" height="48" rx="11" fill="#D8443A" />
    {/* bubble tail, then the bubble over it */}
    <path d="M14 35 17.5 38.5 14 42 10.5 38.5z" fill="#FFFFFF" />
    <rect x="6.5" y="9" width="35" height="30" rx="6" fill="#FFFFFF" />
    <g transform="translate(14.7 13.5) scale(0.1863)" fill="#1F5A3A">
      <path d="M50 4 L64 24 H57 L73 42 H63 L81 62 H67 L88 84 H12 L33 62 H19 L37 42 H27 L43 24 H36 Z" />
      <rect x="45" y="84" width="10" height="14" rx="2" />
    </g>
    <rect x="20.5" y="33.5" width="7" height="1" rx="0.5" fill="#D8443A" />
  </svg>
);

interface BrandLogoProps {
  /** Footer variant: slightly smaller, lines never truncated. */
  full?: boolean;
  className?: string;
}

/** "7KI LEBNEENE · حكي لبناني" — the campaign line under the name. */
const CampaignLine = ({ className }: { className?: string }) => (
  <span className={cn("font-semibold uppercase tracking-[0.16em] text-muted-foreground", className)}>
    7ki Lebneene ·{" "}
    <span dir="rtl" lang="ar" className="font-arabic tracking-normal">
      حكي لبناني
    </span>
  </span>
);

/**
 * Brand lockup: the mark + "Centrul de Arabă Libaneză" (bold serif), with
 * "Arabă Libaneză cu Ibra" and "7KI LEBNEENE · حكي لبناني" beneath.
 * Header (default) shows the name alone on phones, where the bar is too
 * narrow for the two small lines.
 */
const BrandLogo = ({ full, className }: BrandLogoProps) => {
  if (full) {
    return (
      <span className={cn("flex min-w-0 items-center gap-3", className)}>
        <BrandMark className="h-10 w-10 shrink-0" />
        <span className="flex min-w-0 flex-col gap-[3px] leading-tight">
          <span className="font-display text-[17px] font-bold tracking-tight text-foreground">
            Centrul de Arabă Libaneză
          </span>
          <span className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground">
            Arabă Libaneză cu Ibra
          </span>
          <CampaignLine className="text-[10px]" />
        </span>
      </span>
    );
  }

  return (
    <span className={cn("flex min-w-0 items-center gap-2.5 sm:gap-3.5", className)}>
      <BrandMark className="h-[38px] w-[38px] shrink-0 sm:h-12 sm:w-12" />
      <span className="flex min-w-0 flex-col gap-[3px] leading-tight">
        {/* Phones: the full name on max two tight lines. */}
        <span className="font-display text-[13px] font-bold tracking-tight text-foreground leading-[1.2] line-clamp-2 sm:text-[19px] sm:leading-[1.15] sm:line-clamp-1">
          Centrul de Arabă Libaneză
        </span>
        <span className="hidden sm:block text-[10.5px] font-semibold tracking-[0.16em] text-muted-foreground">
          Arabă Libaneză cu Ibra
        </span>
        <CampaignLine className="hidden sm:inline text-[10.5px]" />
      </span>
    </span>
  );
};

export default BrandLogo;
