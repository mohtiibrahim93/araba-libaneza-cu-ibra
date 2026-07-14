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
 * Header logo: the cedar inside a red-ringed speech bubble — a compact echo
 * of the round "7ki Lebnene" campaign badge (speech bubble = spoken Lebanese).
 * Pure vector, themed via the token classes, legible at 40px.
 */
export const CedarRoundel = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 52" aria-hidden="true" className={className} focusable="false">
    {/* speech-bubble tail */}
    <path d="M13 40.5 17.5 49l3-8z" className="fill-primary" />
    {/* badge disc */}
    <circle cx="24" cy="22.5" r="20.5" className="fill-cream stroke-primary" strokeWidth="2.6" />
    {/* cedar, centered in the disc */}
    <g transform="translate(9.6 6.6) scale(1.2)" className="fill-brand-green">
      <ellipse cx="12" cy="3.4" rx="1.8" ry="1.3" />
      <ellipse cx="12" cy="6.6" rx="3.6" ry="1.5" />
      <ellipse cx="12" cy="10.1" rx="5.6" ry="1.7" />
      <ellipse cx="12" cy="13.8" rx="7.6" ry="1.9" />
      <path d="M10.9 15.5h2.2V21a1.1 1.1 0 0 1-2.2 0v-5.5z" />
    </g>
  </svg>
);

interface BrandLogoProps {
  /** Footer variant: 7ki Lebnene lead + Arabic + institution line, may wrap. */
  full?: boolean;
  className?: string;
}

/**
 * Brand lockup.
 * Header (default): roundel badge + "Centrul de Arabă Libaneză" (bold serif)
 * with "arabă libaneză cu Ibra" beneath.
 * Footer (full): 7ki Lebnene / حكي لبناني lead with the institution line.
 */
const BrandLogo = ({ full, className }: BrandLogoProps) => {
  if (full) {
    return (
      <span className={cn("flex min-w-0 items-center gap-3", className)}>
        <CedarRoundel className="h-11 w-auto shrink-0" />
        <span className="flex min-w-0 flex-col gap-0.5 leading-tight">
          <span className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-display text-lg font-bold tracking-tight sm:text-xl">
              <span className="text-brand-green">7ki</span>{" "}
              <span className="text-primary">Lebnene</span>
            </span>
            <span dir="rtl" lang="ar" className="font-arabic text-base font-semibold text-brand-green">
              حكي لبناني
            </span>
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Centrul de Arabă Libaneză · cu Ibra
          </span>
        </span>
      </span>
    );
  }

  return (
    <span className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <CedarRoundel className="h-10 w-auto shrink-0" />
      <span className="flex min-w-0 flex-col leading-tight">
        {/* Phones: the full name on max two tight lines, descriptor hidden. */}
        <span className="font-display text-[13px] font-bold tracking-tight text-foreground leading-[1.2] line-clamp-2 sm:text-lg sm:leading-tight sm:line-clamp-1">
          Centrul de Arabă Libaneză
        </span>
        <span className="hidden sm:block text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          arabă libaneză cu Ibra
        </span>
      </span>
    </span>
  );
};

export default BrandLogo;
