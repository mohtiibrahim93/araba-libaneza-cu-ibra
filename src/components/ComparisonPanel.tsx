import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, User, Baby, ArrowLeft, Check } from "lucide-react";
import RegistrationFormSection from "@/components/RegistrationFormSection";

type Track = "group" | "private" | "kids";

interface ComparisonRow {
  label: string;
  groupValue: string;
  privateValue: string;
  kidsValue: string;
  highlight?: "group" | "private" | "kids" | "all";
}

interface ComparisonPanelProps {
  onBack?: () => void;
}

const ComparisonPanel = ({ onBack }: ComparisonPanelProps) => {
  const { t } = useI18n();
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

  const rows: ComparisonRow[] = [
    {
      label: t.compareRowPrice,
      groupValue: t.compareGroupPrice,
      privateValue: t.comparePrivatePrice,
      kidsValue: t.compareKidsPrice,
      highlight: "all",
    },
    {
      label: t.compareRowStudents,
      groupValue: t.compareGroupStudents,
      privateValue: t.comparePrivateStudents,
      kidsValue: t.compareKidsStudents,
      highlight: "private",
    },
    {
      label: t.compareRowFlexibility,
      groupValue: t.compareGroupFlexibility,
      privateValue: t.comparePrivateFlexibility,
      kidsValue: t.compareKidsFlexibility,
      highlight: "private",
    },
    {
      label: t.compareRowFormat,
      groupValue: t.compareGroupFormat,
      privateValue: t.comparePrivateFormat,
      kidsValue: t.compareKidsFormat,
      highlight: "kids",
    },
    {
      label: t.compareRowBestFor,
      groupValue: t.compareGroupBestFor,
      privateValue: t.comparePrivateBestFor,
      kidsValue: t.compareKidsBestFor,
      highlight: "all",
    },
    {
      label: t.compareRowDiscounts,
      groupValue: t.compareGroupDiscounts,
      privateValue: t.comparePrivateDiscounts,
      kidsValue: t.compareKidsDiscounts,
      highlight: "all",
    },
  ];

  const columns: { track: Track; label: string; icon: React.ReactNode; cta: string }[] = [
    { track: "group", label: t.compareGroupLabel, icon: <Users className="w-5 h-5" />, cta: t.compareSelectGroup },
    { track: "private", label: t.comparePrivateLabel, icon: <User className="w-5 h-5" />, cta: t.compareSelectPrivate },
    { track: "kids", label: t.compareKidsLabel, icon: <Baby className="w-5 h-5" />, cta: t.compareSelectKids },
  ];

  if (selectedTrack) {
    return (
      <section id="courses" className="py-20 px-6 bg-muted/50 scroll-mt-20">
        <div className="max-w-2xl mx-auto bg-background rounded-2xl border border-border p-6 shadow-sm">
          <RegistrationFormSection
            defaultCourseType={selectedTrack}
            embedded
            onBack={() => setSelectedTrack(null)}
          />
        </div>
      </section>
    );
  }

  return (
    <section id="courses" className="py-20 px-6 bg-muted/50 scroll-mt-20">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
            {t.compareTitle}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{t.compareSubtitle}</p>
        </div>

        {/* Desktop: 3 columns */}
        <div className="hidden md:grid md:grid-cols-3 gap-0 rounded-2xl border border-border overflow-hidden bg-background">
          {/* Header row */}
          <div className="bg-muted/60 p-4 border-b border-border" />
          {columns.map((col) => (
            <div
              key={col.track}
              className="bg-muted/60 p-4 border-b border-border flex items-center gap-2 justify-center"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {col.icon}
              </div>
              <span className="font-semibold text-foreground">{col.label}</span>
            </div>
          ))}

          {/* Data rows */}
          {rows.map((row, idx) => (
            <>
              <div
                key={`label-${idx}`}
                className={`p-4 flex items-center text-sm font-medium text-muted-foreground ${idx % 2 === 1 ? "bg-muted/30" : ""} ${idx !== rows.length - 1 ? "border-b border-border" : ""}`}
              >
                {row.label}
              </div>
              {(["group", "private", "kids"] as Track[]).map((track) => (
                <div
                  key={`${track}-${idx}`}
                  className={`p-4 flex items-center justify-center text-sm text-foreground text-center ${idx % 2 === 1 ? "bg-muted/30" : ""} ${idx !== rows.length - 1 ? "border-b border-border" : ""}`}
                >
                  <span
                    className={
                      row.highlight === track || row.highlight === "all"
                        ? "font-semibold text-primary"
                        : ""
                    }
                  >
                    {track === "group" ? row.groupValue : track === "private" ? row.privateValue : row.kidsValue}
                  </span>
                </div>
              ))}
            </>
          ))}

          {/* CTA row */}
          <div className="bg-muted/60 p-4" />
          {columns.map((col) => (
            <div key={col.track} className="bg-muted/60 p-4 flex justify-center">
              <Button onClick={() => setSelectedTrack(col.track)} className="w-full max-w-[180px]">
                {col.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Mobile: swipeable cards */}
        <div className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-2 px-2">
          {columns.map((col) => (
            <Card
              key={col.track}
              className="snap-center shrink-0 w-[85vw] border-border"
            >
              <CardContent className="p-5 space-y-0">
                <div className="flex items-center gap-2 pb-3 border-b border-border mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {col.icon}
                  </div>
                  <span className="font-semibold text-foreground">{col.label}</span>
                </div>
                {rows.map((row, idx) => (
                  <div
                    key={idx}
                    className={`py-3 ${idx !== rows.length - 1 ? "border-b border-border" : ""}`}
                  >
                    <p className="text-xs text-muted-foreground mb-1">{row.label}</p>
                    <p className="text-sm text-foreground font-medium">
                      {col.track === "group" ? row.groupValue : col.track === "private" ? row.privateValue : row.kidsValue}
                    </p>
                  </div>
                ))}
                <div className="pt-3">
                  <Button className="w-full" onClick={() => setSelectedTrack(col.track)}>
                    {col.cta}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile scroll hint */}
        <p className="md:hidden text-center text-xs text-muted-foreground mt-2">
          ← {t.lang === "ro" ? "Glisează pentru a vedea toate opțiunile" : "Swipe to see all options"} →
        </p>

        {/* Back link */}
        <div className="text-center mt-8">
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.compareBackToQuiz}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ComparisonPanel;
