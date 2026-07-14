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

interface BrandLogoProps {
  /** Always render the Arabic line + descriptor (footer); default is responsive. */
  full?: boolean;
  className?: string;
}

/**
 * Compact horizontal brand lockup: cedar mark + "7ki Lebnene" + حكي لبناني +
 * the "Arabă libaneză cu Ibra" descriptor. Text-based (webfonts), not an
 * image — legible at header sizes, translates to dark mode for free.
 */
const BrandLogo = ({ full, className }: BrandLogoProps) => (
  <span className={cn("flex min-w-0 items-center gap-2.5", className)}>
    <CedarMark className="h-8 w-8 shrink-0 text-brand-green" />
    <span className="flex min-w-0 flex-col leading-tight">
      <span className="flex items-baseline gap-2 whitespace-nowrap">
        <span className="font-display text-lg font-bold tracking-tight sm:text-xl">
          <span className="text-brand-green">7ki</span>{" "}
          <span className="text-primary">Lebnene</span>
        </span>
        <span
          dir="rtl"
          lang="ar"
          className={cn(
            "font-arabic text-base font-semibold text-brand-green",
            full ? "inline" : "hidden sm:inline",
          )}
        >
          حكي لبناني
        </span>
      </span>
      <span
        className={cn(
          "text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground",
          full ? "block" : "hidden sm:block",
        )}
      >
        Arabă libaneză cu Ibra
      </span>
    </span>
  </span>
);

export default BrandLogo;
