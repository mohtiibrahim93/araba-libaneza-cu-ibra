import { GraduationCap } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import AnchorLink from "@/components/AnchorLink";

const MobileEnrollmentCTA = () => {
  const { t } = useI18n();

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 px-4 py-3 shadow-lg backdrop-blur-md md:hidden">
      <AnchorLink
        to="#courses"
        aria-label={t.mobileEnrollmentCtaLabel}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:bg-primary/90"
      >
        <GraduationCap className="h-4 w-4" aria-hidden="true" />
        <span>{t.mobileEnrollmentCta}</span>
      </AnchorLink>
    </div>
  );
};

export default MobileEnrollmentCTA;