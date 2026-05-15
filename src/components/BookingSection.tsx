import { useI18n } from "@/lib/i18n";
import NativeScheduler from "@/components/NativeScheduler";

const BookingSection = () => {
  const { t } = useI18n();

  return (
    <section id="booking" className="py-20 px-6 bg-muted/40 scroll-mt-20">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-sm font-medium text-primary mb-2 block">{t.bookingBadge}</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
            {t.bookingTitle}
          </h2>
          <p className="text-muted-foreground">{t.bookingDesc}</p>
        </div>

        <div className="rounded-2xl border border-border bg-background p-8 shadow-sm">
          <NativeScheduler eventType="trial" />
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
