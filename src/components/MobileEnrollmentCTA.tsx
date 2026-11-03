import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import AnchorLink from "@/components/AnchorLink";

/**
 * The phone's "Înscrie-te rapid" bar on the homepage.
 *
 * It used to sit over everything at the bottom of the screen: over the group
 * card's own sign-up button and over the "Întreabă despre cursuri" assistant
 * button (audit, 1 Nov 2026). It now steps aside while the course cards it
 * points to are on screen, and while it shows it marks the page
 * (data-mobile-cta) so the assistant button sits above it (styles.css).
 */
const MobileEnrollmentCTA = () => {
  const { t } = useI18n();
  const [programsVisible, setProgramsVisible] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setProgramsVisible(!!entry?.isIntersecting),
      { threshold: 0.05 },
    );
    // The course cards load lazily: wait for them to appear.
    let timer: ReturnType<typeof setInterval> | undefined;
    const attach = () => {
      const target = document.getElementById("programs");
      if (!target) return false;
      io.observe(target);
      return true;
    };
    if (!attach()) {
      let tries = 0;
      timer = setInterval(() => {
        if (attach() || ++tries > 40) clearInterval(timer);
      }, 250);
    }
    return () => {
      if (timer) clearInterval(timer);
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    const body = document.body;
    if (programsVisible) delete body.dataset["mobileCta"];
    else body.dataset["mobileCta"] = "1";
    return () => {
      delete body.dataset["mobileCta"];
    };
  }, [programsVisible]);

  if (programsVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 px-4 py-3 shadow-lg backdrop-blur-md md:hidden">
      <AnchorLink
        to="#programs"
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
