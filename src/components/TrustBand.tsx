import { useI18n } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Globe, ShieldCheck, Star } from "lucide-react";

const TrustBand = () => {
  const { t } = useI18n();

  const items = [
    {
      icon: GraduationCap,
      label: t.trustStudents,
    },
    {
      icon: Globe,
      label: t.trustNative,
    },
    {
      icon: ShieldCheck,
      label: t.trustRefund,
    },
    {
      icon: Star,
      label: t.trustReviews,
    },
  ];

  return (
    <div className="mt-6 rounded-xl border border-border/60 bg-muted/30 px-4 py-4 sm:px-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {items.map((item) => (
          <Badge
            key={item.label}
            variant="outline"
            className="h-auto w-full justify-start gap-2 border-border/50 bg-background/60 px-3 py-2.5 text-xs font-medium text-foreground shadow-none hover:bg-background"
          >
            <item.icon className="h-4 w-4 shrink-0 text-primary" />
            <span className="leading-tight">{item.label}</span>
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default TrustBand;
